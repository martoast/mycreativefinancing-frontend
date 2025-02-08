// stores/properties.js
import { defineStore } from 'pinia';

export const usePropertiesStore = defineStore('properties', {
  state: () => ({
    properties: [],
    property: {},
    total: 0,
  }),

  actions: {
    async get(page = 1, pageSize = 100, sold = null) {
      console.log("Attempting to get properties");
      let url = `https://shark-app-gfe6f.ondigitalocean.app/properties/?page=${page}&pageSize=${pageSize}`;
      if (sold !== null) {
        url += `&sold=${sold}`;
      }
      const response = await $fetch(url);
      this.properties = response.properties;
      this.total = response.total;
    },

    async find(ID) {
      const url = `https://shark-app-gfe6f.ondigitalocean.app/properties/${ID}`;
      this.property = await $fetch(url);
    },

    async store(params) {
      const url = params.property.ID
        ? `https://shark-app-gfe6f.ondigitalocean.app/properties/${params.property.ID}`
        : "https://shark-app-gfe6f.ondigitalocean.app/properties/";
      const method = params.property.ID ? 'put' : 'post';

      return $fetch(url, {
        method: method,
        body: params.property
      });
    },

    async delete(ID) {
      const url = `https://shark-app-gfe6f.ondigitalocean.app/properties/${ID}`;
      return $fetch(url, {
        method: 'delete'
      });
    }
  },

  getters: {
    getProperties: (state) => state.properties,
    getProperty: (state) => state.property
  }
});
