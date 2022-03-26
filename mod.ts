import { resolve } from "https://deno.land/std@0.132.0/path/mod.ts";
import { parse as parseToml } from "https://deno.land/std@0.132.0/encoding/toml.ts";
import { parse as parseYaml } from "https://deno.land/std@0.132.0/encoding/yaml.ts";

export type Config = Record<string | number | symbol, unknown>;

export interface FileLoader {
  (filePath: URL): Promise<Config>;
}

export type ConfigMerger =
  | ((previousConfig: Config, currentConfig: Config) => Config)
  | ((previousConfig: Config, currentConfig: Config) => Promise<Config>);

export function orLoader(
  firstLoader: FileLoader,
  ...alternativeLoaders: FileLoader[]
): FileLoader {
  if (typeof firstLoader === "undefined") {
    return () => Promise.resolve({});
  }
  if (alternativeLoaders.length === 0) {
    return firstLoader;
  }
  return async function (filePath: URL): Promise<Config> {
    try {
      return await firstLoader(filePath);
    } catch {
      const [nextLoader, ...nextAlternativeLoaders] = alternativeLoaders;
      return await orLoader(nextLoader, ...nextAlternativeLoaders)(filePath);
    }
  };
}

async function importModule(filePath: URL): Promise<Config> {
  const config = await import(filePath.toString());
  const keys = Object.keys(config);
  if (keys.length === 1 && keys[0] === "default") {
    return config.default;
  }
  return config;
}
async function importJson(filePath: URL): Promise<Config> {
  const config = await import(
    filePath.toString(),
    {
      assert: { type: "json" },
    }
  );
  return config.default;
}
async function loadToml(filePath: URL): Promise<Config> {
  return parseToml(await Deno.readTextFile(filePath));
}
async function loadYaml(filePath: URL): Promise<Config> {
  return (await parseYaml(await Deno.readTextFile(filePath))) as Config;
}

const DEFAULT_FILE_LOADERS: FileLoaders = {
  js: importModule,
  json: importJson,
  mjs: importModule,
  toml: loadToml,
  ts: importModule,
  yml: loadYaml,
  yaml: loadYaml,
};

async function loadFile(
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
    }),
  );

  let resultingConfig = {};
  for (const loadedConfig of loadedConfigs) {
    resultingConfig = await configMerger(resultingConfig, loadedConfig);
  }
  return resultingConfig;
}

async function populateConfigFromFile(
  config: Config,
  filepathWithoutExtension: URL,
  configMerger: ConfigMerger,
  ignoreErrorCodes: string[],
  fileLoaders: FileLoaders,
  verbose: boolean,
): Promise<Config> {
  return await configMerger(
    config,
    await loadFile(
      filepathWithoutExtension,
      configMerger,
      ignoreErrorCodes,
      fileLoaders,
      verbose,
    ),
  );
}

export type FileLoaders = Record<string, FileLoader>;
export type LoadConfigOptions = Partial<AllLoadConfigOptions>;
interface AllLoadConfigOptions {
  configMerger: ConfigMerger;
  commonNames: string[];
  ignoreErrorCodes: string[];
  fileLoaders: FileLoaders;
  verbose: boolean;
}

export const DEFAULT_OPTIONS: AllLoadConfigOptions = {
  configMerger: Object.assign,
  commonNames: ["common", "index"],
  ignoreErrorCodes: [
    "ERR_MODULE_NOT_FOUND",
    "MODULE_NOT_FOUND",
    "ENOENT",
  ],
  fileLoaders: DEFAULT_FILE_LOADERS,
  verbose: false,
};

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
      const newURL = new URL(
        newPathname,
        configRoot,
      );
      resultingConfig = await populateConfigFromFile(
        resultingConfig,
        newURL,
        configMerger,
        ignoreErrorCodes,
        fileLoaders,
        verbose,
      );
    }
  }
  return resultingConfig;
}

export function shellQuoteString(value: string): string {
  return `'${value.replaceAll(/\'/g, `'"'"'`)}'`;
}

export function formatValue(value: unknown): string {
  if (typeof value === "string") {
    return shellQuoteString(value);
  }
  if (typeof value === "undefined") {
    return "";
  }
  if (typeof value === "number") {
    return `${value}`;
  }
  return shellQuoteString(JSON.stringify(value));
}

export type ConfigFormatter =
  | ((config: Config) => string)
  | ((config: Config) => Promise<string>);

function jsonFormatter(config: Config) {
  return JSON.stringify(config, null, 2);
}

function shellFormatter(config: Config) {
  return Object.entries(config)
    .map(([key, value]) => [key, formatValue(value)].join(`=`))
    .join("\n");
}

function springShellFormatter(config: Config) {
  return shellFormatter({ SPRING_APPLICATION_JSON: config });
}

export const CONFIG_FORMATTERS: Record<string, ConfigFormatter> = {
  json: jsonFormatter,
  shell: shellFormatter,
  spring_shell: springShellFormatter,
};
