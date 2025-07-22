<template>
  <div>
    <form @submit.prevent="handleSubmit">
      <div class="space-y-12">
        <div
          class="border-b border-gray-700 pb-4"
          :class="property.address || showForm ? 'pb-8' : 'pb-0'"
        >
          <div class="flex items-center mb-6">
            <NuxtLink
              :to="props.created_by === 'user' ? '/' : '/admin/'">
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
              class="mr-2 h-4 w-4 rounded border-gray-600 bg-gray-700 text-primary focus:ring-primary"
            />
            <label
              for="manual-input"
              class="block text-sm font-medium leading-6 text-white"
              >Manual input (skip address search)</label
            >
          </div>

          <!-- Apartment toggle -->
          <div v-if="!props.property && !manualInput"> <!-- Hide if manual input -->
            <div class="mt-5 flex items-center">
              <input
                v-model="data.form.is_appartment"
                type="checkbox"
                id="is_appartment"
                class="mr-2 h-4 w-4 rounded border-gray-600 bg-gray-700 text-primary focus:ring-primary"
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
                  >Unit Type</label
                >
                <select
                  v-model="data.form.type"
                  id="type"
                  class="block w-full rounded-md border-0 bg-white/5 py-1.5 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6 [&_*]:text-black"
                >
                  <option value="">Select Type</option>
                  <option value="SUITE">Suite</option>
                  <option value="UNIT">Unit</option>
                  <option value="APT">Apartment</option> <!-- Common abbreviation -->
                  <option value="RM">Room</option>
                  <option value="# ">#</option> <!-- Allow just '#' -->
                </select>
              </div>
              <div class="flex-1">
                <label
                  for="unit-number"
                  class="block text-sm font-medium leading-6 text-white"
                  >Unit Number</label
                >
                <input
                  v-model.trim="data.form.unit_number"
                  type="text"
                  id="unit-number"
                  class="block w-full rounded-md border-0 bg-white/5 py-1.5 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                  placeholder="e.g., 10B, 203"
                />
              </div>
            </div>

            <!-- Mapbox Search -->
            <div v-if="!manualInput" class="mt-5">
              <mapbox-search-box
                :access-token="access_token"
                placeholder="Search Address (Street, City, State, Zip)"
                :options="{
                  country: 'US',
                  limit: 6,
                  bbox: [-171.791110603, 18.91619, -66.96466, 71.3577635769],
                }"
                types="address"
                @retrieve="handleRetrieve"
                proximity="ip"
                theme="dark"
              >
              </mapbox-search-box>
               <!-- Add custom styling via CSS if theme='dark' isn't enough -->
            </div>
          </div>

          <!-- Property Form Fields Block -->
          <!-- MODIFIED v-if using computed property -->
          <div
            v-if="showForm"
            class="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6 mt-5"
          >
            <!-- Address (now potentially read-only if not manual/editing?) -->
            <div class="col-span-full sm:col-span-4">
              <label
                for="address"
                class="block text-sm font-medium leading-6 text-white"
                >Full Address</label
              >
              <input
                v-model="property.address"
                required
                :readonly="!manualInput && !props.property"
                type="text"
                id="address"
                class="block w-full rounded-md border-0 bg-white/5 py-1.5 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6 disabled:opacity-50 read-only:opacity-70"
                placeholder="Property Address"
              />
            </div>

             <div class="sm:col-span-2 flex items-end pb-1"> <!-- Adjusted alignment -->
              <input
                v-model="property.sold"
                type="checkbox"
                id="sold"
                class="mr-2 h-4 w-4 rounded border-gray-600 bg-gray-700 text-primary focus:ring-primary"
              />
              <label
                for="sold"
                class="block text-sm font-medium leading-6 text-white"
                >Sold</label
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
                 class="block w-full rounded-md border-0 bg-white/5 py-1.5 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                placeholder="e.g., Single Family"
              />
            </div>

            <div class="sm:col-span-3">
              <label
                for="bedrooms"
                class="block text-sm font-medium leading-6 text-white"
                >Bedrooms</label
              >
              <input
                v-model.number="property.bedrooms"
                required
                type="number"
                step="1"
                min="0"
                id="bedrooms"
                 class="block w-full rounded-md border-0 bg-white/5 py-1.5 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                placeholder="Beds"
              />
            </div>

            <div class="sm:col-span-3">
              <label
                for="bathrooms"
                class="block text-sm font-medium leading-6 text-white"
                >Bathrooms</label
              >
              <input
                v-model.number="property.bathrooms"
                required
                type="number"
                step="0.5"
                 min="0"
                id="bathrooms"
                class="block w-full rounded-md border-0 bg-white/5 py-1.5 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                placeholder="Baths"
              />
            </div>

            <div class="sm:col-span-3">
              <label
                for="price"
                class="block text-sm font-medium leading-6 text-white"
                >Price ($)(auto-filled from Balance to Close)</label
              >
              <input
                v-model.number="property.price"
                required
                type="number"
                step="0.01"
                 min="0"
                id="price"
                class="block w-full rounded-md border-0 bg-white/5 py-1.5 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                placeholder="Price in USD"
              />
            </div>

            <div class="sm:col-span-3">
              <label
                for="monthly_hoa_fee"
                class="block text-sm font-medium leading-6 text-white"
                >Monthly HOA Fee ($)</label
              >
              <input
                v-model.number="property.monthly_hoa_fee"
                type="number"
                 step="0.01"
                 min="0"
                id="monthly_hoa_fee"
                class="block w-full rounded-md border-0 bg-white/5 py-1.5 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                placeholder="HOA Fee (Optional)"
              />
            </div>

             <div class="sm:col-span-3">
              <label
                for="living-area"
                class="block text-sm font-medium leading-6 text-white"
                >Living Area (sq ft)</label
              >
              <input
                v-model.number="property.living_area"
                type="number"
                 min="0"
                id="living-area"
                class="block w-full rounded-md border-0 bg-white/5 py-1.5 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                placeholder="Living Area"
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
                 class="block w-full rounded-md border-0 bg-white/5 py-1.5 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                placeholder="Description of the property"
              ></textarea>
            </div>

            <!-- Collapsible Section for Less Common Fields -->
            <details class="col-span-full mt-4 border-t border-gray-700 pt-4">
              <summary class="text-sm font-medium leading-6 text-white cursor-pointer hover:text-gray-300">
                Additional Details (Zillow Estimates, Lot, Year Built, etc.)
              </summary>
              <div class="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6 mt-5">

                <div class="sm:col-span-3">
                  <label
                    for="rent-zestimate"
                    class="block text-sm font-medium leading-6 text-white"
                    >Est. Rent (Zillow, $)</label
                  >
                  <input
                    v-model.number="property.rent_zestimate"
                    type="number"
                    step="1"
                    min="0"
                    id="rent-zestimate"
                    class="block w-full rounded-md border-0 bg-white/5 py-1.5 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                    placeholder="Zillow Rent Est."
                  />
                </div>

                <div class="sm:col-span-3">
                  <label
                    for="zestimate"
                    class="block text-sm font-medium leading-6 text-white"
                    >Est. Value (Zillow, $)</label
                  >
                  <input
                    v-model.number="property.zestimate"
                    type="number"
                    step="1"
                    min="0"
                    id="zestimate"
                     class="block w-full rounded-md border-0 bg-white/5 py-1.5 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                    placeholder="Zillow Value Est."
                  />
                </div>

                 <div class="sm:col-span-3">
                  <label
                    for="price_per_square_foot"
                    class="block text-sm font-medium leading-6 text-white"
                    >Price Per Sq Ft ($)</label
                  >
                  <input
                    v-model.number="property.price_per_square_foot"
                    type="number"
                     step="0.01"
                     min="0"
                    id="price_per_square_foot"
                     class="block w-full rounded-md border-0 bg-white/5 py-1.5 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                    placeholder="Price / Sq Ft"
                  />
                </div>

                <div class="sm:col-span-3">
                  <label
                    for="year-built"
                    class="block text-sm font-medium leading-6 text-white"
                    >Year Built</label
                  >
                  <input
                    v-model.number="property.year_built"
                    type="number"
                     step="1"
                     min="1000"
                     max="2100"
                    id="year-built"
                     class="block w-full rounded-md border-0 bg-white/5 py-1.5 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                    placeholder="Year Built"
                  />
                </div>

                <div class="sm:col-span-3">
                  <label
                    for="lot-size"
                    class="block text-sm font-medium leading-6 text-white"
                    >Lot Size (sq ft)</label
                  >
                  <input
                    v-model.number="property.lot_size"
                    type="number"
                     min="0"
                    id="lot-size"
                    class="block w-full rounded-md border-0 bg-white/5 py-1.5 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                    placeholder="Lot Size"
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
                    class="block w-full rounded-md border-0 bg-white/5 py-1.5 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                    placeholder="Zoning Code"
                  />
                </div>
             </div>
            </details>

            <!-- Dynamic Image URL Fields -->
            <div class="col-span-full border-t border-gray-700 pt-4">
              <label
                for="images"
                class="block text-sm font-medium leading-6 text-white"
                >Images (URLs)</label
              >
              <div
                v-for="(image, index) in property.images"
                :key="`image-${index}`"
                class="flex space-x-2 mb-2 items-center"
              >
                <input
                  v-model.trim="property.images[index]"
                  type="url"
                  class="block flex-grow rounded-md border-0 bg-white/5 py-1.5 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                  placeholder="https://example.com/image.jpg"
                />
                <button
                  @click.prevent="removeImage(index)"
                  type="button"
                  class="rounded bg-red-700/50 px-2 py-1 text-xs font-semibold text-red-300 hover:bg-red-600/50"
                >
                  Remove
                </button>
              </div>
              <button
                @click.prevent="addImage"
                type="button"
                class="mt-2 rounded bg-indigo-700/50 px-2 py-1 text-sm font-semibold text-indigo-300 hover:bg-indigo-600/50"
              >
                Add Image URL
              </button>
            </div>

            <!-- Contact Recipients (Read-only) -->
            <div class="col-span-full border-t border-gray-700 pt-4">
              <label class="block text-sm font-medium leading-6 text-white mb-2">
                Contact Recipient(s)
              </label>
              <div v-if="property.contact_recipients && property.contact_recipients.length > 0" class="space-y-4">
                <div v-for="(recipient, index) in property.contact_recipients" :key="`contact-${index}`" class="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-6 p-3 bg-gray-800/50 rounded">
                  <div class="sm:col-span-3">
                    <label :for="`contact-name-${index}`" class="block text-xs font-medium text-gray-400">Display Name</label>
                    <input 
                      v-model="recipient.display_name" 
                      type="text" 
                      :id="`contact-name-${index}`" 
                      readonly
                      class="block w-full rounded-md border-0 bg-white/5 py-1.5 text-white shadow-sm ring-1 ring-inset ring-white/10 sm:text-sm sm:leading-6 read-only:opacity-70 cursor-not-allowed" 
                      placeholder="Name"
                    >
                  </div>
                  <div class="sm:col-span-3">
                    <label :for="`contact-email-${index}`" class="block text-xs font-medium text-gray-400">Email</label>
                    <input 
                      v-model="recipient.email" 
                      type="email" 
                      :id="`contact-email-${index}`" 
                      readonly
                      class="block w-full rounded-md border-0 bg-white/5 py-1.5 text-white shadow-sm ring-1 ring-inset ring-white/10 sm:text-sm sm:leading-6 read-only:opacity-70 cursor-not-allowed" 
                      placeholder="Email Address"
                    >
                  </div>
                  <div class="sm:col-span-3">
                    <label :for="`contact-phone-${index}`" class="block text-xs font-medium text-gray-400">Phone</label>
                    <input 
                      v-model="recipient.phone.number" 
                      type="tel" 
                      :id="`contact-phone-${index}`" 
                      readonly
                      class="block w-full rounded-md border-0 bg-white/5 py-1.5 text-white shadow-sm ring-1 ring-inset ring-white/10 sm:text-sm sm:leading-6 read-only:opacity-70 cursor-not-allowed" 
                      placeholder="(xxx) xxx-xxxx"
                    >
                  </div>
                  <!-- <div class="sm:col-span-3">
                    <label :for="`contact-image-${index}`" class="block text-xs font-medium text-gray-400">Image URL</label>
                    <input 
                      v-model="recipient.image_url" 
                      type="url" 
                      :id="`contact-image-${index}`" 
                      readonly
                      class="block w-full rounded-md border-0 bg-white/5 py-1.5 text-white shadow-sm ring-1 ring-inset ring-white/10 sm:text-sm sm:leading-6 read-only:opacity-70 cursor-not-allowed" 
                      placeholder="Image URL (Optional)"
                    >
                  </div> -->
                </div>
              </div>
            </div>

            <!-- Internal / Deal Specific Fields (Collapsible) -->
            <details class="col-span-full mt-4 border-t border-gray-700 pt-4" open>
              <summary class="text-sm font-medium leading-6 text-white cursor-pointer hover:text-gray-300">
                Internal Deal Information (Required)
              </summary>
              <div class="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6 mt-5">
                <div class="sm:col-span-3">
                  <label
                    for="purchase_price"
                    class="block text-sm font-medium leading-6 text-white"
                    >Purchase Price ($) <span class="text-red-500">*</span></label
                  >
                  <input
                    v-model.number="property.purchase_price"
                    type="number" 
                    step="0.01" 
                    min="0"
                    id="purchase_price"
                    required
                    class="block w-full rounded-md border-0 bg-white/5 py-1.5 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                    placeholder="Purchase Price"
                  />
                </div>

                <div class="sm:col-span-3">
                  <label
                    for="balance_to_close"
                    class="block text-sm font-medium leading-6 text-white"
                    >Balance to Close ($) <span class="text-red-500">*</span></label
                  >
                  <input
                    v-model.number="property.balance_to_close"
                    type="number" 
                    step="0.01" 
                    min="0"
                    id="balance_to_close"
                    required
                    class="block w-full rounded-md border-0 bg-white/5 py-1.5 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                    placeholder="Balance to Close"
                  />
                </div>

                <div class="sm:col-span-3">
                  <label
                    for="monthly_holding_cost"
                    class="block text-sm font-medium leading-6 text-white"
                    >Monthly Holding Cost ($) <span class="text-red-500">*</span></label
                  >
                  <input
                    v-model.number="property.monthly_holding_cost"
                    type="number" 
                    step="0.01" 
                    min="0"
                    id="monthly_holding_cost"
                    required
                    class="block w-full rounded-md border-0 bg-white/5 py-1.5 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                    placeholder="Monthly Holding Cost"
                  />
                </div>

                <div class="sm:col-span-3">
                  <label
                    for="interest_rate"
                    class="block text-sm font-medium leading-6 text-white"
                    >Interest Rate (%) <span class="text-red-500">*</span></label
                  >
                  <input
                    v-model.number="property.interest_rate"
                    type="number"
                    id="interest_rate"
                    required
                    class="block w-full rounded-md border-0 bg-white/5 py-1.5 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                    placeholder="Interest Rate"
                    step="0.01"
                    min="0"
                    max="100"
                  />
                </div>

                <div class="sm:col-span-3">
                  <label
                    for="transaction_document_url"
                    class="block text-sm font-medium leading-6 text-white"
                    >Transaction Doc URL <span class="text-red-500">*</span></label
                  >
                  <input
                    v-model="property.transaction_document_url"
                    type="url"
                    id="transaction_document_url"
                    required
                    class="block w-full rounded-md border-0 bg-white/5 py-1.5 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                    placeholder="https://example.com/document"
                  />
                </div>

                <div class="sm:col-span-3">
                  <label
                    for="escrow"
                    class="block text-sm font-medium leading-6 text-white"
                    >Escrow ($) <span class="text-red-500">*</span></label
                  >
                  <input
                    v-model.number="property.escrow"
                    type="number"
                    step="0.01" 
                    min="0"
                    id="escrow"
                    required
                    class="block w-full rounded-md border-0 bg-white/5 py-1.5 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                    placeholder="Escrow Amount"
                  />
                </div>

                <div class="sm:col-span-3">
                  <label
                    for="deal_holder"
                    class="block text-sm font-medium leading-6 text-white"
                    >Deal Holder <span class="text-red-500">*</span></label
                  >
                  <input
                    v-model="property.deal_holder"
                    type="text"
                    id="deal_holder"
                    required
                    class="block w-full rounded-md border-0 bg-white/5 py-1.5 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                    placeholder="Deal Holder Name"
                  />
                </div>

                <div class="sm:col-span-3 sm:col-start-1">
                  <label
                    for="price_breakdown"
                    class="block text-sm font-medium leading-6 text-white"
                    >Price Breakdown Notes <span class="text-red-500">*</span></label
                  >
                  <textarea
                    v-model="property.price_breakdown"
                    id="price_breakdown"
                    rows="3"
                    required
                    class="block w-full rounded-md border-0 bg-white/5 py-1.5 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                    placeholder="Notes on price breakdown (required)"
                  ></textarea>
                </div>

                <div class="sm:col-span-3">
                  <label
                    for="additional_benefits"
                    class="block text-sm font-medium leading-6 text-white"
                    >Additional Benefits Notes</label
                  >
                  <textarea
                    v-model="property.additional_benefits"
                    id="additional_benefits"
                    rows="3"
                    class="block w-full rounded-md border-0 bg-white/5 py-1.5 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                    placeholder="Notes on additional benefits"
                  ></textarea>
                </div>

                <div class="sm:col-span-3 flex items-center">
                  <input
                    v-model="property.in_house_deal"
                    type="checkbox"
                    id="in_house_deal"
                    class="mr-2 h-4 w-4 rounded border-gray-600 bg-gray-700 text-primary focus:ring-primary"
                  />
                  <label
                    for="in_house_deal"
                    class="block text-sm font-medium leading-6 text-white"
                    >In House Deal</label
                  >
                </div>

                <div class="sm:col-span-3 flex items-center">
                  <input
                    v-model="property.rental_restriction"
                    type="checkbox"
                    id="rental_restriction"
                    class="mr-2 h-4 w-4 rounded border-gray-600 bg-gray-700 text-primary focus:ring-primary"
                  />
                  <label
                    for="rental_restriction"
                    class="block text-sm font-medium leading-6 text-white"
                    >Rental Restriction</label
                  >
                </div>
              </div>
            </details>
            <!-- End Internal Fields -->

          </div>
          <!-- End Property Form Fields Block -->

          <!-- Loading Indicator -->
          <div v-else-if="data.loading" class="mt-5 flex justify-center items-center text-white py-4">
             <!-- Add a spinner or better loading visual -->
             <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
               <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
               <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
             </svg>
             <span>Loading property data...</span>
          </div>

          <!-- Not Found Message -->
          <div v-else-if="fetchComplete && propertyNotFound" class="mt-5 text-center text-red-400 border border-red-400/30 bg-red-900/20 p-4 rounded">
            <p class="font-semibold mb-1">No Property Data Found</p>
            <p class="text-sm">Could not automatically retrieve details for the entered address.</p>
             <p class="text-sm mt-2">Please <span v-if="!manualInput">verify the address and unit number (if applicable) or </span><label for="manual-input" class="underline cursor-pointer hover:text-red-300">check 'Manual input'</label> to enter details yourself.</p>
          </div>

          <!-- Initial/Idle State -->
           <div v-else-if="!data.loading && !fetchComplete && !manualInput && !props.property && !data.form.address" class="mt-5 text-center text-gray-400 border border-gray-700 p-4 rounded bg-gray-800/30">
             Enter an address using the search box above
             <span v-if="!props.property"> or <label for="manual-input" class="underline cursor-pointer hover:text-gray-200">check 'Manual input'</label></span>
              to begin.
           </div>

        </div>

        <!-- Form Actions -->
        <div class="mt-6 pb-6 flex items-center justify-end gap-x-6 border-t border-gray-700 pt-6">
          <NuxtLink :to="props.redirect"> <!-- Use NuxtLink for client-side nav -->
            <button
              type="button"
              class="text-sm font-semibold leading-6 text-gray-300 hover:text-white"
            >
              Cancel
            </button>
          </NuxtLink>
          <button
            :disabled="data.form.loading || data.loading || (!showForm && !manualInput && !props.property)"
            type="submit"
            class="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ data.form.loading ? 'Saving...' : 'Save Property' }}
          </button>
        </div>
      </div>
    </form>

  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch, computed } from "vue";
