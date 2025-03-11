<template>
  <div>
    <form @submit.prevent="handleSubmit">
      <div class="space-y-12">
        <div
          class="border-b border-gray-700 pb-4"
          :class="property.address ? 'pb-8' : 'pb-0'"
        >
          <div class="flex items-center mb-6">
            <NuxtLink
              :to="property.created_by === 'user' ? '/' : '/admin/'"
              class="inline-flex items-center text-white hover:text-gray-300"
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
              Back
            </NuxtLink>
          </div>

          <h2 class="text-base font-semibold leading-7 text-white">
            Property Details
          </h2>
          <p class="mt-1 text-sm leading-6 text-gray-300">
            You can add or update the details of the property from here.
          </p>

          <!-- Manual input checkbox -->
          <div v-if="!props.property" class="mt-5 flex items-center">
            <input
              v-model="manualInput"
              type="checkbox"
              id="manual-input"
              class="mr-2 bg-gray-700 border-gray-600"
            />
            <label
              for="manual-input"
              class="block text-sm font-medium leading-6 text-white"
              >Manual input (skip address search)</label
            >
          </div>

          <!-- Apartment toggle -->
          <div v-if="!props.property">
            <div class="mt-5 flex items-center">
              <input
                v-model="data.form.is_appartment"
                type="checkbox"
                id="is_appartment"
                class="mr-2 bg-gray-700 border-gray-600"
              />
              <label
                for="is_appartment"
                class="block text-sm font-medium leading-6 text-white"
                >Is it an apartment or condo?</label
              >
            </div>

            <!-- Unit Number and Property Type -->
            <div v-if="data.form.is_appartment" class="mt-3 flex space-x-4">
              <div class="flex-1">
                <label
                  for="type"
                  class="block text-sm font-medium leading-6 text-white"
                  >Property Type</label
                >
                <select
                  v-model="data.form.type"
                  id="type"
                  class="block w-full bg-gray-800 border-gray-600 text-white rounded-md py-1.5 shadow-sm focus:ring-primary sm:text-sm sm:leading-6"
                >
                  <option value="">Select Property Type</option>
                  <option value="SUITE">Suite</option>
                  <option value="UNIT">Unit</option>
                  <option value="APARTMENT">Apartment</option>
                  <option value="RM">Room</option>
                </select>
              </div>
              <div class="flex-1">
                <label
                  for="unit-number"
                  class="block text-sm font-medium leading-6 text-white"
                  >Unit Number</label
                >
                <input
                  v-model="data.form.unit_number"
                  type="text"
                  id="unit-number"
                  class="block w-full bg-gray-800 border-gray-600 text-white rounded-md py-1.5 shadow-sm focus:ring-primary sm:text-sm sm:leading-6"
                  placeholder="Unit Number"
                />
              </div>
            </div>

            <!-- Mapbox Search -->
            <div v-if="!manualInput" class="mt-5">
              <mapbox-search-box
                :access-token="access_token"
                placeholder="Search Address"
                :options="{
                  country: 'US',
                  limit: 6,
                  bbox: [-171.791110603, 18.91619, -66.96466, 71.3577635769],
                }"
                types="address"
                @retrieve="handleRetrieve"
                proximity="ip"
                class="bg-gray-800 text-white"
              >
              </mapbox-search-box>
            </div>
          </div>

          <!-- Property Form Fields -->
          <div
            v-if="
              (!data.loading && data.form.address) ||
              props.property ||
              manualInput
            "
            class="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6 mt-5"
          >
            <div class="col-span-3">
              <label
                for="address"
                class="block text-sm font-medium leading-6 text-white"
                >Full Address</label
              >
              <input
                v-model="property.address"
                required
                type="text"
                id="address"
                class="block w-full bg-gray-800 border-gray-600 text-white rounded-md py-1.5 shadow-sm focus:ring-primary sm:text-sm sm:leading-6"
                placeholder="Property Address"
              />
            </div>

            <div class="sm:col-span-3 flex items-center">
              <input
                v-model="property.sold"
                type="checkbox"
                id="sold"
                class="mr-2 bg-gray-700 border-gray-600"
              />
              <label
                for="sold"
                class="block text-sm font-medium leading-6 text-white"
                >Sold: {{ property.sold }}</label
              >
            </div>

            <div class="sm:col-span-3">
              <label
                for="property-type"
                class="block text-sm font-medium leading-6 text-white"
                >Property Type</label
              >
              <input
                v-model="property.property_type"
                type="text"
                id="property-type"
                class="block w-full bg-gray-800 border-gray-600 text-white rounded-md py-1.5 shadow-sm focus:ring-primary sm:text-sm sm:leading-6"
                placeholder="Type of Property"
              />
            </div>

            <div class="sm:col-span-3">
              <label
                for="bedrooms"
                class="block text-sm font-medium leading-6 text-white"
                >Bedrooms</label
              >
              <input
                v-model="property.bedrooms"
                required
                type="number"
                id="bedrooms"
                class="block w-full bg-gray-800 border-gray-600 text-white rounded-md py-1.5 shadow-sm focus:ring-primary sm:text-sm sm:leading-6"
                placeholder="Number of Bedrooms"
              />
            </div>

            <div class="sm:col-span-3">
              <label
                for="bathrooms"
                class="block text-sm font-medium leading-6 text-white"
                >Bathrooms</label
              >
              <input
                v-model="property.bathrooms"
                required
                type="number"
                step="0.5"
                id="bathrooms"
                class="block w-full bg-gray-800 border-gray-600 text-white rounded-md py-1.5 shadow-sm focus:ring-primary sm:text-sm sm:leading-6"
                placeholder="Number of Bathrooms"
              />
            </div>

            <div class="sm:col-span-3">
              <label
                for="price"
                class="block text-sm font-medium leading-6 text-white"
                >Price</label
              >
              <input
                v-model="property.price"
                required
                type="number"
                id="price"
                class="block w-full bg-gray-800 border-gray-600 text-white rounded-md py-1.5 shadow-sm focus:ring-primary sm:text-sm sm:leading-6"
                placeholder="Price in USD"
              />
            </div>

            <div class="sm:col-span-3">
              <label
                for="monthly_hoa_fee"
                class="block text-sm font-medium leading-6 text-white"
                >Monthly HOA Fee</label
              >
              <input
                v-model="property.monthly_hoa_fee"
                type="number"
                id="monthly_hoa_fee"
                class="block w-full bg-gray-800 border-gray-600 text-white rounded-md py-1.5 shadow-sm focus:ring-primary sm:text-sm sm:leading-6"
                placeholder="HOA Fee in USD"
              />
            </div>

            <div class="col-span-full">
              <label
                for="description"
                class="block text-sm font-medium leading-6 text-white"
                >Description</label
              >
              <textarea
                v-model="property.description"
                id="description"
                rows="3"
                class="block w-full bg-gray-800 border-gray-600 text-white rounded-md py-1.5 shadow-sm focus:ring-primary sm:text-sm sm:leading-6"
                placeholder="Description of the property"
              ></textarea>
            </div>

            <div class="sm:col-span-3">
              <label
                for="rent-zestimate"
                class="block text-sm font-medium leading-6 text-white"
                >Estimated Rent</label
              >
              <input
                v-model="property.rent_zestimate"
                type="number"
                id="rent-zestimate"
                class="block w-full bg-gray-800 border-gray-600 text-white rounded-md py-1.5 shadow-sm focus:ring-primary sm:text-sm sm:leading-6"
                placeholder="Estimated Rent"
              />
            </div>

            <div class="sm:col-span-3">
              <label
                for="zestimate"
                class="block text-sm font-medium leading-6 text-white"
                >Estimated Value</label
              >
              <input
                v-model="property.zestimate"
                type="number"
                id="zestimate"
                class="block w-full bg-gray-800 border-gray-600 text-white rounded-md py-1.5 shadow-sm focus:ring-primary sm:text-sm sm:leading-6"
                placeholder="Estimated Value"
              />
            </div>

            <div class="sm:col-span-3">
              <label
                for="price_per_square_foot"
                class="block text-sm font-medium leading-6 text-white"
                >Price Per Square Foot</label
              >
              <input
                v-model="property.price_per_square_foot"
                type="number"
                id="price_per_square_foot"
                class="block w-full bg-gray-800 border-gray-600 text-white rounded-md py-1.5 shadow-sm focus:ring-primary sm:text-sm sm:leading-6"
                placeholder="Price Per Square Foot"
              />
            </div>

            <div class="sm:col-span-3">
              <label
                for="year-built"
                class="block text-sm font-medium leading-6 text-white"
                >Year Built</label
              >
              <input
                v-model="property.year_built"
                type="number"
                id="year-built"
                class="block w-full bg-gray-800 border-gray-600 text-white rounded-md py-1.5 shadow-sm focus:ring-primary sm:text-sm sm:leading-6"
                placeholder="Year the Property Was Built"
              />
            </div>

            <div class="sm:col-span-3">
              <label
                for="lot-size"
                class="block text-sm font-medium leading-6 text-white"
                >Lot Size (sq ft)</label
              >
              <input
                v-model="property.lot_size"
                type="number"
                id="lot-size"
                class="block w-full bg-gray-800 border-gray-600 text-white rounded-md py-1.5 shadow-sm focus:ring-primary sm:text-sm sm:leading-6"
                placeholder="Lot Size in Square Feet"
              />
            </div>

            <div class="sm:col-span-3">
              <label
                for="living-area"
                class="block text-sm font-medium leading-6 text-white"
                >Living Area (sq ft)</label
              >
              <input
                v-model="property.living_area"
                type="number"
                id="living-area"
                class="block w-full bg-gray-800 border-gray-600 text-white rounded-md py-1.5 shadow-sm focus:ring-primary sm:text-sm sm:leading-6"
                placeholder="Living Area in Square Feet"
              />
            </div>

            <div class="sm:col-span-3">
              <label
                for="zoning"
                class="block text-sm font-medium leading-6 text-white"
                >Zoning</label
              >
              <input
                v-model="property.zoning"
                type="text"
                id="zoning"
                class="block w-full bg-gray-800 border-gray-600 text-white rounded-md py-1.5 shadow-sm focus:ring-primary sm:text-sm sm:leading-6"
                placeholder="Zoning"
              />
            </div>

            <!-- Dynamic Image URL Fields -->
            <div class="col-span-full">
              <label
                for="images"
                class="block text-sm font-medium leading-6 text-white"
                >Images (URLs)</label
              >
              <div
                v-for="(image, index) in property.images"
                :key="index"
                class="flex space-x-2 mb-2"
              >
                <input
                  v-model="property.images[index]"
                  type="text"
                  class="block w-full bg-gray-800 border-gray-600 text-white rounded-md py-1.5 shadow-sm focus:ring-primary sm:text-sm sm:leading-6"
                  placeholder="Image URL"
                />
                <button
                  @click.prevent="removeImage(index)"
                  type="button"
                  class="text-red-400 hover:text-red-300"
                >
                  Remove
                </button>
              </div>
              <button
                @click.prevent="addImage"
                type="button"
                class="mt-2 text-primary hover:text-indigo-400"
              >
                Add Image URL
              </button>
            </div>

            <!-- Contact Recipients -->
            <div class="col-span-full">
              <label
                for="contact_recipients"
                class="block text-sm font-medium leading-6 text-white"
                >Contact Recipients</label
              >
              <div
                v-for="(recipient, index) in property.contact_recipients"
                :key="index"
                class="flex flex-col space-y-2 mb-4"
              >
                <div class="flex space-x-2">
                  <input
                    v-model="recipient.display_name"
                    type="text"
                    class="block w-full bg-gray-800 border-gray-600 text-white rounded-md py-1.5 shadow-sm focus:ring-primary sm:text-sm sm:leading-6"
                    placeholder="Display Name"
                  />
                </div>
                <div class="flex space-x-2">
                  <input
                    v-model="recipient.email"
                    type="email"
                    class="block w-full bg-gray-800 border-gray-600 text-white rounded-md py-1.5 shadow-sm focus:ring-primary sm:text-sm sm:leading-6"
                    placeholder="Email"
                  />
                </div>
                <div class="flex space-x-2">
                  <input
                    v-model="recipient.phone.prefix"
                    type="text"
                    class="block w-1/4 bg-gray-800 border-gray-600 text-white rounded-md py-1.5 shadow-sm focus:ring-primary sm:text-sm sm:leading-6"
                    placeholder="Phone Prefix"
                  />
                  <input
                    v-model="recipient.phone.areacode"
                    type="text"
                    class="block w-1/4 bg-gray-800 border-gray-600 text-white rounded-md py-1.5 shadow-sm focus:ring-primary sm:text-sm sm:leading-6"
                    placeholder="Area Code"
                  />
                  <input
                    v-model="recipient.phone.number"
                    type="text"
                    class="block w-1/2 bg-gray-800 border-gray-600 text-white rounded-md py-1.5 shadow-sm focus:ring-primary sm:text-sm sm:leading-6"
                    placeholder="Phone Number"
                  />
                </div>
                <input
                  v-model="recipient.image_url"
                  type="text"
                  class="block w-full bg-gray-800 border-gray-600 text-white rounded-md py-1.5 shadow-sm focus:ring-primary sm:text-sm sm:leading-6"
                  placeholder="Image URL"
                />
              </div>
            </div>

            <div class="sm:col-span-3">
              <label
                for="purchase_price"
                class="block text-sm font-medium leading-6 text-white"
                >Purchase Price</label
              >
              <input
                v-model="property.purchase_price"
                type="number"
                id="purchase_price"
                class="block w-full bg-gray-800 border-gray-600 text-white rounded-md py-1.5 shadow-sm focus:ring-primary sm:text-sm sm:leading-6"
                placeholder="Purchase Price"
              />
            </div>

            <div class="sm:col-span-3">
              <label
                for="balance_to_close"
                class="block text-sm font-medium leading-6 text-white"
                >Balance to Close</label
              >
              <input
                v-model="property.balance_to_close"
                type="number"
                id="balance_to_close"
                class="block w-full bg-gray-800 border-gray-600 text-white rounded-md py-1.5 shadow-sm focus:ring-primary sm:text-sm sm:leading-6"
                placeholder="Balance to Close"
              />
            </div>

            <div class="sm:col-span-3">
              <label
                for="monthly_holding_cost"
                class="block text-sm font-medium leading-6 text-white"
                >Monthly Holding Cost</label
              >
              <input
                v-model="property.monthly_holding_cost"
                type="number"
                id="monthly_holding_cost"
                class="block w-full bg-gray-800 border-gray-600 text-white rounded-md py-1.5 shadow-sm focus:ring-primary sm:text-sm sm:leading-6"
                placeholder="Monthly Holding Cost"
              />
            </div>

            <div class="sm:col-span-3">
              <label
                for="interest_rate"
                class="block text-sm font-medium leading-6 text-white"
                >Interest Rate</label
              >
              <input
                v-model="property.interest_rate"
                type="number"
                id="interest_rate"
                class="block w-full bg-gray-800 border-gray-600 text-white rounded-md py-1.5 shadow-sm focus:ring-primary sm:text-sm sm:leading-6"
                placeholder="Interest Rate"
                step="0.01"
                min="0"
                max="100"
              />
            </div>

            <div class="col-span-3">
              <label
                for="transaction_document_url"
                class="block text-sm font-medium leading-6 text-white"
                >Transaction Document Url</label
              >
              <input
                v-model="property.transaction_document_url"
                type="text"
                id="transaction_document_url"
                class="block w-full bg-gray-800 border-gray-600 text-white rounded-md py-1.5 shadow-sm focus:ring-primary sm:text-sm sm:leading-6"
                placeholder="Url"
              />
            </div>

            <!-- <div class="col-span-3">
            <label for="benefit_sheet_url" class="block text-sm font-medium leading-6 text-white">Benefit Sheet Url</label>
            <input v-model="property.benefit_sheet_url" type="text" id="benefit_sheet_url" class="block w-full bg-gray-800 border-gray-600 text-white rounded-md py-1.5 shadow-sm focus:ring-primary sm:text-sm sm:leading-6" placeholder="Url">
          </div> -->

            <div class="sm:col-span-3">
              <label
                for="escrow"
                class="block text-sm font-medium leading-6 text-white"
                >Escrow</label
              >
              <input
                v-model="property.escrow"
                type="number"
                step="0.01"
                id="escrow"
                class="block w-full bg-gray-800 border-gray-600 text-white rounded-md py-1.5 shadow-sm focus:ring-primary sm:text-sm sm:leading-6"
                placeholder="Escrow in USD"
              />
            </div>

            <div class="sm:col-span-3">
              <label
                for="deal_holder"
                class="block text-sm font-medium leading-6 text-white"
                >Deal Holder</label
              >
              <input
                v-model="property.deal_holder"
                type="text"
                id="deal_holder"
                class="block w-full bg-gray-800 border-gray-600 text-white rounded-md py-1.5 shadow-sm focus:ring-primary sm:text-sm sm:leading-6"
                placeholder="Deal Holder"
              />
            </div>

            <div class="col-span-3">
              <label
                for="price_breakdown"
                class="block text-sm font-medium leading-6 text-white"
                >Price Breakdown</label
              >
              <textarea
                v-model="property.price_breakdown"
                id="price_breakdown"
                rows="4"
                class="block w-full bg-gray-800 border-gray-600 text-white rounded-md py-1.5 shadow-sm focus:ring-primary sm:text-sm sm:leading-6"
                placeholder="Price breakdown"
              ></textarea>
            </div>

            <div class="col-span-3">
              <label
                for="additional_benefits"
                class="block text-sm font-medium leading-6 text-white"
                >Additional Benefits</label
              >
              <textarea
                v-model="property.additional_benefits"
                id="additional_benefits"
                rows="4"
                class="block w-full bg-gray-800 border-gray-600 text-white rounded-md py-1.5 shadow-sm focus:ring-primary sm:text-sm sm:leading-6"
                placeholder="Additional benefits"
              ></textarea>
            </div>

            <div class="sm:col-span-4 flex items-center">
              <input
                v-model="property.in_house_deal"
                type="checkbox"
                id="in_house_deal"
                class="mr-2 bg-gray-700 border-gray-600"
              />
              <label
                for="in_house_deal"
                class="block text-sm font-medium leading-6 text-white"
                >In House Deal</label
              >
            </div>

            <div class="sm:col-span-4 flex items-center">
              <input
                v-model="property.rental_restriction"
                type="checkbox"
                id="rental_restriction"
                class="mr-2 bg-gray-700 border-gray-600"
              />
              <label
                for="rental_restriction"
                class="block text-sm font-medium leading-6 text-white"
                >Rental Restriction</label
              >
            </div>
          </div>

          <div v-else-if="data.loading" class="text-white">Loading</div>
        </div>

        <!-- Form Actions -->
        <div class="mt-6 pb-6 flex items-center justify-end gap-x-6">
          <a href="/admin">
            <button
              type="button"
              class="text-sm font-semibold leading-6 text-white hover:text-gray-300"
            >
              Cancel
            </button>
          </a>
          <button
            :disabled="data.form.loading || !property.price"
            type="submit"
            class="rounded-md bg-primary px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-400 disabled:opacity-50"
          >
            Save
          </button>
        </div>
      </div>
    </form>
    
  </div>
