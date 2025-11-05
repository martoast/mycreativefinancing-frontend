<template>
    <div class="bg-black min-h-screen flex flex-col items-center justify-center px-4">
      <!-- Logo -->
      <div class="mb-12">
        <a href="https://urcreativeservices.com/" target="_blank">
          <img src="/logo.png" alt="Logo" class="h-20 w-auto" />
        </a>
      </div>
      
      <!-- Unauthorized message -->
      <div class="text-center max-w-lg">
        <h1 class="text-3xl md:text-4xl font-extrabold tracking-wide mb-6">
          <span class="text-primary">ACCESS</span> <span class="text-white">DENIED</span>
        </h1>
        
        <p class="text-white text-lg mb-10">
          You don't have permission to access this page. This area is restricted to administrators only.
        </p>
        
        <!-- Back to home button -->
        <NuxtLink to="/" class="inline-block px-6 py-3 bg-primary text-white font-semibold rounded hover:bg-indigo-600 transition duration-200">
          Return to Home
        </NuxtLink>
      </div>
    </div>
  </template>
  
  <script setup>
  // No additional script needed
  </script>