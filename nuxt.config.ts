// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  ssr: false,
  
  modules: [
    '@pinia/nuxt',
    '@nuxtjs/tailwindcss',
  ],
  vue: {  
    compilerOptions: {
      isCustomElement: (tag) => ['mapbox-search-box'].includes(tag),
    },
  },
  runtimeConfig: {
    public: {
        MAPBOX_API_TOKEN: process.env.MAPBOX_API_TOKEN,
        ZILLOW_API_KEY: process.env.ZILLOW_API_KEY,
        REAL_ESTATE_API_KEY: process.env.REAL_ESTATE_API_KEY,
        GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY,
        GOOGLE_SHEETS_API_CREDENTIALS: process.env.GOOGLE_SHEETS_API_CREDENTIALS,
        SEND_GRID_API_KEY: process.env.SEND_GRID_API_KEY,
        apiBaseUrl: process.env.API_BASE_URL || 'https://shark-app-gfe6f.ondigitalocean.app'
    }
}
})