</template>

<script setup>
import { ref } from "vue";
import { usePropertiesStore } from "~/store/DataStore";
import { GoogleMap, Marker } from "vue3-google-map";
import debounce from "lodash.debounce";

const config = useRuntimeConfig();

const access_token = config.public.MAPBOX_API_TOKEN;
const zillowApiKey = config.public.ZILLOW_API_KEY;

const props = defineProps({
  property: Object,
  created_by: {
    type: String,
    default: "user",
    validator: (value) => ["user", "admin"].includes(value),
  },
  redirect: {
    type: String,
    default: "/admin/",
  },
});

const mapRef = ref(null);

const manualInput = ref(false);

const route = useRoute();

const data = reactive({
  loading: false,
  errors: {},
  form: {
    latitude: null,
    longitude: null,
    address: null,
    unit_number: null,
    is_appartment: null,
    type: null,
    loading: false,
  },
});

const defaultProperty = {
  address: "",
  price: null,
  down_payment: null,
  total_price: null,
  interest: null,
  monthly_payment: null,
  description: "",
  arv: null,
  benefits: "",
  images: [], // Initialize as a JSON string
  sold: false,
  bedrooms: null,
  bathrooms: null,
  rent_zestimate: null,
  zestimate: null,
  property_type: "",
  zoning: "",
  lot_size: null,
  living_area: null,
  year_built: null,
  price_per_square_foot: null,
  purchase_price: null,
  balance_to_close: null,
  monthly_holding_cost: null,
  interest_rate: null,
  nearby_hospitals: [],
  nearby_schools: [],
  nearby_homes: [],
  price_history: [],
  tax_history: [],
  contact_recipients: [
    {
      agent_reason: 1,
      zpro: null,
      recent_sales: 0,
      review_count: 0,
      display_name: "Rahul Valecha",
      zuid: "X1-ZUtp0k7oy516o9_7rj5o",
      rating_average: 0,
      badge_type: "Premier Agent",
      phone: { prefix: "", areacode: "682", number: "375-1867" },
      image_url:
        "https://drscdn.500px.org/photo/1095517488/q%3D50_w%3D1000_of%3D1/v2?sig=846ed9856973e0fa1d074bd15553dd91fc55124257c6af4cbde5e44852f9c91c",
      email: "rahul@urcreativesolutions.com",
    },
  ],
  monthly_hoa_fee: null,
  transaction_document_url: null,
  escrow: null,
  deal_holder: "",
  in_house_deal: false,
  rental_restriction: false,
  price_breakdown: null,
  additional_benefits: null,
  created_by: "user", // Default value
};

