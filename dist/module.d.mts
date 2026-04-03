import * as _nuxt_schema from '@nuxt/schema';

interface ModuleOptions {
    schema: string;
    migrationsDir: string;
    url?: string;
}
declare module '@nuxt/schema' {
    interface RuntimeConfig {
        drizzle: {
            url: string;
        };
    }
}
declare const _default: _nuxt_schema.NuxtModule<ModuleOptions, ModuleOptions, false>;

export { _default as default };
export type { ModuleOptions };
