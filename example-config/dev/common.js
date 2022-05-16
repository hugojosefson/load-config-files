import { toObject } from "https://deno.land/x/to_object@0.0.1/mod.ts";

const CUSTOMER_NAMES = ["A", "B", "F", "C", "D", "E"].map((x) =>
  `Customer${x}`
);

/**
 * This module is common for all apps in the `dev` directory.
 *
 * Sometimes it's useful to programmatically define some parts of a config.
 */
export default {
  COLOR: "yellow",
  CUSTOMER_URLS: CUSTOMER_NAMES
    .map(
      (customerName) => [
        customerName,
        `https://dev.example.com/customers/${customerName}.json`,
      ],
    )
    .reduce(toObject, {}),
};
