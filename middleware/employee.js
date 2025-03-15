// middleware/admin.js
export default defineNuxtRouteMiddleware(() => {
    const { $auth } = useNuxtApp();
    
    // First check if user is authenticated
    if (!$auth.isAuthenticated()) {
      return navigateTo('/login');
    }
    
    // Then check if user is admin
    if (!$auth.isEmployee()) {
      // Redirect to an unauthorized page or home
      return navigateTo('/unauthorized');
    }
  });