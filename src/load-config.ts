import { Config, ConfigMerger } from "./config.ts";
import { FileLoader, FileLoaders } from "./file-loaders.ts";
import { DEFAULT_OPTIONS, LoadConfigOptions } from "./options.ts";
import { resolve } from "../deps.ts";

async function loadConfigFromFile(
  fileLoader: FileLoader,
  filePath: URL,
  ignoreErrorCodes: string[],
  verbose: boolean,
) {
  try {
    const loadedConfig = await fileLoader(filePath);
    if (verbose) {
      console.error(filePath.toString(), loadedConfig);
    }
    return loadedConfig;
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
  ignoreErrorCodes: string[],
  fileLoaders: FileLoaders,
  verbose: boolean,
): Promise<Config> {
  return configMerger(
    config,
    await loadConfigFromSeveralFileExtensions(
      filepathWithoutExtension,
      configMerger,
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
    verbose,
  } = Object.assign(
    {},
    DEFAULT_OPTIONS,
    options,
  );

  const pathSegmentsToSearch = [
    [],
    ...commonNames.map((commonName) => [commonName]),
  ];

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
        ignoreErrorCodes,
        fileLoaders,
        verbose,
      );
    }
  }
  return resultingConfig;
}
