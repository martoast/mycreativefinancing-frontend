<!-- components/MarketingEmailModal.vue -->
<template>
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-gray-800 p-6 rounded-lg shadow-lg max-w-4xl w-full">
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-lg font-medium text-white">Send Marketing Email</h3>
          <button @click="$emit('close')" class="text-gray-400 hover:text-white">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div class="grid grid-cols-1 gap-6">
          <!-- Sender Email Selection -->
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">Sender Email</label>
            <select 
              v-model="formData.senderEmail" 
              class="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="sales@urcreativeservices.com">sales@urcreativeservices.com</option>
            </select>
          </div>
          
          <!-- Property Selection -->
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">Select Property</label>
            <select 
              v-model="formData.propertyId" 
              class="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">-- Select a property --</option>
              <option v-for="property in properties" :key="property.ID" :value="property.ID">
                {{ property.address }} - {{ formatCurrency(property.price) }}
              </option>
            </select>
          </div>
  
          <!-- CSV Upload -->
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">Upload Email List (CSV)</label>
            <div class="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-600 border-dashed rounded-md">
              <div class="space-y-1 text-center">
                <svg class="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                  <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
                <div class="flex text-sm text-gray-400">
                  <label for="csv-upload" class="relative cursor-pointer bg-gray-700 rounded-md font-medium text-blue-400 hover:text-blue-300 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                    <span>Upload a file</span>
                    <input @change="handleFileUpload" id="csv-upload" name="csv-upload" type="file" accept=".csv" class="sr-only">
                  </label>
                  <p class="pl-1">or drag and drop</p>
                </div>
                <p class="text-xs text-gray-400">CSV file with email addresses</p>
              </div>
            </div>
            <p v-if="formData.csvFilename" class="mt-2 text-sm text-gray-400">
              File: {{ formData.csvFilename }} ({{ formData.csvEmailCount }} emails)
            </p>
          </div>
  
          <!-- Preview and Email Template Options -->
          <div v-if="formData.propertyId && formData.csvFile">
            <div class="bg-gray-700 p-4 rounded mb-4">
              <h4 class="text-md font-medium text-white mb-2">Email Preview</h4>
              <div class="mb-2">
                <span class="text-gray-400">From:</span> 
                <span class="text-white">{{ formData.senderEmail }}</span>
              </div>
              <div class="mb-2">
                <span class="text-gray-400">Subject:</span> 
                <span class="text-white">{{ emailSubject }}</span>
              </div>
              <div class="mb-2">
                <span class="text-gray-400">To:</span> 
                <span class="text-white">{{ formData.csvEmailCount }} recipients from CSV</span>
              </div>
            </div>
            
            <div class="flex justify-between">
              <button 
                @click="$emit('close')" 
                class="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600"
              >
                Cancel
              </button>
              <button 
                @click="sendEmails" 
                class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500"
                :disabled="loading"
              >
                <span v-if="loading">Sending...</span>
                <span v-else>Send Email</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, computed, reactive } from 'vue';
  
  const props = defineProps({
    properties: {
      type: Array,
      required: true
    },
    loading: {
      type: Boolean,
      default: false
    }
  });
  
  const emit = defineEmits(['close', 'send']);
  
  // Form data
  const formData = reactive({
    senderEmail: 'nico@urcreativesolutions.com',
    propertyId: '',
    csvFile: null,
    csvFilename: '',
    csvEmailCount: 0
  });
  
  // Computed properties
  const selectedProperty = computed(() => {
    return props.properties.find(p => p.ID === formData.propertyId);
  });
  
  const emailSubject = computed(() => {
    if (!selectedProperty.value) return '';
    return `🚨New Creative Deal Available: ${selectedProperty.value.address}🚨`;
  });
  
  // Methods
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    formData.csvFile = file;
    formData.csvFilename = file.name;
    
    // Read and parse CSV to count emails
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      const lines = text.split(/\r?\n/);
      
      // Find the email column index
      const headers = lines[0].split(',');
      const emailIndex = headers.findIndex(h => h.trim().toLowerCase() === 'email');
      
      if (emailIndex === -1) {
        alert('Could not find "email" column in CSV file');
        formData.csvFile = null;
        formData.csvFilename = '';
        formData.csvEmailCount = 0;
        return;
      }
      
      // Count valid emails
      let count = 0;
      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(',');
        if (cols.length > emailIndex && cols[emailIndex].trim() && cols[emailIndex].includes('@')) {
          count++;
        }
      }
      
      formData.csvEmailCount = count;
    };
    reader.readAsText(file);
  };
  
  const sendEmails = () => {
    if (!formData.propertyId || !formData.csvFile) {
      alert('Please select a property and upload a CSV file');
      return;
    }
    
    // Prepare form data for API call
    const formDataToSubmit = new FormData();
    formDataToSubmit.append('from', formData.senderEmail);
    formDataToSubmit.append('subject', emailSubject.value);
    formDataToSubmit.append('propertyId', formData.propertyId);
    formDataToSubmit.append('csvFile', formData.csvFile);
    
    // Emit event to parent component
    emit('send', formDataToSubmit);
  };
  
  // Helper functions
  const formatCurrency = (value) => {
    if (typeof value !== 'number') return value;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };
  </script>