import { usePropertiesStore } from "~/store/DataStore";
// import { GoogleMap, Marker } from "vue3-google-map"; // Not used in template
import debounce from "lodash.debounce";
import { useRoute, useRouter, navigateTo } from '#app'; // Use Nuxt 3 imports

// Use defineProps for props definition in <script setup>
const props = defineProps({
  property: {
    type: Object,
    default: null // Use null as default for objects that might not exist
  },
  created_by: {
    type: String,
    default: "user",
    validator: (value) => ["user", "admin"].includes(value),
  },
  redirect: {
    type: String,
    default: "/admin/", // Consider context-aware default (e.g., based on created_by)
  },
});

const config = useRuntimeConfig();
const router = useRouter(); // If needed for programmatic navigation beyond navigateTo
const route = useRoute(); // If needed to access route params/query

const access_token = config.public.MAPBOX_API_TOKEN;
const zillowApiKey = config.public.ZILLOW_API_KEY;

// Component State
const manualInput = ref(false);
const propertyNotFound = ref(false);
const fetchComplete = ref(false); // Tracks completion of the fetch cycle

const data = reactive({
  loading: false, // For overall Zillow fetch loading state
  errors: {},
  form: {
    // Holds user input before applying to property.value or fetching
    latitude: null,
    longitude: null,
    address: null, // Address selected from Mapbox
    unit_number: null,
    is_appartment: false, // Default to false
    type: null,
    loading: false, // For form submission loading state
  },
});

