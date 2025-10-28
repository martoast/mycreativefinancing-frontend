// server/api/real-estate-search.post.js
export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig();
    const body = await readBody(event);
  
    try {
      const response = await $fetch('https://api.realestateapi.com/v2/AutoComplete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': config.public.REAL_ESTATE_API_KEY,
          'x-user-id': 'nuxt-property-app'
        },
        body: {
          search: body.search,
          search_types: body.search_types || ['A']
        }
      });
  
      return response;
    } catch (error) {
      console.error('Real Estate API Error:', error);
      throw createError({
        statusCode: error.statusCode || 500,
        statusMessage: error.message || 'Failed to fetch from Real Estate API'
      });
    }
  });