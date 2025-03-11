// plugins/api.js
export default defineNuxtPlugin((nuxtApp) => {
    const runtimeConfig = useRuntimeConfig();
    
    // Add user state to store JWT payload data
    const user = useState('user', () => null);
  
    // Function to parse JWT token
    const parseJwt = (token) => {
      try {
        return JSON.parse(atob(token.split('.')[1]));
      } catch (e) {
        return null;
      }
    };
  
    // Function to get current user data from token
    const getCurrentUser = () => {
      const token = localStorage.getItem('token');
      if (!token) return null;
      
      // Parse the JWT to get user data
      const userData = parseJwt(token);
      if (!userData) return null;
      
      return userData;
    };
  
    // Set user data from token on initialization
    if (process.client) { // Only run on client side
      const userData = getCurrentUser();
      if (userData) {
        user.value = userData;
      }
    }
  
    // Auth fetch for authenticated requests
    const authFetch = $fetch.create({
      baseURL: runtimeConfig.public.apiBaseUrl,
      
      onRequest({ options }) {
        const token = localStorage.getItem('token');
        
        if (token) {
          options.headers = options.headers || {};
          options.headers.Authorization = `Bearer ${token}`;
        }
        
        if (options.headers instanceof Headers) {
          options.headers.set('Accept', 'application/json');
        } else if (Array.isArray(options.headers)) {
          options.headers.push(['Accept', 'application/json']);
        } else {
          options.headers['Accept'] = 'application/json';
        }
      },
      
      async onResponseError({ response }) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          user.value = null;
          await nuxtApp.runWithContext(() => navigateTo('/login'));
        }
      }
    });
  
    // Auth functions
    return {
      provide: {
        auth: {
          fetch: authFetch,
          
          // Check if user is authenticated
          isAuthenticated() {
            return !!localStorage.getItem('token');
          },
          
          // Check if user is admin
          isAdmin() {
            const userData = getCurrentUser();
            return userData && userData.is_admin === true;
          },
          
          // Get current user data
          getUser() {
            return user.value;
          },
          
          // Logout function
          async logout() {
            localStorage.removeItem('token');
            user.value = null;
            await nuxtApp.runWithContext(() => navigateTo('/login'));
          },
          
          // Login helper
          async login(email, password) {
            try {
              const response = await $fetch(`${runtimeConfig.public.apiBaseUrl}/auth/login`, {
                method: 'POST',
                body: { email, password }
              });
              
              if (response.token) {
                localStorage.setItem('token', response.token);
                // Parse and store user data
                user.value = parseJwt(response.token);
                return true;
              }
              return false;
            } catch (error) {
              console.error('Login error:', error);
              throw error;
            }
          },
          
          // Register helper
          async register(email, password) {
            try {
              const response = await $fetch(`${runtimeConfig.public.apiBaseUrl}/auth/register`, {
                method: 'POST',
                body: { email, password }
              });
              
              if (response.token) {
                localStorage.setItem('token', response.token);
                // Parse and store user data
                user.value = parseJwt(response.token);
                return true;
              }
              return false;
            } catch (error) {
              console.error('Registration error:', error);
              throw error;
            }
          }
        }
      }
    };
  });