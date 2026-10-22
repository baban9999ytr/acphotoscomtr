import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
export default defineConfig({
  site: "https://acphotos.com.tr",
  devToolbar: { enabled: false },
  output: "static",
  trailingSlash: "always",
  integrations: [
    sitemap({ filter: (url) => !/admin|goruntule|404/.test(url) }),
  ],
  vite: { build: { assetsInlineLimit: 0 } },
  build: { inlineStylesheets: "never" },
});