// Default structure for a property object
const defaultProperty = {
  address: "", // Final formatted address
  price: null,
  bedrooms: null,
  bathrooms: null,
  description: "",
  images: [],
  sold: false,
  rent_zestimate: null,
  zestimate: null,
  property_type: "",
  zoning: "",
  lot_size: null,
  living_area: null,
  year_built: null,
  price_per_square_foot: null,
  monthly_hoa_fee: null,
  nearby_hospitals: [], // Keep if used, ensure parsing
  nearby_schools: [],
  nearby_homes: [],
  price_history: [],
  tax_history: [],
  contact_recipients: [ // Ensure at least one default contact structure
    {
      display_name: "Sahil Valecha",
      email: "deals@urcreativesolutions.com",
      phone: { prefix: "", areacode: "786", number: "969-9945" },
      image_url: "",
      // Remove Zillow-specific fields if not always available/needed
      // agent_reason: 1, zpro: null, recent_sales: 0, review_count: 0, zuid: "", rating_average: 0, badge_type: "",
    },
  ],
  purchase_price: null,
  balance_to_close: null,
  monthly_holding_cost: null,
  interest_rate: null,
  transaction_document_url: null,
  escrow: null,
  deal_holder: "",
  in_house_deal: false,
  rental_restriction: false,
  price_breakdown: null,
  additional_benefits: null,
  created_by: "user",
  // Remove fields not strictly part of property data model if appropriate
  // down_payment: null, total_price: null, interest: null, monthly_payment: null, arv: null, benefits: "",
};

