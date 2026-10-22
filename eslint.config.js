import tseslint from "typescript-eslint";
import astro from "eslint-plugin-astro";
export default [
  {
    ignores: [
      "dist/**",
      ".astro/**",
      "node_modules/**",
      "output/**",
      "test-results/**",
    ],
  },
  ...tseslint.configs.recommended,
  ...astro.configs.recommended,
  { rules: { "@typescript-eslint/no-explicit-any": "error" } },
];