const property = ref({ ...defaultProperty });

onMounted(() => {
  if (props.property) {
    property.value = { ...props.property };

    // Parsing images
    if (typeof property.value.images === "string") {
      try {
        property.value.images = JSON.parse(property.value.images);
        if (!Array.isArray(property.value.images)) {
          property.value.images = [];
        }
      } catch (error) {
        property.value.images = [];
      }
    }

    // Parsing contact_recipients
    if (typeof property.value.contact_recipients === "string") {
      try {
        property.value.contact_recipients = JSON.parse(
          property.value.contact_recipients
        );
        if (!Array.isArray(property.value.contact_recipients)) {
          property.value.contact_recipients = [];
        }
      } catch (error) {
        property.value.contact_recipients = [];
      }
    }
  }

  // Set the created_by value from props
  property.value.created_by = props.created_by;
  
  
});

const apiUrl = ref(`https://zillow-com1.p.rapidapi.com/property?address=`);

const updateAddress = async () => {
  let fullAddress = data.form.address;
  if (data.form.is_appartment && data.form.unit_number) {
    fullAddress += `, ${data.form.type} ${data.form.unit_number}`;
  }
  property.value.address = fullAddress;

  // Trigger the API request with the updated address
  if (!props.property) {
    data.loading = true;
    apiUrl.value = `https://zillow-com1.p.rapidapi.com/property?address=${encodeURIComponent(
      fullAddress
    )}`;
    await fetchPropertyData();
  }
};