// The main reactive property object being edited/created
const property = ref({ ...JSON.parse(JSON.stringify(defaultProperty)) }); // Deep clone default

// --- Computed Properties ---

// Determines if the main property form should be displayed
const showForm = computed(() => {
  if (props.property) return true; // Always show if editing existing property
  if (manualInput.value) return true; // Show if manual input is checked
  // Show if a fetch was completed successfully for a searched address
  if (fetchComplete.value && !propertyNotFound.value && data.form.address) return true;
  return false;
});

// --- Lifecycle Hooks ---
onMounted(() => {
  if (props.property) {
    // Editing existing property: Merge prop data with defaults, parse JSON fields
    const propData = JSON.parse(JSON.stringify(props.property)); // Deep clone prop
    property.value = { ...JSON.parse(JSON.stringify(defaultProperty)), ...propData }; // Merge, ensure all keys exist

    // Safely parse JSON string fields into arrays/objects
    const parseJsonField = (fieldName, defaultVal = []) => {
      if (typeof property.value[fieldName] === 'string') {
        try {
          const parsed = JSON.parse(property.value[fieldName]);
          property.value[fieldName] = Array.isArray(parsed) ? parsed : defaultVal;
        } catch (error) {
          console.error(`Error parsing ${fieldName}:`, error);
          property.value[fieldName] = defaultVal;
        }
      } else if (!property.value[fieldName] || (Array.isArray(defaultVal) && !Array.isArray(property.value[fieldName]))) {
         property.value[fieldName] = defaultVal;
      }
    };

    parseJsonField('images', []);
    parseJsonField('nearby_homes', []);
    parseJsonField('nearby_schools', []);
    parseJsonField('price_history', []);
    parseJsonField('tax_history', []);

    // ALWAYS use hardcoded contact recipients - don't parse from property
    property.value.contact_recipients = [{ ...defaultProperty.contact_recipients[0] }];

    // Ensure images is always an array
    if (!Array.isArray(property.value.images)) {
      property.value.images = [];
    }

    fetchComplete.value = true; // Assume fetch is "complete" when editing existing data
    propertyNotFound.value = false;

  } else {
     // Creating new property: Start with default values
     property.value = { ...JSON.parse(JSON.stringify(defaultProperty)) };
     fetchComplete.value = false; // No fetch yet
     propertyNotFound.value = false;
  }

  // Always set created_by from props
  property.value.created_by = props.created_by;
});

