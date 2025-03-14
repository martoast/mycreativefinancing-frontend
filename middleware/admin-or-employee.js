// middleware/admin-or-employee.js
export default defineNuxtRouteMiddleware(() => {
  const { $auth } = useNuxtApp();
  
  // Debug output
  console.log('Auth state:', {
    isAuthenticated: $auth.isAuthenticated(),
    isAdmin: $auth.isAdmin(),
    isEmployee: $auth.isEmployee(),
    userData: $auth.getUser()
  });
  
  // First check if user is authenticated
  if (!$auth.isAuthenticated()) {
    console.log('Redirecting: Not authenticated');
    return navigateTo('/login');
  }
  
  // Then check if user is either admin or employee
  if (!$auth.isAdmin() && !$auth.isEmployee()) {
    console.log('Redirecting: Not admin or employee');
    // Redirect to an unauthorized page or home
    return navigateTo('/unauthorized');
  }
  
  console.log('Access granted to admin/employee route');
});