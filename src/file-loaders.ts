import { Config } from "./config.ts";
import { parseToml, parseYaml } from "../deps.ts";

export async function importModule(filePath: URL): Promise<Config> {
  const config = await import(filePath.toString());
  const keys = Object.keys(config);
  if (keys.length === 1 && keys[0] === "default") {
    return config.default ?? {};
  }
  return config ?? {};
}

export async function importJson(filePath: URL): Promise<Config> {
  const config = await import(
    filePath.toString(),
    {
      assert: { type: "json" },
    }
  );
  return config.default ?? {};
}

export async function loadToml(filePath: URL): Promise<Config> {
  return parseToml(await Deno.readTextFile(filePath)) ?? {};
}

export async function loadYaml(filePath: URL): Promise<Config> {
  return ((await parseYaml(await Deno.readTextFile(filePath))) ?? {}) as Config;
}

export interface FileLoader {
  (filePath: URL): Promise<Config>;
}

export type FileLoaders = Record<string, FileLoader>;
export const DEFAULT_FILE_LOADERS: FileLoaders = {
  js: importModule,
  json: importJson,
  mjs: importModule,
  toml: loadToml,
  ts: importModule,
  yml: loadYaml,
  yaml: loadYaml,
};