// --- Watchers ---

// Reset state when switching manual input mode
watch(manualInput, (newValue) => {
  fetchComplete.value = false;
  propertyNotFound.value = false;
  data.loading = false;
  if (newValue) {
    // Clear auto-search related fields if switching TO manual
    data.form.address = null;
    data.form.latitude = null;
    data.form.longitude = null;
    // Reset property fields to default EXCEPT created_by
     const creator = property.value.created_by; // Preserve creator
     property.value = { ...JSON.parse(JSON.stringify(defaultProperty)), created_by: creator };
  } else {
    // Optionally clear manual fields if switching FROM manual (if any exist)
  }
});

// Reset state if address search is cleared
watch(() => data.form.address, (newAddress) => {
  if (!newAddress && !manualInput.value && !props.property) {
     fetchComplete.value = false;
     propertyNotFound.value = false;
     data.loading = false;
     // Reset property fields as well
     const creator = property.value.created_by; // Preserve creator
     property.value = { ...JSON.parse(JSON.stringify(defaultProperty)), created_by: creator };
  }
  // Debounced fetch is handled separately
});


// --- Methods ---

// Constructs the full address and triggers the debounced fetch
const prepareAndFetchAddress = () => {
  if (manualInput.value || !data.form.address) {
    data.loading = false;
    fetchComplete.value = false;
    return; // Don't fetch if manual or no base address
  }

  let fullAddress = data.form.address;
  if (data.form.is_appartment && data.form.unit_number && data.form.type) {
    fullAddress += `, ${data.form.type} ${data.form.unit_number}`;
  } else if (data.form.is_appartment && data.form.unit_number) { // Fallback if type missing
    fullAddress += ` #${data.form.unit_number}`; // Use # as common default
  }
  property.value.address = fullAddress; // Update display address immediately

  // Start loading states and reset flags before debounced call
  data.loading = true;
  fetchComplete.value = false;
  propertyNotFound.value = false;

  // Reset property fields that will be fetched
   const creator = property.value.created_by; // Preserve creator
   const currentAddress = property.value.address; // Preserve formatted address
   property.value = { ...JSON.parse(JSON.stringify(defaultProperty)), created_by: creator, address: currentAddress };
   property.value.description = ""; // Clear description specifically

  debouncedFetchPropertyData(fullAddress); // Call the debounced fetch function
};

