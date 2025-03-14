// plugins/api.js
export default defineNuxtPlugin((nuxtApp) => {
  const runtimeConfig = useRuntimeConfig();
  
  // Create reactive auth state that will be shared across the app
  const authState = useState('auth', () => ({
    user: null,
    isAuthenticated: false,
    isAdmin: false,
    isEmployee: false
  }));

  // Function to parse JWT token
  const parseJwt = (token) => {
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
      return null;
    }
  };

  // Function to update auth state
  const updateAuthState = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      authState.value = {
        user: null,
        isAuthenticated: false,
        isAdmin: false,
        isEmployee: false
      };
      return;
    }
    
    const userData = parseJwt(token);
    if (!userData) {
      authState.value = {
        user: null,
        isAuthenticated: false,
        isAdmin: false,
        isEmployee: false
      };
      return;
    }
    
    authState.value = {
      user: userData,
      isAuthenticated: true,
      isAdmin: userData.is_admin === true,
      isEmployee: userData.is_employee === true
    };
  };

  // Initialize auth state on app load (client-side only)
  if (process.client) {
    updateAuthState();
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
      
      // Set content type headers
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
        updateAuthState();
        await nuxtApp.runWithContext(() => navigateTo('/login'));
      }
    }
  });

  // Auth functions
  return {
    provide: {
      auth: {
        fetch: authFetch,
        
        // Get reactive auth state
        getState() {
          return authState;
        },
        
        // Check if user is authenticated
        isAuthenticated() {
          return authState.value.isAuthenticated;
        },
        
        // Check if user is admin
        isAdmin() {
          return authState.value.isAdmin;
        },
        
        // Check if user is employee
        isEmployee() {
          return authState.value.isEmployee;
        },
        
        // Get current user data
        getUser() {
          return authState.value.user;
        },
        
        // Logout function
        async logout() {
          localStorage.removeItem('token');
          updateAuthState();
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
              updateAuthState();
              return true;
            }
            return false;
          } catch (error) {
            console.error('Login error:', error);
            throw error;
          }
        },
        
        // Register helper
        async register(email, password, isEmployee = false) {
          try {
            const response = await $fetch(`${runtimeConfig.public.apiBaseUrl}/auth/register`, {
              method: 'POST',
              body: { email, password, is_employee: isEmployee }
            });
            
            if (response.token) {
              localStorage.setItem('token', response.token);
              updateAuthState();
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