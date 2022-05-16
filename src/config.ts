export type Key = string | number | symbol;
export type Entry<K extends Key, V> = [K, V];
export type Config = Record<Key, unknown>;
export type ConfigMerger =
  | ((previousConfig: Config, currentConfig: Config) => Config)
  | ((previousConfig: Config, currentConfig: Config) => Promise<Config>);