// Debounced function for fetching Zillow data
const debouncedFetchPropertyData = debounce(async (addressToFetch) => {
  if (!addressToFetch) {
      data.loading = false;
      fetchComplete.value = true; // Considered complete (as nothing to fetch)
      propertyNotFound.value = true; // No address, so not found
      return;
  }
  const apiUrl = `https://zillow-com1.p.rapidapi.com/property?address=${encodeURIComponent(addressToFetch)}`;
  await fetchPropertyData(apiUrl);
}, 800); // Adjust debounce time as needed (e.g., 800ms)

// Watch relevant form fields to trigger address preparation and fetch
watch(() => data.form.address, prepareAndFetchAddress);
watch(() => data.form.unit_number, prepareAndFetchAddress);
watch(() => data.form.type, prepareAndFetchAddress);
watch(() => data.form.is_appartment, prepareAndFetchAddress);

watch(() => property.value.balance_to_close, (newBalance) => {
  if (newBalance !== null && newBalance !== undefined) {
    property.value.price = newBalance;
  }
});

// The actual Zillow API fetch logic
const fetchPropertyData = async (url) => {
  try {
    const responseData = await $fetch(url, {
      headers: {
        "X-RapidAPI-Key": zillowApiKey,
        "X-RapidAPI-Host": "zillow-com1.p.rapidapi.com",
      },
      // Consider adding timeout?
    });

    if (responseData && responseData.zpid) {
      propertyNotFound.value = false;
      // Map response data to property.value fields (use nullish coalescing)
      property.value.price = responseData.price ?? null;
      property.value.bedrooms = responseData.bedrooms ?? null;
      property.value.bathrooms = responseData.bathrooms ?? null;
      property.value.description = responseData.description ?? "";
      property.value.rent_zestimate = responseData.rentZestimate ?? null;
      property.value.zestimate = responseData.zestimate ?? null;
      property.value.property_type = responseData.homeType ?? "";
      property.value.zoning = responseData.zoning ?? "";
      property.value.lot_size = responseData.lotSize ?? null;
      property.value.living_area = responseData.livingArea ?? null;
      property.value.year_built = responseData.yearBuilt ?? null;
      property.value.price_per_square_foot = responseData.resoFacts?.pricePerSquareFoot ?? null;
      property.value.monthly_hoa_fee = responseData.monthlyHoaFee ?? null;
      // Map other relevant fields: schools, nearbyHomes, priceHistory, taxHistory
      property.value.nearby_schools = responseData.schools ?? [];
      property.value.nearby_homes = responseData.nearbyHomes ?? [];
      property.value.price_history = responseData.priceHistory ?? [];
      property.value.tax_history = responseData.taxHistory ?? [];

      // IMPORTANT: Now fetch images, which will handle final loading/complete state
      await fetchPropertyImages(responseData.zpid);

    } else {
      console.log("No property data found or invalid response from Zillow API.");
      propertyNotFound.value = true;
      data.loading = false; // Stop loading here if no zpid found
      fetchComplete.value = true; // Fetch cycle is complete (unsuccessfully)
    }
  } catch (error) {
    console.error("Error fetching property data:", error);
    propertyNotFound.value = true; // Treat fetch errors as "not found"
    data.loading = false;
    fetchComplete.value = true; // Fetch cycle is complete (on error)
  }
};

