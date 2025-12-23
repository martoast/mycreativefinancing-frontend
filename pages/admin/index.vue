<template>
  <!-- Remove the container class from the outer div to allow full width -->
  <div class="bg-black min-h-screen w-full">
    <!-- Add padding to the container div instead -->
    <div class="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="mb-6">
        <NuxtLink
          to="/"
          class="inline-flex items-center text-white hover:text-primary"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5 mr-2"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fill-rule="evenodd"
              d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
              clip-rule="evenodd"
            />
          </svg>
          Back to Home
        </NuxtLink>
      </div>

      <div class="flex justify-center mb-8">
        <a href="https://urcreativeservices.com/" target="_blank">
          <img src="/logo.png" alt="Logo" class="h-16 w-auto" />
        </a>
      </div>

      <!-- Admin Properties Section -->
      <div class="sm:flex sm:items-center">
        <div class="sm:flex-auto">
          <h1 class="text-base font-semibold leading-6 text-white">
            Properties
          </h1>
          <p class="mt-2 text-sm text-gray-300">
            A list of all the admin properties in your account including their
            address, price, and details.
          </p>
        </div>
        <div class="mt-4 sm:ml-4 sm:mt-0 sm:flex space-x-3">
          <NuxtLink to="/admin/deleted-properties">
            <button
              type="button"
              class="block rounded-md bg-red-800 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-red-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-800"
            >
              Deleted Properties
            </button>
          </NuxtLink>
          <NuxtLink to="/admin/change-password">
            <button
              type="button"
              class="block rounded-md bg-gray-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-gray-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600"
            >
              Change Password
            </button>
          </NuxtLink>
          <button
            @click="openEmailModal"
            type="button"
            class="block rounded-md bg-blue-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            Send Marketing Email
          </button>
          <a href="/admin/create">
            <button
              type="button"
              class="block rounded-md bg-primary px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Add property
            </button>
          </a>
        </div>
      </div>
      <div class="mt-8 flow-root">
        <div class="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div class="inline-block min-w-full py-2 align-middle">
            <div
              class="overflow-hidden shadow ring-1 ring-gray-700 ring-opacity-5 sm:rounded-lg"
            >
              <table class="min-w-full divide-y divide-gray-700">
                <thead class="bg-gray-800">
                  <tr>
                    <th
                      scope="col"
                      class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-white sm:pl-6"
                    >
                      Address
                    </th>
                    <th
                      scope="col"
                      class="px-3 py-3.5 text-left text-sm font-semibold text-white"
                    >
                      Status
                    </th>
                    <th
                      scope="col"
                      class="px-3 py-3.5 text-left text-sm font-semibold text-white"
                    >
                      Price
                    </th>
                    <th
                      scope="col"
                      class="px-3 py-3.5 text-left text-sm font-semibold text-white"
                    >
                      Bedrooms
                    </th>
                    <th
                      scope="col"
                      class="px-3 py-3.5 text-left text-sm font-semibold text-white"
                    >
                      Bathrooms
                    </th>
                    <th
                      scope="col"
                      class="relative py-3.5 pl-3 pr-4 sm:pr-6"
                    ></th>
                  </tr>
                </thead>
                <tbody
                  v-if="adminProperties.length"
                  class="divide-y divide-gray-700 bg-gray-900"
                >
                  <tr v-for="property in adminProperties" :key="property.ID">
                    <td
                      class="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-white sm:pl-6"
                    >
                      {{ property.address }}
                    </td>
                    <td
                      class="whitespace-nowrap px-3 py-4 text-sm"
                      :class="property.sold ? 'text-red-400' : 'text-green-400'"
                    >
                      {{ property.sold ? "Sold" : "Available" }}
                    </td>
                    <td
                      class="whitespace-nowrap px-3 py-4 text-sm text-gray-300"
                    >
                      {{ formatCurrency(property.price) }}
                    </td>
                    <td
                      class="whitespace-nowrap px-3 py-4 text-sm text-gray-300"
                    >
                      {{ property.bedrooms }}
                    </td>
                    <td
                      class="whitespace-nowrap px-3 py-4 text-sm text-gray-300"
                    >
                      {{ property.bathrooms }}
                    </td>
                    <td
                      class="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6"
                    >
                      <a
                        :href="'/admin/' + property.ID + '/edit'"
                        class="text-indigo-400 hover:text-indigo-300 mr-6"
                        >Edit</a
                      >
                      <button
                        @click="openDeleteModal(property)"
                        class="text-red-400 hover:text-red-300"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                </tbody>
                <div v-else class="mt-4">
                  <p class="text-white">No Admin Properties</p>
                </div>
              </table>
            </div>
          </div>
        </div>
      </div>

      <!-- Pagination controls for admin properties -->
      <div class="my-8 flex justify-between items-center">
        <button
          @click="prevPage"
          :disabled="currentPage === 1"
          class="px-4 py-2 text-white bg-primary rounded disabled:opacity-50"
        >
          Previous
        </button>
        <p class="text-white">Page {{ currentPage }} of {{ totalPages }}</p>
        <button
          @click="nextPage"
          :disabled="currentPage === totalPages"
          class="px-4 py-2 bg-primary text-white rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>

      <!-- User Submitted Properties Section -->
      <div class="mt-16 sm:flex sm:items-center">
        <div class="sm:flex-auto">
          <h1 class="text-base font-semibold leading-6 text-white">
            User Submitted Properties
          </h1>
          <p class="mt-2 text-sm text-gray-300">
            Properties submitted by users that need review.
          </p>
        </div>
      </div>
      <div class="mt-8 flow-root">
        <div class="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div class="inline-block min-w-full py-2 align-middle">
            <div
              class="overflow-hidden shadow ring-1 ring-gray-700 ring-opacity-5 sm:rounded-lg"
            >
              <table class="min-w-full divide-y divide-gray-700">
                <thead class="bg-gray-800">
                  <tr>
                    <th
                      scope="col"
                      class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-white sm:pl-6"
                    >
                      Address
                    </th>
                    <th
                      scope="col"
                      class="px-3 py-3.5 text-left text-sm font-semibold text-white"
                    >
                      Status
                    </th>
                    <th
                      scope="col"
                      class="px-3 py-3.5 text-left text-sm font-semibold text-white"
                    >
                      Price
                    </th>
                    <th
                      scope="col"
                      class="px-3 py-3.5 text-left text-sm font-semibold text-white"
                    >
                      Bedrooms
                    </th>
                    <th
                      scope="col"
                      class="px-3 py-3.5 text-left text-sm font-semibold text-white"
                    >
                      Bathrooms
                    </th>
                    <th
                      scope="col"
                      class="relative py-3.5 pl-3 pr-4 sm:pr-6"
                    ></th>
                  </tr>
                </thead>
                <tbody
                  v-if="userProperties.length"
                  class="divide-y divide-gray-700 bg-gray-900"
                >
                  <tr v-for="property in userProperties" :key="property.ID">
                    <td
                      class="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-white sm:pl-6"
                    >
                      {{ property.address }}
                    </td>
                    <td
                      class="whitespace-nowrap px-3 py-4 text-sm"
                      :class="property.sold ? 'text-red-400' : 'text-green-400'"
                    >
                      {{ property.sold ? "Sold" : "Available" }}
                    </td>
                    <td
                      class="whitespace-nowrap px-3 py-4 text-sm text-gray-300"
                    >
                      {{ formatCurrency(property.price) }}
                    </td>
                    <td
                      class="whitespace-nowrap px-3 py-4 text-sm text-gray-300"
                    >
                      {{ property.bedrooms }}
                    </td>
                    <td
                      class="whitespace-nowrap px-3 py-4 text-sm text-gray-300"
                    >
                      {{ property.bathrooms }}
                    </td>
                    <td
                      class="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6"
                    >
                      <a
                        :href="'/admin/' + property.ID + '/edit'"
                        class="text-indigo-400 hover:text-indigo-300 mr-4"
                        >Edit</a
                      >
                      <button
                        @click="acceptProperty(property)"
                        class="text-green-400 hover:text-green-300 mr-4"
                      >
                        Accept
                      </button>
                      <button
                        @click="openDeclineModal(property)"
                        class="text-red-400 hover:text-red-300"
                      >
                        Decline
                      </button>
                    </td>
                  </tr>
                </tbody>
                <div v-else class="mt-4">
                  <p class="text-white">No User Submitted Properties</p>
                </div>
              </table>
            </div>
          </div>
        </div>
      </div>

      <!-- Confirmation Modals -->
      <ConfirmationModal
        v-if="showDeleteModal"
        :property="propertySelected"
        :loading="data.loading"
        title="Delete Property"
        message="Are you sure you want to delete this property? This action cannot be undone."
        @confirm="deleteProperty"
        @cancel="hideDeleteModal"
      />

      <ConfirmationModal
        v-if="showDeclineModal"
        :property="propertySelected"
        :loading="data.loading"
        title="Decline Property"
        message="Are you sure you want to decline this user-submitted property? This action cannot be undone."
        @confirm="declineProperty"
        @cancel="hideDeclineModal"
      />

      <!-- Marketing Email Modal -->
      <MarketingEmailModal
        v-if="showEmailModal"
        :properties="adminProperties"
        :loading="emailLoading"
        @close="hideEmailModal"
        @send="sendMarketingEmail"
      />
    </div>
  </div>
