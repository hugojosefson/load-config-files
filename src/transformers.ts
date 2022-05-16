import { Config, ConfigMerger, Entry, Key } from "./config.ts";
import { toObject } from "https://deno.land/x/to_object@0.0.1/mod.ts";

export type ValueTransformer =
  | ((value: unknown) => unknown)
  | ((value: unknown) => Promise<unknown>);

export type ConfigTransformer =
  | ((config: Config) => Config)
  | ((config: Config) => Promise<Config>);

function identity<T>(a: T): T {
  return a;
}

function isRecord<K extends Key, V>(
  value: (unknown | Record<K, V>),
): value is Record<K, V> {
  return (!!value && typeof value === "object" && !Array.isArray(value));
}

/**
 * Returns something you can use as a ConfigTransformer and/or a ValueTransformer, to sort any object by key.
 */
export function sortTransformer(): ConfigTransformer & ValueTransformer {
  return function <T extends (Config | unknown)>(value: T): T {
    if (!isRecord(value)) {
      return value;
    }
    const entries = Object.entries(value);
    const keys = entries.map(([key]) => key);
    if (!keys.every((key) => typeof key === "string")) {
      return value;
    }
    return entries
      .sort(
        (
          [keyA, _valueA]: Entry<string, unknown>,
          [keyB, _valueB]: Entry<string, unknown>,
        ) => keyA.localeCompare(keyB),
      )
      .reduce(toObject, {}) as T;
  };
}

/**
 * Wraps any ConfigMerger, so it returns the same, but sorted by key.
 * @param mergerToWrap Existing ConfigMerger to wrap, or the default Object#assign if undefined
 */
export function sortMerger(
  mergerToWrap: ConfigMerger = Object.assign,
): ConfigMerger {
  const transformer = sortTransformer();
  return async function (a: Config, b: Config): Promise<Config> {
    return transformer(await mergerToWrap(a, b));
  };
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