watch(manualInput, (newValue) => {
  if (newValue) {
    data.form.address = "";
    data.form.latitude = null;
    data.form.longitude = null;
  }
});

watch(
  () => property.value.balance_to_close,
  (newBalanceToClose) => {
    if (Number(newBalanceToClose > 0)) {
      property.value.price = Number(newBalanceToClose);
    }
  }
);

const fetchPropertyData = async () => {
  const { data, error } = await $fetch(apiUrl.value, {
    headers: {
      "X-RapidAPI-Key": zillowApiKey,
      "X-RapidAPI-Host": "zillow-com1.p.rapidapi.com",
    },
    onRequest({ request, options }) {
      // Set the request headers
      options.headers = options.headers || {};
    },
    onRequestError({ request, options, error }) {
      // Handle the request errors
      console.error("Request error:", error);
    },
    onResponse({ request, response, options }) {
      // Process the response data
      if (response.ok && response._data?.zpid) {
        fetchPropertyImages(response._data.zpid);
        property.value.price = response._data.price;
        property.value.bedrooms = response._data.bedrooms;
        property.value.bathrooms = response._data.bathrooms;
        property.value.description = response._data.description;
        property.value.rent_zestimate = response._data.rentZestimate;
        property.value.zestimate = response._data.zestimate;
        property.value.property_type = response._data.homeType;
        property.value.zoning = response._data.zoning
          ? response._data.zoning
          : response._data.zoning;
        property.value.lot_size = response._data.lotSize
          ? response._data.lotSize
          : null;
        property.value.living_area = response._data.livingArea;
        property.value.year_built = response._data.yearBuilt;
        property.value.price_per_square_foot =
          response._data.resoFacts.pricePerSquareFoot;
        property.value.nearby_schools = response._data.schools;
        property.value.nearby_homes = response._data.nearbyHomes;
        property.value.price_history = response._data.priceHistory;
        property.value.tax_history = response._data.taxHistory;
        property.value.monthly_hoa_fee = response._data.monthlyHoaFee
          ? response._data.monthlyHoaFee
          : null;
      } else {
        console.error("Response error:", response.status);
      }
    },
    onResponseError({ request, response, options }) {
      // Handle the response errors
      console.error("Response error:", response.status);
    },
  });
};


