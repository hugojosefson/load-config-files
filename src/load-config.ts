import { resolve } from "../deps.ts";
import { Config, ConfigMerger } from "./config.ts";
import { FileLoader, FileLoaders } from "./file-loaders.ts";
import { DEFAULT_OPTIONS, LoadConfigOptions } from "./options.ts";
import {
  asConfigTransformer,
  composeConfigTransformers,
  ConfigTransformer,
} from "./transformers.ts";

async function loadConfigFromFile(
  fileLoader: FileLoader,
  filePath: URL,
  configTransformer: ConfigTransformer,
  ignoreErrorCodes: string[],
  verbose: boolean,
) {
  try {
    const loadedConfig = await fileLoader(filePath);
    const transformedConfig: Config = await configTransformer(loadedConfig);
    if (verbose) {
      console.error(filePath.toString(), transformedConfig);
    }
    return transformedConfig;
  } catch (error) {
    if (ignoreErrorCodes.includes(error?.code)) {
      if (verbose) {
        console.error(filePath.toString(), error.code);
      }
      return {};
    }
    console.error(
      `
==============================================================================
Unexpected error.code ${JSON.stringify(error.code)} when reading
${filePath}
using ${fileLoader.name}.
------------------------------------------------------------------------------`,
    );
    throw error;
  }
}

async function loadConfigFromSeveralFileExtensions(
  filepathWithoutExtension: URL,
  configMerger: ConfigMerger,
  configTransformer: ConfigTransformer,
  ignoreErrorCodes: string[],
  fileLoaders: FileLoaders,
  verbose: boolean,
): Promise<Config> {
  const loaderEntries: [string, FileLoader][] = Object.entries(fileLoaders);
  const loadedConfigs = await Promise.all(
    loaderEntries.map(async function ([extension, fileLoader]) {
      const filePath: URL = new URL(filepathWithoutExtension.toString());
      filePath.pathname += "." + extension;
      return await loadConfigFromFile(
        fileLoader,
        filePath,
        configTransformer,
        ignoreErrorCodes,
        verbose,
      );
    }),
  );

  let resultingConfig = {};
  for (const loadedConfig of loadedConfigs) {
    resultingConfig = await configMerger(resultingConfig, loadedConfig);
  }
  return resultingConfig;
}

async function mergeConfigFromSeveralFileExtensions(
  config: Config,
  filepathWithoutExtension: URL,
  configMerger: ConfigMerger,
  configTransformer: ConfigTransformer,
  ignoreErrorCodes: string[],
  fileLoaders: FileLoaders,
  verbose: boolean,
): Promise<Config> {
  return configMerger(
    config,
    await loadConfigFromSeveralFileExtensions(
      filepathWithoutExtension,
      configMerger,
      configTransformer,
      ignoreErrorCodes,
      fileLoaders,
      verbose,
    ),
  );
}

export async function loadConfig(
  configRoot: URL,
  pathSegments: string[],
  options: LoadConfigOptions = DEFAULT_OPTIONS,
): Promise<Config> {
  const {
    configMerger,
    commonNames,
    ignoreErrorCodes,
    fileLoaders,
    valueTransformers,
    configTransformers,
    verbose,
  } = Object.assign(
    {},
    DEFAULT_OPTIONS,
    options,
  );

  const configTransformer = composeConfigTransformers([
    asConfigTransformer(valueTransformers),
    ...configTransformers,
  ]);

  const pathSegmentsToSearch = [
    [],
    ...commonNames.map((commonName) => [commonName]),
  ];

  const lastSegment: string | undefined = pathSegments[pathSegments.length - 1];
  if (lastSegment) {
    pathSegmentsToSearch.push([lastSegment]);
  }

  let resultingConfig = {};
  for (let i = -1; i < pathSegments.length; i++) {
    for (const extraPathSegments of pathSegmentsToSearch) {
      const newPathname = resolve(
        configRoot.pathname,
        ...pathSegments.slice(0, i + 1),
        ...extraPathSegments,
      );
      resultingConfig = await mergeConfigFromSeveralFileExtensions(
        resultingConfig,
        new URL(newPathname, configRoot),
        configMerger,
        configTransformer,
        ignoreErrorCodes,
        fileLoaders,
        verbose,
      );
    }
  }
  return resultingConfig;
}