// Fetches images based on ZPID
const fetchPropertyImages = async (zpid) => {
  const apiUrl = `https://zillow-com1.p.rapidapi.com/images?zpid=${zpid}`;
  try {
    const response = await $fetch(apiUrl, {
      headers: {
        "X-RapidAPI-Key": zillowApiKey,
        "X-RapidAPI-Host": "zillow-com1.p.rapidapi.com",
      },
    });
    if (response && Array.isArray(response.images) && response.images.length) {
      property.value.images = response.images.slice(0, 12); // Limit images
    } else {
      console.log("No images found for zpid:", zpid);
      property.value.images = [];
    }
  } catch (error) {
    console.error("Error fetching images:", error);
    property.value.images = [];
  } finally {
    // THIS IS THE FINAL STEP of the fetch process
    data.loading = false; // Turn off main loading indicator
    fetchComplete.value = true; // Mark the entire fetch cycle as complete
  }
};

// Handles selection from Mapbox search
const handleRetrieve = async (event) => {
  if (event.detail.features && event.detail.features.length > 0) {
    const feature = event.detail.features[0];
    // Update form data, which will trigger the watcher -> prepareAndFetchAddress
    data.form.latitude = feature.properties.coordinates?.latitude;
    data.form.longitude = feature.properties.coordinates?.longitude;
    data.form.address = feature.properties.address_line1 // Use address_line1 for cleaner street address
                         ? `${feature.properties.address_line1}, ${feature.properties.place}, ${feature.properties.region_code} ${feature.properties.postcode}` // Construct address
                         : feature.properties.full_address; // Fallback to full_address

  } else {
    console.warn("No location selected from the dropdown.");
  }
};

// Adds an empty string for a new image URL input
const addImage = () => {
  if (!Array.isArray(property.value.images)) {
    property.value.images = [];
  }
  property.value.images.push("");
};

// Removes an image URL input by index
const removeImage = (index) => {
  if (Array.isArray(property.value.images)) {
    property.value.images.splice(index, 1);
  }
};

// Handles form submission (Create or Update)
const handleSubmit = async () => {
  data.form.loading = true; // Start submission loading
  data.errors = {}; // Clear previous errors
  const propertiesStore = usePropertiesStore();

  // Prepare data for submission: deep clone and stringify arrays/objects
  let propertyToSubmit = JSON.parse(JSON.stringify(property.value));

  // Ensure fields expected as JSON strings are stringified
  const stringifyField = (fieldName) => {
     if (Array.isArray(propertyToSubmit[fieldName]) || typeof propertyToSubmit[fieldName] === 'object') {
        propertyToSubmit[fieldName] = JSON.stringify(propertyToSubmit[fieldName]);
     } else if (propertyToSubmit[fieldName] === null || propertyToSubmit[fieldName] === undefined) {
         // Decide how to handle nulls - send empty array string '[]' or null?
         // Assuming empty array string for consistency with parsed fields
         propertyToSubmit[fieldName] = '[]';
     }
     // If it's already a string (potentially malformed), leave it? Or try to re-stringify?
     // For safety, let's assume it should be stringified if it came from an array/object
  };

  stringifyField('images');
  stringifyField('nearby_homes');
  stringifyField('nearby_schools');
  stringifyField('price_history');
  stringifyField('tax_history');
  stringifyField('contact_recipients');
   // Stringify other array/object fields if your backend expects them as strings

  // Ensure created_by is correctly set
  propertyToSubmit.created_by = props.created_by;

  try {
    let response;
    if (props.property && props.property.ID) {
      // Update existing property
       console.log("Updating property ID:", props.property.ID);
       propertyToSubmit.ID = props.property.ID; // Ensure ID is part of the payload for update
       response = await propertiesStore.store({ property: propertyToSubmit });
    } else {
      // Create new property
       console.log("Creating new property...");
       response = await propertiesStore.store({ property: propertyToSubmit });
    }

    console.log("Store response:", response);

     // Handle potential string response from store
     let createdOrUpdatedProperty = response;
     if (typeof response === 'string') {
        try {
           createdOrUpdatedProperty = JSON.parse(response);
        } catch (parseError) {
           console.error("Failed to parse store response:", parseError);
           // Handle situation where response is an unexpected string (e.g., simple success message)
           createdOrUpdatedProperty = { ID: null }; // Assume failure to get ID if parse fails
        }
     }

    // Send webhook only on successful creation with an ID
    if (!(props.property && props.property.ID) && createdOrUpdatedProperty && createdOrUpdatedProperty.ID) {
       console.log("Sending webhook for new property ID:", createdOrUpdatedProperty.ID);
       // Pass the *original* object structure (before stringifying arrays) + the new ID to the webhook?
       // Or pass the stringified version? Depends on the webhook receiver. Assuming original structure + ID:
       await sendWebHook({ ...property.value, ID: createdOrUpdatedProperty.ID });
    } else if (!(props.property && props.property.ID)) {
        console.warn("Could not send webhook: Missing ID in creation response.");
    }

    // Navigate on success
    await navigateTo(props.redirect);

  } catch (error) {
    console.error("Error saving property:", error);
    data.errors = { submit: `Failed to save property: ${error.message || 'Unknown error'}. Please try again.` };
    // Optionally display data.errors.submit to the user
  } finally {
    data.form.loading = false; // Stop submission loading
  }
};