const handleSubmit = async (e) => {
  data.form.loading = true;
  const propertiesStore = usePropertiesStore();

  let propertyToSubmit = {
    ...property.value,
    images: JSON.stringify(property.value.images),
    nearby_homes: JSON.stringify(property.value.nearby_homes),
    nearby_schools: JSON.stringify(property.value.nearby_schools),
    price_history: JSON.stringify(property.value.price_history),
    tax_history: JSON.stringify(property.value.tax_history),
    contact_recipients: JSON.stringify(property.value.contact_recipients),
    created_by: props.created_by,
  };
  if (manualInput.value) {
    propertyToSubmit.address = property.value.address;
  }
  if (props.property && props.property.ID) {
    console.log("Updating property...", propertyToSubmit);
    await propertiesStore.store({ property: propertyToSubmit });
  } else {
    console.log("Creating new property...", propertyToSubmit);
    let response = await propertiesStore.store({ property: propertyToSubmit });
    let parsedResponse = JSON.parse(response);
    let propertyID = parsedResponse.ID;
    await sendWebHook({
      ID: propertyID,
      ...propertyToSubmit,
    });
  }
  data.form.loading = false;
  await navigateTo(props.redirect);
};




const sendWebHook = async (propertyToSubmit) => {
  const backendUrl = "/.netlify/functions/property-into-sheet";

  const headers = {
    "Content-Type": "application/json",
  };

  const payload = {
    property: propertyToSubmit,
  };

  try {
    const response = await fetch(backendUrl, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(payload),
    });

    console.log(response);
  } catch (error) {
    console.error("Error adding property via serverless function:", error);
  }
};

