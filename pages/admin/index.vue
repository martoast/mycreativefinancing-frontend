<template>
  <!-- Remove the container class from the outer div to allow full width -->
  <div class="bg-black min-h-screen w-full">
    <!-- Add padding to the container div instead -->
    <div class="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="mb-6">
        <NuxtLink to="/" class="inline-flex items-center text-white hover:text-primary">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd" />
          </svg>
          Back to Home
        </NuxtLink>
      </div>
      
      <div class="flex justify-center mb-8">
        <a href="https://urcreativeservices.com/" target="_blank">
          <img src="/logo.svg" alt="Logo" class="h-16 w-auto" />
        </a>
      </div>
      <div class="sm:flex sm:items-center">
        <div class="sm:flex-auto">
          <h1 class="text-base font-semibold leading-6 text-white">Properties</h1>
          <p class="mt-2 text-sm text-gray-300">A list of all the properties in your account including their address, price, and details.</p>
        </div>
        <div class="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <a href="/admin/create">
            <button type="button" class="block rounded-md bg-primary px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">Add property</button>
          </a>
        </div>
      </div>
      <div class="mt-8 flow-root">
        <div class="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div class="inline-block min-w-full py-2 align-middle">
            <div class="overflow-hidden shadow ring-1 ring-gray-700 ring-opacity-5 sm:rounded-lg">
              <table class="min-w-full divide-y divide-gray-700">
                <thead class="bg-gray-800">
                  <tr>
                    <th scope="col" class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-white sm:pl-6">Address</th>
                    <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-white">Status</th>
                    <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-white">Price</th>
                    <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-white">Bedrooms</th>
                    <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-white">Bathrooms</th>
                    <th scope="col" class="relative py-3.5 pl-3 pr-4 sm:pr-6"> </th>
                  </tr>
                </thead>
                <tbody v-if="store.properties.length" class="divide-y divide-gray-700 bg-gray-900">
                  <tr v-for="property in store.properties" :key="property.ID">
                    <td class="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-white sm:pl-6">{{ property.address }}</td>
                    <td class="whitespace-nowrap px-3 py-4 text-sm" :class="property.sold ? 'text-red-400' : 'text-green-400'">{{ property.sold ? "Sold" : "Available" }}</td>
                    <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-300">{{ formatCurrency(property.price) }}</td>
                    <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-300">{{ property.bedrooms }}</td>
                    <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-300">{{ property.bathrooms }}</td>
                    <td class="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                      <a :href="'/admin/' + property.ID + '/edit'" class="text-indigo-400 hover:text-indigo-300 mr-6">Edit</a>
                      <button @click="openDeleteModal(property)" class="text-red-400 hover:text-red-300">Delete</button>
                    </td>
                  </tr>
                </tbody>
                <div v-else class="mt-4">
                  <p class="text-white">No Properties</p>
                </div>
              </table>
            </div>
          </div>
        </div>
      </div>
      <!-- Pagination controls -->
      <div class="my-8 flex justify-between items-center">
        <button
          @click="prevPage"
          :disabled="currentPage === 1"
          class="px-4 py-2 text-white bg-primary rounded disabled:opacity-50"
        >
          Previous
        </button>
        <p class="text-white">
          Page {{ currentPage }} of {{ totalPages }}
        </p>
        <button
          @click="nextPage"
          :disabled="currentPage === totalPages"
          class="px-4 py-2 bg-primary text-white rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
      <ConfirmationModal v-if="showModal" :property="propertySelected" :loading="data.loading" @confirm="deleteProperty" @cancel="hideModal"/>
    </div>
  </div>
</template>

<script setup>
import { usePropertiesStore } from '~/store/DataStore'

definePageMeta({
  middleware: 'auth'
})

const store = usePropertiesStore();

const currentPage = ref(1)
const itemsPerPage = 10 // Change this to the number of items you want per page
const showSold = ref(null)


const totalPages = computed(() => Math.ceil(store.total / itemsPerPage))

const { _data, pending, error, refresh } = await useAsyncData(
  'properties',
  () => store.get(currentPage.value, itemsPerPage, showSold.value)
)


const showModal = ref(false);
const propertySelected = ref(null);

const data = reactive({
  loading: false,
  errors: {}
});

function hideModal() {
  showModal.value = false;
  propertySelected.value = null;
}




const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
    refresh()
  }
}

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
    refresh()
  }
}

function openDeleteModal(property) {
  console.log("setting selected for deleted property");
  propertySelected.value = property;
  showModal.value = true;
}


const deleteProperty = async (property) => {
  // Perform the delete operation
  data.loading = true;
  console.log("Property delete confirmed, delete it in the API!." + property.ID);
  await store.delete(property.ID);
  refresh();
  data.loading = false;
  showModal.value = false;
  propertySelected.value = null;
};




function formatCurrency(value) {
  if (typeof value !== 'number') {
    return value;
  }
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
}

</script>