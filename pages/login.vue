<template>
  <div class="bg-black min-h-screen flex flex-col items-center justify-center px-4">
    <!-- Logo -->
    <div class="mb-8">
      <a href="/" target="_blank">
        <img src="/logo.png" alt="Logo" class="h-16 w-auto" />
      </a>
    </div>
    
    <!-- Login form -->
    <div class="w-full max-w-md bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-lg shadow-xl p-8">
      <h1 class="text-2xl font-extrabold tracking-wide mb-6 text-center">
        <span class="text-gold">WELCOME</span> <span class="text-white">BACK</span>
      </h1>
      
      <form @submit.prevent="login" class="space-y-6">
        <!-- Error message -->
        <div v-if="error" class="p-3 bg-accent-red/10 border border-accent-red/30 rounded text-accent-red text-sm">
          {{ error }}
        </div>
        
        <!-- Email input -->
        <div>
          <label for="email" class="block text-sm font-medium text-zinc-300 mb-2">Email Address</label>
          <input 
            v-model="email"
            type="email" 
            id="email" 
            required
            class="w-full bg-zinc-800/50 border border-zinc-700 rounded-md py-2 px-4 text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-gold focus:border-gold transition-all"
            placeholder="Enter your email"
          />
        </div>
        
        <!-- Password input -->
        <div>
          <label for="password" class="block text-sm font-medium text-zinc-300 mb-2">Password</label>
          <input 
            v-model="password"
            type="password" 
            id="password" 
            required
            class="w-full bg-zinc-800/50 border border-zinc-700 rounded-md py-2 px-4 text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-gold focus:border-gold transition-all"
            placeholder="Enter your password"
          />
        </div>
        
        <!-- Submit button -->
        <button 
          type="submit" 
          class="w-full bg-gold text-black font-semibold py-3 rounded-lg hover:bg-gold-light transition-all duration-200 shadow-lg shadow-gold/20 hover:shadow-gold/30 disabled:opacity-50 disabled:cursor-not-allowed"
          :disabled="loading"
        >
          {{ loading ? 'Logging in...' : 'Login' }}
        </button>
        
        <!-- Register link -->
        <div class="text-center text-zinc-400 text-sm">
          Don't have an account? 
          <NuxtLink to="/register" class="text-gold hover:text-gold-light font-medium transition-colors">Register</NuxtLink>
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

async function login() {
  try {
    error.value = '';
    loading.value = true;
    
    await $auth.login(email.value, password.value);
    
    // Redirect to home page on success
    router.push('/');
  } catch (err) {
    error.value = err.data?.message || 'Invalid email or password';
  } finally {
    loading.value = false;
  }
}
</script>