<template>
    <div class="bg-black min-h-screen flex flex-col items-center justify-center px-4">
      <!-- Logo -->
      <div class="mb-12">
        <a href="https://urcreativeservices.com/" target="_blank">
          <img src="/logo.png" alt="Logo" class="h-20 w-auto" />
        </a>
      </div>
      
      <!-- Thank you message -->
      <div class="text-center max-w-lg">
        <h1 class="text-3xl md:text-4xl font-extrabold tracking-wide mb-6">
          <span class="text-primary">THANK</span> <span class="text-white">YOU</span>
        </h1>
        
        <p class="text-white text-lg mb-10">
          Your property has been successfully submitted. We appreciate your submission and will review it shortly.
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