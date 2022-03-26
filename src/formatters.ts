import { Config } from "./config.ts";

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
