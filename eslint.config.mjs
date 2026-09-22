import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // Flags the standard "fetch in an effect, guard with a cancelled flag"
      // pattern (react.dev's own data-fetching example) as unsafe. Our data
      // hooks (useStockQuote/useStockHistory/useStockInfo, SearchBox) all
      // follow that pattern deliberately, with cancellation guards already
      // in place, so this rule is disabled rather than fought line-by-line.
      "react-hooks/set-state-in-effect": "off",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