</template>

<script setup>
import { usePropertiesStore } from "~/store/DataStore";
import MarketingEmailModal from "~/components/MarketingEmailModal.vue";

definePageMeta({
  middleware: "admin",
});

const config = useRuntimeConfig();
const store = usePropertiesStore();

const currentPage = ref(1);
const itemsPerPage = 10; // Change this to the number of items you want per page
const showSold = ref(null);

const totalPages = computed(() => Math.ceil(store.total / itemsPerPage));

const { _data, pending, error, refresh } = await useAsyncData(
  "properties",
  () => store.get(currentPage.value, itemsPerPage, showSold.value)
);

// Separate admin and user properties
const adminProperties = computed(() =>
  store.properties.filter(
    (property) => !property.created_by || property.created_by === "admin"
  )
);

const userProperties = computed(() =>
  store.properties.filter((property) => property.created_by === "user")
);

// Modal states
const showDeleteModal = ref(false);
const showDeclineModal = ref(false);
const showEmailModal = ref(false);
const propertySelected = ref(null);
const emailLoading = ref(false);

const data = reactive({
  loading: false,
  errors: {},
});

function hideDeleteModal() {
  showDeleteModal.value = false;
  propertySelected.value = null;
}

function hideDeclineModal() {
  showDeclineModal.value = false;
  propertySelected.value = null;
}

