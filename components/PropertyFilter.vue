<!-- components/PropertyFilter.vue -->
<template>
    <div class="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl mb-8 shadow-lg border border-gray-700/50">
      <div class="max-w-2xl mx-auto">
        <!-- Search input with icon -->
        <div class="relative">
          <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg 
              class="h-5 w-5 text-gray-400"
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              stroke-width="2"
            >
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </div>
          <input
            type="text"
            v-model="searchQuery"
            placeholder="Search by address, city, state, or ZIP code..."
            class="w-full pl-12 pr-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-lg 
                   text-white placeholder-gray-400 focus:outline-none focus:ring-2 
                   focus:ring-primary/50 focus:border-primary/50 transition-all duration-200
                   hover:bg-gray-700/70"
            @input="handleFilter"
          />
          <!-- Clear button -->
          <button
            v-if="searchQuery"
            @click="clearSearch"
            class="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 
                   hover:text-gray-200 transition-colors duration-200"
          >
            <svg 
              class="h-5 w-5" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor"
            >
              <path d="M6 18L18 6M6 6l12 12" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  const searchQuery = ref('')
  const emit = defineEmits(['filter'])
  
  const handleFilter = () => {
    emit('filter', {
      search: searchQuery.value
    })
  }
  
  const clearSearch = () => {
    searchQuery.value = ''
    handleFilter()
  }
  </script>