<template>
  <div class="bg-black min-h-screen flex flex-col items-center justify-center px-4">
    <!-- Logo -->
    <div class="mb-8">
      <a href="/" target="_blank">
        <img src="/logo.svg" alt="Logo" class="h-16 w-auto" />
      </a>
    </div>
    
    <!-- Access Password Prompt -->
    <div v-if="!accessGranted" class="w-full max-w-md bg-gray-800 rounded-lg shadow-md p-8">
      <h1 class="text-2xl font-extrabold tracking-wide mb-6 text-center">
        <span class="text-primary">RESTRICTED</span> <span class="text-white">ACCESS</span>
      </h1>
      
      <form @submit.prevent="checkAccessPassword" class="space-y-6">
        <!-- Error message -->
        <div v-if="accessError" class="p-3 bg-red-900/50 border border-red-500 rounded text-red-200 text-sm">
          {{ accessError }}
        </div>
        
        <!-- Access Password input -->
        <div>
          <label for="accessPassword" class="block text-sm font-medium text-white mb-2">Access Password</label>
          <input 
            v-model="accessPassword"
            type="password" 
            id="accessPassword" 
            required
            class="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Enter access password"
          />
        </div>
        
        <!-- Submit button -->
        <button 
          type="submit" 
          class="w-full bg-primary text-white font-semibold py-3 rounded hover:bg-indigo-600 transition duration-200"
          :disabled="accessLoading"
        >
          {{ accessLoading ? 'Checking...' : 'Continue' }}
        </button>
      </form>
    </div>
    
    <!-- Register form -->
    <div v-else class="w-full max-w-md bg-gray-800 rounded-lg shadow-md p-8">
      <h1 class="text-2xl font-extrabold tracking-wide mb-6 text-center">
        <span class="text-primary">CREATE</span> <span class="text-white">ACCOUNT</span>
      </h1>
      
      <form @submit.prevent="register" class="space-y-6">
        <!-- Error message -->
        <div v-if="error" class="p-3 bg-red-900/50 border border-red-500 rounded text-red-200 text-sm">
          {{ error }}
        </div>
        
        <!-- Email input -->
        <div>
          <label for="email" class="block text-sm font-medium text-white mb-2">Email Address</label>
          <input 
            v-model="email"
            type="email" 
            id="email" 
            required
            class="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Enter your email"
          />
        </div>
        
        <!-- Password input -->
        <div>
          <label for="password" class="block text-sm font-medium text-white mb-2">Password</label>
          <input 
            v-model="password"
            type="password" 
            id="password" 
            required
            class="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Choose a password"
          />
        </div>
        
        <!-- Submit button -->
        <button 
          type="submit" 
          class="w-full bg-primary text-white font-semibold py-3 rounded hover:bg-indigo-600 transition duration-200"
          :disabled="loading"
        >
          {{ loading ? 'Creating Account...' : 'Register' }}
        </button>
        
        <!-- Login link -->
        <div class="text-center text-gray-300 text-sm">
          Already have an account? 
          <NuxtLink to="/login" class="text-primary hover:text-indigo-400">Login</NuxtLink>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
const email = ref('');
const password = ref('');
const error = ref('');
const loading = ref(false);
const router = useRouter();
const { $auth } = useNuxtApp();

// Access password functionality
const accessGranted = ref(false);
const accessPassword = ref('');
const accessError = ref('');
const accessLoading = ref(false);

// Set your access password here
const CORRECT_ACCESS_PASSWORD = 'Alexandrotheking ';

function checkAccessPassword() {
  accessLoading.value = true;
  accessError.value = '';
  
  // Simulate a delay for security
  setTimeout(() => {
    if (accessPassword.value === CORRECT_ACCESS_PASSWORD) {
      accessGranted.value = true;
    } else {
      accessError.value = 'Invalid access password';
    }
    accessLoading.value = false;
  }, 600);
}

async function register() {
  try {
    error.value = '';
    loading.value = true;
    
    await $auth.register(email.value, password.value);
    
    // Redirect to home page on success
    router.push('/');
  } catch (err) {
    error.value = err.data?.message || 'Failed to register';
  } finally {
    loading.value = false;
  }
}
</script>