function openEmailModal() {
  showEmailModal.value = true;
}

function hideEmailModal() {
  showEmailModal.value = false;
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
    refresh();
  }
};

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
    refresh();
  }
};

function openDeleteModal(property) {
  propertySelected.value = property;
  showDeleteModal.value = true;
}

function openDeclineModal(property) {
  propertySelected.value = property;
  showDeclineModal.value = true;
}

const deleteProperty = async (property) => {
  data.loading = true;
  await store.delete(property.ID);
  await refresh();
  data.loading = false;
  showDeleteModal.value = false;
  propertySelected.value = null;
};

const declineProperty = async (property) => {
  // Declining a property is the same as deleting it
  data.loading = true;
  await store.delete(property.ID);
  await refresh();
  data.loading = false;
  showDeclineModal.value = false;
  propertySelected.value = null;
};

const acceptProperty = async (property) => {
  data.loading = true;

  // Create a copy of the property and change created_by to "admin"
  const updatedProperty = {
    ...property,
    created_by: "admin",
  };

  // If the property has JSON fields, ensure they're properly stringified
  if (typeof updatedProperty.images === "object") {
    updatedProperty.images = JSON.stringify(updatedProperty.images);
  }
  if (typeof updatedProperty.nearby_homes === "object") {
    updatedProperty.nearby_homes = JSON.stringify(updatedProperty.nearby_homes);
  }
  if (typeof updatedProperty.nearby_schools === "object") {
    updatedProperty.nearby_schools = JSON.stringify(
      updatedProperty.nearby_schools
    );
  }
  if (typeof updatedProperty.price_history === "object") {
    updatedProperty.price_history = JSON.stringify(
      updatedProperty.price_history
    );
  }
  if (typeof updatedProperty.tax_history === "object") {
    updatedProperty.tax_history = JSON.stringify(updatedProperty.tax_history);
  }
  if (typeof updatedProperty.contact_recipients === "object") {
    updatedProperty.contact_recipients = JSON.stringify(
      updatedProperty.contact_recipients
    );
  }

  // Update the property in the database
  await store.store({ property: updatedProperty });

  // Refresh the properties list
  await refresh();

  data.loading = false;
};

const sendMarketingEmail = async (formData) => {
  emailLoading.value = true
  
  try {
    // Call the local API endpoint (on your Nuxt server)
    const response = await fetch('/api/email/send-email', {
      method: 'POST',
      body: formData // This is already FormData from the modal
    })
    
    const result = await response.json()
    
    if (result.success) {
      // Show success message
      alert(`Success: ${result.message}`)
    } else {
      // Show error message
      alert(`Error: ${result.message}`)
    }
    
    // Close the modal
    hideEmailModal()
  } catch (error) {
    console.error('Error sending marketing emails:', error)
    alert(`Error sending emails: ${error.message || 'Unknown error'}`)
  } finally {
    emailLoading.value = false
  }
}

function formatCurrency(value) {
  if (typeof value !== "number") {
    return value;
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}
</script>