// stores/DataStore.js
import { defineStore } from 'pinia';

export const usePropertiesStore = defineStore('properties', {
  state: () => ({
    properties: [],
    property: {},
    total: 0,
  }),

  actions: {
    async get(page = 1, pageSize = 100, sold = null) {
      const config = useRuntimeConfig();
      console.log("Attempting to get properties");
      
      let url = `${config.public.apiBaseUrl}/properties?page=${page}&pageSize=${pageSize}`;
      if (sold !== null) {
        url += `&sold=${sold}`;
      }
      
      const response = await $fetch(url);
      this.properties = response.properties;
      this.total = response.total;
    },

    async find(ID) {
      const config = useRuntimeConfig();
      const url = `${config.public.apiBaseUrl}/properties/${ID}`;
      this.property = await $fetch(url);
    },

    async store(params) {
      const config = useRuntimeConfig();
      const { $auth } = useNuxtApp();
      
      // Determine if we're updating or creating
      const isUpdate = !!params.property.ID;
      
      // Use the protected API endpoint with authentication
      const url = isUpdate
        ? `${config.public.apiBaseUrl}/api/properties/${params.property.ID}`
        : `${config.public.apiBaseUrl}/api/properties`;
      
      const method = isUpdate ? 'put' : 'post';

      // Use auth.fetch for protected endpoints
      return $auth.fetch(url, {
        method: method,
        body: params.property
      });
    },

    async delete(ID) {
      const config = useRuntimeConfig();
      const { $auth } = useNuxtApp();
      
      // Use the protected API endpoint with authentication
      const url = `${config.public.apiBaseUrl}/api/properties/${ID}`;
      
      // Use auth.fetch for protected endpoints
      return $auth.fetch(url, {
        method: 'delete'
      });
    }
  },

  getters: {
    getProperties: (state) => state.properties,
    getProperty: (state) => state.property
  }
});