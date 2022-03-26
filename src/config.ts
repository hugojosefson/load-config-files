export type Config = Record<string | number | symbol, unknown>;
export type ConfigMerger =
  | ((previousConfig: Config, currentConfig: Config) => Config)
  | ((previousConfig: Config, currentConfig: Config) => Promise<Config>);
