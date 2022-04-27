import { DEFAULT_FILE_LOADERS, FileLoaders } from "./file-loaders.ts";
import { ConfigMerger } from "./config.ts";
import { ConfigTransformer, ValueTransformer } from "./transformers.ts";

export type LoadConfigOptions = Partial<AllLoadConfigOptions>;

interface AllLoadConfigOptions {
  configMerger: ConfigMerger;
  commonNames: string[];
  ignoreErrorCodes: string[];
  fileLoaders: FileLoaders;
  valueTransformers: ValueTransformer[];
  configTransformers: ConfigTransformer[];
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
  valueTransformers: [],
  configTransformers: [],
  verbose: false,
};
