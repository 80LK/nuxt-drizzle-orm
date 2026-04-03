import { defineNuxtModule, createResolver, addServerImports } from '@nuxt/kit';

const name = "nuxt-drizzle-orm";
const version = "1.0.0";

const module$1 = defineNuxtModule({
  meta: {
    name,
    version,
    configKey: "drizzle"
  },
  // Default configuration options of the Nuxt module
  defaults: {
    schema: "server/drizzle",
    migrationsDir: "migrations/drizzle"
  },
  setup(_options, _nuxt) {
    const resolver = createResolver(import.meta.url);
    _nuxt.options.runtimeConfig.drizzle = Object.assign({
      url: _options.url
    }, _nuxt.options.runtimeConfig.drizzle);
    addServerImports({
      name: "useDB",
      from: resolver.resolve("runtime/server/useDB")
    });
  }
});

export { module$1 as default };
