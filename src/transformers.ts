import { Config } from "./config.ts";

export type ValueTransformer =
  | ((value: unknown) => unknown)
  | ((value: unknown) => Promise<unknown>);

export type ConfigTransformer =
  | ((config: Config) => Config)
  | ((config: Config) => Promise<Config>);

function identity<T>(a: T): T {
  return a;
}

export function composeConfigTransformers(
  configTransformers: ConfigTransformer[],
): ConfigTransformer {
  configTransformers = configTransformers.filter((t) => t !== identity);
  if (configTransformers.length === 0) {
    return identity;
  }
  return async function (config: Config): Promise<Config> {
    let result = config;
    for (const transformer of configTransformers) {
      result = await transformer(result);
    }
    return result;
  };
}

export function composeValueTransformers(
  valueTransformers: ValueTransformer[],
): ValueTransformer {
  valueTransformers = valueTransformers.filter((t) => t !== identity);
  if (valueTransformers.length === 0) {
    return identity;
  }
  return async function (value: unknown): Promise<unknown> {
    let result = value;
    for (const transformer of valueTransformers) {
      result = await transformer(result);
    }
    return result;
  };
}

export function asConfigTransformer(
  valueTransformers: ValueTransformer[],
): ConfigTransformer {
  if (valueTransformers.length === 0) {
    return identity;
  }
  return async function (config: Config): Promise<Config> {
    const transformValue = composeValueTransformers(valueTransformers);
    const transformedConfig: Config = {};
    for (const [key, value] of Object.entries(config)) {
      transformedConfig[key] = await transformValue(value);
    }
    return transformedConfig;
  };
}
