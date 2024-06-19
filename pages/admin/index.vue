<template>
  <div class="container mx-auto">
    
    <div class="pt-8 px-4 sm:px-6 lg:px-8">
      <a href="http://mycreativefinancing.com/" target="_blank">
      <img src="/logo.png" alt="Logo" class="h-8 w-auto" />
    </a>
    <div class="sm:flex sm:items-center pt-3">
      <div class="sm:flex-auto">
        <h1 class="text-base font-semibold leading-6 text-gray-900">Properties</h1>
        <p class="mt-2 text-sm text-gray-700">A list of all the properties in your account including their address, price, and details.</p>
      </div>
      <div class="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
        <a href="/admin/create">
          <button type="button" class="block rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">Add property</button>
        </a>
      </div>
    </div>
    <div class="mt-8 flow-root">
      <div class="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div class="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
          <div class="overflow-hidden shadow ring-1 ring-gray-700 ring-opacity-5 sm:rounded-lg">
            <table class="min-w-full divide-y divide-gray-300">
              <thead class="bg-gray-50">
                <tr>
                  
                  <th scope="col" class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Address</th>
                  <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Status</th>
                  <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Price</th>
                  <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Bedrooms</th>
                  <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Bathrooms</th>
                  
                  
                  <th scope="col" class="relative py-3.5 pl-3 pr-4 sm:pr-6"> </th>
                </tr>
              </thead>
              <tbody v-if="store.properties.length" class="divide-y divide-gray-200 bg-white">
                <tr v-for="property in store.properties" :key="property.ID">
                  
                  <td class="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">{{ property.address }}</td>
                  <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500" :class="property.sold ? 'text-red-700' : 'text-green-300'">{{ property.sold ? "Sold" : "Available" }}</td>
                  <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{{ formatCurrency(property.price) }}</td>
                  <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{{ property.bedrooms }}</td>
                  <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{{ property.bathrooms }}</td>
                  
                  
                  <td class="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                    <a :href="'/admin/' + property.ID + '/edit'" class="text-indigo-600 hover:text-indigo-900 mr-6">Edit</a>
                    <button @click="openDeleteModal(property)" class="text-red-600 hover:text-red-800">Delete</button>
                    <button @click="openNetSheetModal(property)" class="text-green-400 hover:text-green-600" style="margin-left: 1rem;">NetSheet</button>
                  </td>
                </tr>
              </tbody>
              <div v-else class="mt-4">
                <p>No Properties</p>
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
          class="px-4 py-2 text-white bg-indigo-600 rounded disabled:opacity-50"
        >
          Previous
        </button>
        <p>
          Page {{ currentPage }} of {{ totalPages }}
        </p>
        <button
          @click="nextPage"
          :disabled="currentPage === totalPages"
          class="px-4 py-2 bg-indigo-600 text-white rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    <ConfirmationModal v-if="showModal" :property="propertySelected" :loading="data.loading" @confirm="deleteProperty" @cancel="hideModal"/>
    
    <NetSheetModal v-if="showNetSheetModal" :property="propertySelected" :loading="data.loading" @confirmCreateNetSheet="createNetSheet" @cancel="hideNetSheetModal"/>

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
const showNetSheetModal = ref(false);
const propertySelected = ref(null);

const data = reactive({
  loading: false,
  errors: {}
});

function hideModal() {
  showModal.value = false;
  propertySelected.value = null;
}

function hideNetSheetModal() {
  showNetSheetModal.value = false;
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

function openNetSheetModal(property) {
  console.log("setting selected property");
  propertySelected.value = property;
  showNetSheetModal.value = true;
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

const createNetSheet = async (property) => {
  data.loading = true;
  let propertyToSubmit = {
    ...propertySelected.value,
  }

  await sendWebHook(propertyToSubmit)
  data.loading = false;
  showNetSheetModal.value = false;
  propertySelected.value = null;

}

const sendWebHook = async (propertyToSubmit) => {
  const backendUrl = '/.netlify/functions/copy-and-populate-sheet';

  const headers = {
    'Content-Type': 'application/json'
  };

  const payload = {
    property: {
      ...propertyToSubmit
    }
  };

  try {
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(payload)
    });

    console.log(response);

  } catch (error) {
    console.error('Error adding property via serverless function:', error);
  }
};

function formatCurrency(value) {
  if (typeof value !== 'number') {
    return value;
  }
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
}

</script>