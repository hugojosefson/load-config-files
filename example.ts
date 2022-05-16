#!/usr/bin/env -S deno run --allow-read --allow-net=deno.land

import {
  Config,
  CONFIG_FORMATTERS,
  ConfigFormatter,
  loadConfig,
  LoadConfigOptions,
  sortMerger,
  sortTransformer,
} from "./mod.ts";

const options: LoadConfigOptions = {
  verbose: false,
  configMerger: sortMerger(),
  valueTransformers: [sortTransformer()],
};

const [formatterId, configRootPath, ...segments] = Deno.args;
const configRootUrl = new URL(configRootPath, "file:" + Deno.cwd() + "/");
const config: Config = await loadConfig(configRootUrl, segments, options);

const formatter: ConfigFormatter = CONFIG_FORMATTERS[formatterId];
const output: string = await formatter(config);

console.log(output);
