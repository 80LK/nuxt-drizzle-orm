import { defineNuxtModule, addPlugin, createResolver, addTemplate, addServerImports } from '@nuxt/kit'
import { name, version } from "../package.json"

export interface ModuleOptions {
  schema: string;
  migrationsDir: string;
  url?: string;
};

declare module '@nuxt/schema' {
  interface RuntimeConfig {
    drizzle: {
      url: string;
    }
  }
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name,
    version,
    configKey: 'drizzle',
  },
  // Default configuration options of the Nuxt module
  defaults: {
    schema: 'server/drizzle',
    migrationsDir: "migrations/drizzle"
  },
  setup(_options, _nuxt) {
    const resolver = createResolver(import.meta.url);

    _nuxt.options.runtimeConfig.drizzle = Object.assign({
      url: _options.url
    }, _nuxt.options.runtimeConfig.drizzle);

    addServerImports({
      name: 'useDB',
      from: resolver.resolve('runtime/server/useDB')
    });
  },
})