// Sends data to the Netlify function (webhook)
const sendWebHook = async (propertyData) => {
  const backendUrl = "/.netlify/functions/property-into-sheet";
  const headers = { "Content-Type": "application/json" };
  const payload = { property: propertyData }; // Send the property data

  try {
    const response = await fetch(backendUrl, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`Webhook failed (${response.status}): ${errorBody}`);
    } else {
      const result = await response.json(); // Assuming function returns JSON
      console.log("Webhook successful:", result);
    }
  } catch (error) {
    console.error("Error sending webhook:", error);
  }
};

</script>

<style>
/* Enhance Mapbox dark theme or provide overrides */
.mapboxgl-ctrl-geocoder {
    box-shadow: none !important;
    border: 1px solid #4b5563; /* gray-600 */
    border-radius: 0.375rem; /* rounded-md */
}
.mapboxgl-ctrl-geocoder--input {
    height: calc(1.5em + 0.75rem + 2px); /* Match form input height */
    padding: 0.375rem 0.75rem !important; /* py-1.5 px-3 */
    background-color: rgba(255, 255, 255, 0.05) !important; /* bg-white/5 */
    color: white !important;
    border: none !important;
    border-radius: 0.375rem; /* rounded-md */
}
 .mapboxgl-ctrl-geocoder--input:focus {
     outline: 2px solid transparent;
     outline-offset: 2px;
     box-shadow: 0 0 0 2px #1f2937, 0 0 0 4px #4f46e5; /* focus:ring-primary based on indigo-600 */
 }

.mapboxgl-ctrl-geocoder--suggestion-list {
     background-color: #1f2937 !important; /* bg-gray-800 */
     border: 1px solid #4b5563 !important; /* border-gray-600 */
     border-radius: 0.375rem; /* rounded-md */
     overflow: hidden;
}
.mapboxgl-ctrl-geocoder--suggestion {
    color: #d1d5db !important; /* gray-300 */
    padding: 0.5rem 0.75rem !important;
    cursor: pointer;
}
.mapboxgl-ctrl-geocoder--suggestion:hover,
.mapboxgl-ctrl-geocoder--suggestion.active {
     background-color: #374151 !important; /* bg-gray-700 */
     color: white !important;
}
/* Adjust icon color if needed */
.mapboxgl-ctrl-geocoder--icon-search {
  fill: #9ca3af; /* gray-400 */
}
.mapboxgl-ctrl-geocoder--icon-loading {
    fill: #6366f1 !important; /* primary */
}

/* Style for details/summary */
details > summary {
  list-style: none; /* Remove default marker */
}
details > summary::-webkit-details-marker {
  display: none; /* Remove default marker for Chrome */
}
details > summary::before {
  content: '+'; /* Add custom marker */
  margin-right: 0.5em;
  display: inline-block;
  transition: transform 0.2s;
}
details[open] > summary::before {
  transform: rotate(45deg);
}

/* Read-only input style */
input:read-only {
    background-color: rgba(55, 65, 81, 0.5); /* bg-gray-700 with opacity */
    cursor: default;
}


/* Tailwind Forms base styles might affect select text color, ensure options are visible */
select option {
    color: #111827; /* Or your desired option text color */
    background-color: white; /* Or your desired option background */
}
/* Style for the select itself when using bg-white/5 */
select.bg-white\/5 {
    background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%239ca3af' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
    background-position: right 0.5rem center;
    background-repeat: no-repeat;
    background-size: 1.5em 1.5em;
    padding-right: 2.5rem;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
    appearance: none;
}

</style>