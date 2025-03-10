<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-gray-800 p-6 rounded-lg shadow-lg max-w-md w-full">
      <h3 class="text-lg font-medium text-white mb-2">{{ title }}</h3>
      <p class="text-gray-300 mb-6">{{ message }}</p>
      
      <div class="flex justify-between">
        <button 
          @click="$emit('cancel')" 
          class="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600"
        >
          Cancel
        </button>
        <button 
          @click="$emit('confirm', property)" 
          class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-500"
          :disabled="loading"
        >
          <span v-if="loading">Processing...</span>
          <span v-else>Confirm</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  property: {
    type: Object,
    required: true
  },
  loading: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: 'Confirm Action'
  },
  message: {
    type: String,
    default: 'Are you sure you want to proceed with this action? This cannot be undone.'
  }
});

defineEmits(['confirm', 'cancel']);
</script>
  