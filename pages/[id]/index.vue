<template>
  <div class="bg-black min-h-screen">
    <div class="container mx-auto">
      <div
        class="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-24 lg:max-w-7xl lg:px-8"
      >
        <div class="flex justify-center mb-8">
          <a href="https://urcreativesolutions.com/" target="_blank">
            <img src="/logo.svg" alt="Logo" class="h-16 w-auto" />
          </a>
        </div>
        <div class="mb-4">
          <button
            @click="hanldeBackButton"
            type="button"
            class="rounded-full bg-primary p-2 text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              class="w-6 h-6"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
              />
            </svg>
          </button>
        </div>
        <div class="lg:grid lg:grid-cols-2 lg:items-start lg:gap-x-8">
          <!-- Image gallery -->
          <TabGroup as="div" class="flex flex-col-reverse">
            <!-- Image selector -->
            <div
              class="mx-auto mt-6 hidden w-full max-w-2xl sm:block lg:max-w-none"
            >
              <TabList class="grid grid-cols-4 gap-6 mb-8">
                <Tab
                  v-for="(image, index) in property.images"
                  :key="index"
                  class="relative flex h-24 cursor-pointer items-center justify-center rounded-md bg-gray-800 text-sm font-medium uppercase text-white hover:bg-gray-700 focus:outline-none focus:ring focus:ring-opacity-50 focus:ring-offset-4"
                  v-slot="{ selected }"
                >
                  <span class="sr-only">Image {{ index + 1 }}</span>
                  <span class="absolute inset-0 overflow-hidden rounded-md">
                    <img
                      :src="image"
                      alt=""
                      class="h-full w-full object-cover object-center"
                    />
                  </span>
                  <span
                    :class="[
                      selected ? 'ring-primary' : 'ring-transparent',
                      'pointer-events-none absolute inset-0 rounded-md ring-2 ring-offset-2',
                    ]"
                    aria-hidden="true"
                  />
                </Tab>
              </TabList>
            </div>

            <TabPanels class="aspect-h-1 aspect-w-1 w-full">
              <TabPanel
                v-for="(image, index) in property.images"
                :key="index"
                @click="openModal(index)"
              >
                <img
                  :src="image"
                  :alt="`Image ${index + 1}`"
                  class="h-full w-full object-cover object-center sm:rounded-lg cursor-pointer"
                />
              </TabPanel>
            </TabPanels>
          </TabGroup>

          <!-- Property info -->
          <div class="mt-10 px-4 sm:mt-16 sm:px-0 lg:mt-0">
            <h1 class="text-3xl font-bold tracking-tight text-white">
              {{ property.address }}
            </h1>

            <div class="mt-3">
              <h2 class="sr-only">Property information</h2>
              <p class="text-3xl font-semibold tracking-tight text-white mb-3">
                {{ formatCurrency(property.price) }}
              </p>
              <p v-if="property.sold !== null" class="font-medium text-white">
                <span>Status:</span>
                <span
                  class="font-bold"
                  :class="property.sold ? 'text-red-700' : 'text-green-300'"
                >
                  {{ property.sold ? "Sold" : "Available" }}
                </span>
              </p>
              <!-- Transaction Document Button -->
              <div v-if="property.transaction_document_url" class="mt-4">
                <a
                  :href="property.transaction_document_url"
                  target="_blank"
                  class="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke-width="1.5"
                    stroke="currentColor"
                    class="w-5 h-5"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
                    />
                  </svg>
                  View Documents
                </a>
              </div>
            </div>

            <!-- Info Sections -->
            <div class="mt-4 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              <!-- General Information -->
              <section>
                <h3 class="text-xl font-semibold text-white">
                  General Information
                </h3>
                <div class="space-y-2 text-base text-white mt-2">
                  <p>
                    <span class="font-medium">Property Type:</span>
                    {{ property.property_type }}
                  </p>
                  <p>
                    <span class="font-medium">Bedrooms:</span>
                    {{ property.bedrooms }}
                  </p>
                  <p>
                    <span class="font-medium">Bathrooms:</span>
                    {{ property.bathrooms }}
                  </p>
                  <p>
                    <span class="font-medium">Year Built:</span>
                    {{ property.year_built ?? "N/A" }}
                  </p>
                  <p>
                    <span class="font-medium">Lot Size:</span>
                    {{ property.lot_size ?? "N/A" }}
                  </p>
                  <p>
                    <span class="font-medium">Living Area:</span>
                    {{ property.living_area ?? "N/A" }}
                  </p>
                </div>
              </section>

              <!-- Financial Information -->
              <section>
                <h3 class="text-xl font-semibold text-white">
                  Financial Information
                </h3>
                <div class="space-y-2 text-base text-white mt-2">
                  <p>
                    <span class="font-medium">Rent Zestimate:</span>
                    {{ formatCurrency(property.rent_zestimate) ?? "N/A" }}
                  </p>
                  <p>
                    <span class="font-medium">Zestimate:</span>
                    {{ formatCurrency(property.zestimate) ?? "N/A" }}
                  </p>
                  <p>
                    <span class="font-medium">Price per Square Foot:</span>
                    {{
                      formatCurrency(property.price_per_square_foot) ?? "N/A"
                    }}
                  </p>
                  <p>
                    <span class="font-medium">Zoning:</span>
                    {{ property.zoning ?? "N/A" }}
                  </p>
                  <p>
                    <span class="font-medium">Purchase Price:</span>
                    {{ formatCurrency(property.purchase_price) ?? "N/A" }}
                  </p>
                  <p>
                    <span class="font-medium">Balance to Close:</span>
                    {{ formatCurrency(property.balance_to_close) ?? "N/A" }}
                  </p>
                  <p>
                    <span class="font-medium">Monthly Holding Cost:</span>
                    {{ formatCurrency(property.monthly_holding_cost) ?? "N/A" }}
                  </p>
                  <p>
                    <span class="font-medium">Monthly HOA Fee:</span>
                    {{ formatCurrency(property.monthly_hoa_fee) ?? "N/A" }}
                  </p>
                  <p>
                    <span class="font-medium">Interest Rate:</span>
                    {{
                      property.interest_rate
                        ? `${parseFloat(property.interest_rate)}%`
                        : "N/A"
                    }}
                  </p>
                </div>
              </section>
            </div>

            <!-- Description -->
            <section class="mt-6">
              <h3 class="text-xl font-semibold text-white">Description</h3>
              <div class="space-y-2 text-base text-white mt-2">
                <p>{{ property.description }}</p>
              </div>
            </section>

            <!-- Contact Recipients -->
            <section class="mt-6">
              <h3 class="text-xl font-semibold text-white">
                Contact Recipients
              </h3>
              <div class="space-y-4 text-base text-white mt-2">
                <div
                  v-for="recipient in property.contact_recipients"
                  :key="recipient.zuid"
                  class="flex items-center space-x-4"
                >
                  <img
                    :src="recipient.image_url"
                    :alt="recipient.display_name"
                    class="w-16 h-16 rounded-full object-cover"
                  />
                  <div>
                    <p class="font-medium">{{ recipient.display_name }}</p>

                    <p class="text-sm">
                      Phone: ({{ recipient.phone.areacode }})
                      {{ recipient.phone.prefix }}-{{ recipient.phone.number }}
                    </p>
                    <p v-if="recipient.email" class="text-sm">
                      Email: {{ recipient.email }}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section class="mt-4 space-y-3">
              <div v-if="property.price_breakdown" class="bg-black p-4">
                <h3 class="text-lg font-semibold text-white mb-2">
                  Price Breakdown
                </h3>
                <p class="text-gray-300">{{ property.price_breakdown }}</p>
              </div>

              <div v-if="property.additional_benefits" class="bg-black p-4">
                <h3 class="text-lg font-semibold text-white mb-2">
                  Additional Benefits
                </h3>
                <p class="text-gray-300">{{ property.additional_benefits }}</p>
              </div>
            </section>

            <section class="mt-6">
              <h3 class="text-xl font-semibold text-white">Nearby Homes</h3>
              <div class="overflow-x-auto mt-2">
                <table class="min-w-full bg-black text-white">
                  <thead>
                    <tr>
                      <th class="py-2 px-4 border-b border-gray-300">
                        Address
                      </th>
                      <th class="py-2 px-4 border-b border-gray-300">Price</th>
                      <th class="py-2 px-4 border-b border-gray-300">
                        Lot Size
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="home in property.nearby_homes"
                      :key="home.address.streetAddress"
                    >
                      <td class="py-2 px-4 border-b border-gray-300">
                        {{ home.address.streetAddress }}
                      </td>
                      <td class="py-2 px-4 border-b border-gray-300">
                        {{ formatCurrency(home.price) }}
                      </td>
                      <td class="py-2 px-4 border-b border-gray-300">
                        {{ home.lotSize ? home.lotSize.toLocaleString() : "N/A" }}
                        {{ home.lotSize ? home.livingAreaUnits : "" }}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <!-- Price History -->
            <section class="mt-6">
              <h3 class="text-xl font-semibold text-white">Price History</h3>
              <div class="overflow-x-auto mt-2">
                <table class="min-w-full bg-black text-white">
                  <thead>
                    <tr>
                      <th class="py-2 px-4 border-b border-gray-300">Date</th>
                      <th class="py-2 px-4 border-b border-gray-300">Event</th>
                      <th class="py-2 px-4 border-b border-gray-300">Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="price in property.price_history"
                      :key="price.date"
                    >
                      <td class="py-2 px-4 border-b border-gray-300">
                        {{ new Date(price.date).toLocaleDateString() }}
                      </td>
                      <td class="py-2 px-4 border-b border-gray-300">
                        {{ price.event }}
                      </td>
                      <td class="py-2 px-4 border-b border-gray-300">
                        {{ formatCurrency(price.price) }}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section class="mt-6">
              <h3 class="text-xl font-semibold text-white">Nearby schools</h3>
              <div class="overflow-x-auto mt-2">
                <table class="min-w-full bg-black text-white">
                  <thead>
                    <tr>
                      <th class="py-2 px-4 border-b border-gray-300">Name</th>

                      <th class="py-2 px-4 border-b border-gray-300">Rating</th>

                      <th class="py-2 px-4 border-b border-gray-300">
                        Distance
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="school in property.nearby_schools"
                      :key="school.name"
                    >
                      <td class="py-2 px-4 border-b border-gray-300">
                        {{ school.name }}
                      </td>

                      <td class="py-2 px-4 border-b border-gray-300">
                        {{ school.rating }}
                      </td>

                      <td class="py-2 px-4 border-b border-gray-300">
                        {{ convertMilesToKilometers(school.distance) }} km
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <!-- Tax History -->
            <section v-if="filteredTaxHistory.length" class="mt-6">
              <h3 class="text-xl font-semibold text-white">Tax History</h3>
              <div class="overflow-x-auto mt-2">
                <table class="min-w-full bg-black text-white">
                  <thead>
                    <tr>
                      <th class="py-2 px-4 border-b border-gray-300">Year</th>
                      <th class="py-2 px-4 border-b border-gray-300">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="tax in filteredTaxHistory" :key="tax.time">
                      <td class="py-2 px-4 border-b border-gray-300">
                        {{ new Date(tax.time).getFullYear() }}
                      </td>
                      <td class="py-2 px-4 border-b border-gray-300">
                        {{ formatCurrency(tax.taxPaid) }}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        </div>
      </div>
      <ModalCarousel
        :showModal="isModalOpen"
        :images="property.images"
        :startIndex="selectedImageIndex"
        @close="isModalOpen = false"
      />
    </div>
  </div>