const handleRetrieve = async (event) => {
  if (event.detail.features.length) {
    data.form.latitude =
      event.detail.features[0].properties.coordinates.latitude;
    data.form.longitude =
      event.detail.features[0].properties.coordinates.longitude;
    data.form.address = event.detail.features[0].properties.full_address;
    updateAddress();
    if (data.form.is_appartment && data.form.unit_number) {
      property.value.address += ` Unit ${data.form.unit_number}, ${data.form.type}`;
    }
  } else {
    alert("You must search a location and select from the dropdown menu.");
  }
};

const fetchPropertyImages = async (zpid) => {
  const apiUrl = `https://zillow-com1.p.rapidapi.com/images?zpid=${zpid}`;
  const response = await $fetch(apiUrl, {
    headers: {
      "X-RapidAPI-Key": zillowApiKey,
      "X-RapidAPI-Host": "zillow-com1.p.rapidapi.com",
    },
  });
  if (response.images.length) {
    property.value.images = response.images.slice(0, 12);
  } else {
    console.error("Error fetching images");
  }
  data.loading = false;
};

const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const toRad = (value) => (value * Math.PI) / 180;
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in kilometers
};

const addImage = () => {
  property.value.images.push("");
};

const removeImage = (index) => {
  property.value.images.splice(index, 1);
};
</script>
