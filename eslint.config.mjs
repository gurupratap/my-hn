import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import eslintConfigPrettier from "eslint-config-prettier";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  eslintConfigPrettier,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    // Code quality rules
    rules: {
      // Complexity rules
      complexity: ["error", { max: 10 }],
      "max-lines-per-function": ["warn", { max: 50, skipBlankLines: true, skipComments: true }],
      "max-depth": ["error", { max: 3 }],
      "max-params": ["error", { max: 4 }],
      "no-nested-ternary": "error",

      // TypeScript rules
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/explicit-function-return-type": [
        "warn",
        {
          allowExpressions: true,
          allowTypedFunctionExpressions: true,
          allowHigherOrderFunctions: true,
          allowDirectConstAssertionInArrowFunctions: true,
          allowConciseArrowFunctionExpressionsStartingWithVoid: true,
        },
      ],
    },
  },
  {
    // Override rules for test files
    files: ["tests/**/*.ts", "tests/**/*.tsx", "**/*.test.ts", "**/*.test.tsx"],
    rules: {
      // Allow require() for dynamic module loading in tests (needed for jest.resetModules)
      "@typescript-eslint/no-require-imports": "off",
      // Tests can be longer
      "max-lines-per-function": "off",
    },
  },
  {
    // Override rules for config files
    files: ["*.config.js", "*.config.mjs", "*.config.ts"],
    rules: {
      // Allow require() in config files
      "@typescript-eslint/no-require-imports": "off",
    },
  },
]);

export default eslintConfig;
