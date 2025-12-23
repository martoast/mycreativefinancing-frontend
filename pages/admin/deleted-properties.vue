<template>
  <div class="bg-black min-h-screen w-full">
    <div class="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="mb-6">
        <NuxtLink
          to="/admin"
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
          Back to Admin
        </NuxtLink>
      </div>

      <div class="flex justify-center mb-8">
        <a href="https://urcreativeservices.com/" target="_blank">
          <img src="/logo.png" alt="Logo" class="h-16 w-auto" />
        </a>
      </div>

      <!-- Header Section -->
      <div class="sm:flex sm:items-center">
        <div class="sm:flex-auto">
          <h1 class="text-base font-semibold leading-6 text-white">
            Deleted Properties
          </h1>
          <p class="mt-2 text-sm text-gray-300">
            Properties that have been deleted. Select properties to restore them.
          </p>
        </div>
        <div class="mt-4 sm:ml-4 sm:mt-0 sm:flex space-x-3">
          <button
            v-if="selectedIds.length > 0"
            @click="restoreSelected"
            :disabled="restoring"
            type="button"
            class="block rounded-md bg-green-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600 disabled:opacity-50"
          >
            <span v-if="restoring">Restoring...</span>
            <span v-else>Restore Selected ({{ selectedIds.length }})</span>
          </button>
        </div>
      </div>

      <!-- Messages -->
      <div v-if="successMessage" class="mt-4 p-4 bg-green-900/50 border border-green-500 rounded-lg">
        <p class="text-green-400 text-sm">{{ successMessage }}</p>
      </div>
      <div v-if="errorMessage" class="mt-4 p-4 bg-red-900/50 border border-red-500 rounded-lg">
        <p class="text-red-400 text-sm">{{ errorMessage }}</p>
      </div>

      <!-- Table -->
      <div class="mt-8 flow-root">
        <div class="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div class="inline-block min-w-full py-2 align-middle">
            <div
              class="overflow-hidden shadow ring-1 ring-gray-700 ring-opacity-5 sm:rounded-lg"
            >
              <table class="min-w-full divide-y divide-gray-700">
                <thead class="bg-gray-800">
                  <tr>
                    <th scope="col" class="py-3.5 pl-4 pr-3 sm:pl-6">
                      <input
                        type="checkbox"
                        :checked="allSelected"
                        :indeterminate="someSelected && !allSelected"
                        @change="toggleSelectAll"
                        class="h-4 w-4 rounded border-gray-600 bg-gray-700 text-primary focus:ring-primary focus:ring-offset-gray-900"
                      />
                    </th>
                    <th
                      scope="col"
                      class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-white"
                    >
                      Address
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
                      class="px-3 py-3.5 text-left text-sm font-semibold text-white"
                    >
                      Deleted At
                    </th>
                  </tr>
                </thead>
                <tbody
                  v-if="properties.length"
                  class="divide-y divide-gray-700 bg-gray-900"
                >
                  <tr
                    v-for="property in properties"
                    :key="property.ID"
                    :class="{ 'bg-gray-800': selectedIds.includes(property.ID) }"
                  >
                    <td class="whitespace-nowrap py-4 pl-4 pr-3 sm:pl-6">
                      <input
                        type="checkbox"
                        :checked="selectedIds.includes(property.ID)"
                        @change="toggleSelect(property.ID)"
                        class="h-4 w-4 rounded border-gray-600 bg-gray-700 text-primary focus:ring-primary focus:ring-offset-gray-900"
                      />
                    </td>
                    <td
                      class="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-white"
                    >
                      {{ property.address }}
                    </td>
                    <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-300">
                      {{ formatCurrency(property.price) }}
                    </td>
                    <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-300">
                      {{ property.bedrooms }}
                    </td>
                    <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-300">
                      {{ property.bathrooms }}
                    </td>
                    <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-400">
                      {{ formatDate(property.DeletedAt) }}
                    </td>
                  </tr>
                </tbody>
              </table>
              <div v-if="!properties.length && !loading" class="p-8 text-center">
                <p class="text-gray-400">No deleted properties found</p>
              </div>
              <div v-if="loading" class="p-8 text-center">
                <p class="text-gray-400">Loading...</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="my-8 flex justify-between items-center">
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
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  middleware: ["admin"],
});

const { $auth } = useNuxtApp();
const config = useRuntimeConfig();

const properties = ref([]);
const total = ref(0);
const currentPage = ref(1);
const pageSize = 10;
const loading = ref(false);
const restoring = ref(false);
const selectedIds = ref([]);
const successMessage = ref("");
const errorMessage = ref("");

const totalPages = computed(() => Math.ceil(total.value / pageSize));
const allSelected = computed(
  () => properties.value.length > 0 && selectedIds.value.length === properties.value.length
);
const someSelected = computed(() => selectedIds.value.length > 0);

const fetchDeletedProperties = async () => {
  loading.value = true;
  errorMessage.value = "";

  try {
    const response = await $auth.fetch(
      `${config.public.apiBaseUrl}/api/admin/deleted-properties?page=${currentPage.value}&pageSize=${pageSize}`
    );
    properties.value = response.properties || [];
    total.value = response.total || 0;
    // Clear selections when page changes
    selectedIds.value = [];
  } catch (error) {
    errorMessage.value = error.data?.error || error.message || "Failed to fetch deleted properties";
    properties.value = [];
  } finally {
    loading.value = false;
  }
};

const toggleSelect = (id) => {
  const index = selectedIds.value.indexOf(id);
  if (index === -1) {
    selectedIds.value.push(id);
  } else {
    selectedIds.value.splice(index, 1);
  }
};

const toggleSelectAll = () => {
  if (allSelected.value) {
    selectedIds.value = [];
  } else {
    selectedIds.value = properties.value.map((p) => p.ID);
  }
};

const restoreSelected = async () => {
  if (selectedIds.value.length === 0) return;

  restoring.value = true;
  successMessage.value = "";
  errorMessage.value = "";

  try {
    const response = await $auth.fetch(
      `${config.public.apiBaseUrl}/api/admin/properties/restore`,
      {
        method: "POST",
        body: { ids: selectedIds.value },
      }
    );

    successMessage.value = response.message || `Successfully restored ${response.restored} properties`;
    selectedIds.value = [];
    await fetchDeletedProperties();
  } catch (error) {
    errorMessage.value = error.data?.error || error.message || "Failed to restore properties";
  } finally {
    restoring.value = false;
  }
};

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
    fetchDeletedProperties();
  }
};

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
    fetchDeletedProperties();
  }
};

function formatCurrency(value) {
  if (typeof value !== "number") {
    return value;
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

function formatDate(dateString) {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Fetch on mount
onMounted(() => {
  fetchDeletedProperties();
});
</script>