</template>

<script setup>
import { useRoute } from "vue-router";
import { TabGroup, TabList, Tab, TabPanels, TabPanel } from "@headlessui/vue";
import { usePropertiesStore } from "~/store/DataStore";
import ModalCarousel from "~/components/ModalCarousel.vue";

const route = useRoute();
const store = usePropertiesStore();

await useAsyncData("property", () => store.find(route.params.id));

const property = computed(() => ({
  ...store.property,
  nearby_hospitals: store.property.nearby_hospitals
    ? JSON.parse(store.property.nearby_hospitals)
    : [],
  nearby_schools: store.property.nearby_schools
    ? JSON.parse(store.property.nearby_schools)
    : [],
  nearby_homes: store.property.nearby_homes
    ? JSON.parse(store.property.nearby_homes)
    : [],
  images: store.property.images.length ? JSON.parse(store.property.images) : [],
  tax_history: store.property.tax_history
    ? JSON.parse(store.property.tax_history)
    : [],
  price_history: store.property.price_history
    ? JSON.parse(store.property.price_history)
    : [],
  contact_recipients: store.property.contact_recipients
    ? JSON.parse(store.property.contact_recipients)
    : [],
}));

const isModalOpen = ref(false);
const selectedImageIndex = ref(0);

function openModal(index) {
  selectedImageIndex.value = index;
  isModalOpen.value = true;
}

const filteredTaxHistory = computed(() => {
  const taxHistory = property.value?.tax_history;
  return Array.isArray(taxHistory) ? taxHistory.filter((tax) => tax?.taxPaid) : [];
});

function formatCurrency(value) {
  if (typeof value !== "number") {
    return value;
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

const hanldeBackButton = async () => {
  await navigateTo("/");
};

const convertMilesToKilometers = (miles) => {
  return (miles * 1.60934).toFixed(2);
};
</script>
