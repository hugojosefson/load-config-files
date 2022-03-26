# load_config_files

Loads config files.

Supports joining with common config files, also further up in the directory
structure.

Filetypes supported:

- .toml
- .json
- .yml
- .yaml
- .js
- .mjs
- .ts

## Usage

Set up a directory like
[example-config](https://deno.land/x/load_config_files/example-config), in your
current working directory:

```
example-config/
├── dev/
│   ├── common.js
│   ├── myapp1.toml
│   ├── myapp2.toml
│   └── README.md
└── prod/
    ├── common.json
    ├── myapp1.json
    ├── myapp2.json
    └── README.md
```

```typescript
// example.ts

import {
  Config,
  CONFIG_FORMATTERS,
  ConfigFormatter,
  loadConfig,
  LoadConfigOptions,
} from "https://deno.land/x/load_config_files/mod.ts";

const options: LoadConfigOptions = { verbose: false };

const [formatterId, configRootPath, ...segments] = Deno.args;
const configRootUrl = new URL(configRootPath, "file:" + Deno.cwd());
const config: Config = await loadConfig(configRootUrl, segments, options);

const formatter: ConfigFormatter = CONFIG_FORMATTERS[formatterId];
const output: string = await formatter(config);

console.log(output);
```

Running the above program:

```sh
deno run \
  --allow-read \
  --allow-net=deno.land \
  https://deno.land/x/load_config_files/example.ts \
  shell example-config dev myapp2
```

...would output:

```sh
COLOR='purple'
CUSTOMER_URLS='{"CustomerA":"https://dev.example.com/customers/CustomerA.json","CustomerB":"https://dev.example.com/customers/CustomerB.json","CustomerC":"https://dev.example.com/customers/CustomerC.json","CustomerD":"https://dev.example.com/customers/CustomerD.json","CustomerE":"https://dev.example.com/customers/CustomerE.json"}'
APP_ID='myapp2'
```

### More examples

For all possible combinations, including different output formats, see
[example-config/EXAMPLE_ALL_COMBINATIONS.md](https://deno.land/x/load_config_files/example-config/EXAMPLE_ALL_COMBINATIONS.md).
