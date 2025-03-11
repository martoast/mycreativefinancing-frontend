// middleware/auth.js
export default defineNuxtRouteMiddleware(() => {
  const { $auth } = useNuxtApp();
  
  if (!$auth.isAuthenticated()) {
    return navigateTo('/login');
  }
});