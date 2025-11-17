<template>
  <div
    class="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 py-4 px-4 sm:px-6 lg:px-8"
  >
    <div class="max-w-4xl mx-auto">
      <form @submit.prevent="handleSubmit" class="space-y-6">
        <!-- Header Section -->
        <div
          class="bg-zinc-900/50 backdrop-blur-sm rounded-xl border border-zinc-800 p-4 sm:p-6 shadow-xl"
        >
          <div class="flex items-center mb-4">
            <NuxtLink
              :to="props.created_by === 'user' ? '/' : '/admin/'"
              class="inline-flex items-center text-white hover:text-gold transition-colors duration-200"
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

          <div class="space-y-2">
            <h2 class="text-2xl sm:text-3xl font-bold text-white">
              {{ props.property ? "Edit Property" : "Add New Property" }}
            </h2>
            <p class="text-sm sm:text-base text-zinc-400">
              {{
                props.property
                  ? "Update property details below"
                  : "Search for an address or enter details manually"
              }}
            </p>
          </div>

          <!-- Manual Input Toggle -->
          <div v-if="!props.property" class="mt-6">
            <label
              class="flex items-start sm:items-center space-x-3 cursor-pointer group"
            >
              <div class="relative flex items-center">
                <input
                  v-model="manualInput"
                  type="checkbox"
                  class="sr-only peer"
                  id="manual-input"
                />
                <div
                  class="w-11 h-6 bg-zinc-800 rounded-full peer peer-checked:bg-gold transition-colors duration-200"
                ></div>
                <div
                  class="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 peer-checked:translate-x-5"
                ></div>
              </div>
              <span
                class="text-sm sm:text-base font-medium text-white group-hover:text-gold transition-colors duration-200"
              >
                Manual input (skip address search)
              </span>
            </label>
          </div>

          <!-- Address Search Section -->
          <div v-if="!props.property && !manualInput" class="mt-6 space-y-4">
            <!-- Apartment Toggle -->
            <label
              class="flex items-start sm:items-center space-x-3 cursor-pointer group"
            >
              <div class="relative flex items-center">
                <input
                  v-model="data.form.is_appartment"
                  type="checkbox"
                  class="sr-only peer"
                  id="is_appartment"
                />
                <div
                  class="w-11 h-6 bg-zinc-800 rounded-full peer peer-checked:bg-gold transition-colors duration-200"
                ></div>
                <div
                  class="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 peer-checked:translate-x-5"
                ></div>
              </div>
              <span
                class="text-sm sm:text-base font-medium text-white group-hover:text-gold transition-colors duration-200"
              >
                Apartment or condo?
              </span>
            </label>

            <!-- Unit Details -->
            <div
              v-if="data.form.is_appartment"
              class="grid grid-cols-1 sm:grid-cols-2 gap-4"
            >
              <div>
                <label
                  for="type"
                  class="block text-sm font-medium text-zinc-400 mb-2"
                >
                  Unit Type
                </label>
                <select
                  v-model="data.form.type"
                  id="type"
                  class="w-full rounded-lg bg-zinc-800/50 border-zinc-700 text-white px-4 py-2.5 focus:ring-2 focus:ring-gold focus:border-transparent transition-all duration-200"
                >
                  <option value="">Select Type</option>
                  <option value="SUITE">Suite</option>
                  <option value="UNIT">Unit</option>
                  <option value="APT">Apartment</option>
                  <option value="RM">Room</option>
                  <option value="#">#</option>
                </select>
              </div>
              <div>
                <label
                  for="unit-number"
                  class="block text-sm font-medium text-zinc-400 mb-2"
                >
                  Unit Number
                </label>
                <input
                  v-model.trim="data.form.unit_number"
                  type="text"
                  id="unit-number"
                  class="w-full rounded-lg bg-zinc-800/50 border-zinc-700 text-white px-4 py-2.5 focus:ring-2 focus:ring-gold focus:border-transparent transition-all duration-200"
                  placeholder="e.g., 10B, 203"
                />
              </div>
            </div>

            <!-- Mapbox Search -->
            <div>
              <label class="block text-sm font-medium text-zinc-400 mb-2">
                Search Address
              </label>
              <mapbox-search-box
                :access-token="access_token"
                placeholder="Enter street address, city, state..."
                :options="{
                  country: 'US',
                  limit: 6,
                  bbox: [-171.791110603, 18.91619, -66.96466, 71.3577635769],
                }"
                types="address"
                @retrieve="handleRetrieve"
                proximity="ip"
                theme="dark"
              />
            </div>
          </div>

          <!-- Loading State -->
          <div
            v-if="data.loading"
            class="mt-6 flex flex-col items-center justify-center py-8 space-y-4"
          >
            <div class="relative">
              <div
                class="w-16 h-16 border-4 border-zinc-800 border-t-gold rounded-full animate-spin"
              ></div>
              <div class="absolute inset-0 flex items-center justify-center">
                <div class="w-8 h-8 bg-gold/20 rounded-full"></div>
              </div>
            </div>
            <div class="text-center space-y-1">
              <p class="text-white font-medium">{{ data.loadingMessage }}</p>
              <p class="text-zinc-500 text-sm">This may take a moment...</p>
            </div>
          </div>

          <!-- Not Found Message -->
          <div
            v-else-if="fetchComplete && propertyNotFound"
            class="mt-6 bg-accent-red/10 border border-accent-red/30 rounded-lg p-4 sm:p-6 text-center space-y-3"
          >
            <svg
              class="w-12 h-12 text-accent-red mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <div class="space-y-2">
              <p class="font-semibold text-accent-red">Property Not Found</p>
              <p class="text-sm text-zinc-400">
                Unable to retrieve details for this address.
              </p>
              <p class="text-sm text-zinc-500">
                Try
                <label
                  for="manual-input"
                  class="underline cursor-pointer hover:text-white"
                  >manual input</label
                >
                instead.
              </p>
            </div>
          </div>

          <!-- Initial State -->
          <div
            v-else-if="
              !data.loading &&
              !fetchComplete &&
              !manualInput &&
              !props.property &&
              !data.form.address
            "
            class="mt-6 bg-zinc-800/30 border border-zinc-700 rounded-lg p-6 sm:p-8 text-center space-y-3"
          >
            <svg
              class="w-12 h-12 text-zinc-600 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <p class="text-zinc-400 text-sm sm:text-base">
              Search for an address above or
              <label
                for="manual-input"
                class="underline cursor-pointer hover:text-white font-medium"
                >enable manual input</label
              >
            </p>
          </div>
        </div>

        <!-- Property Form Fields -->
        <div v-if="showForm" class="space-y-6">
          <!-- Basic Information -->
          <div
            class="bg-zinc-900/50 backdrop-blur-sm rounded-xl border border-zinc-800 p-4 sm:p-6 shadow-xl"
          >
            <h3
              class="text-lg sm:text-xl font-semibold text-white mb-4 flex items-center"
            >
              <svg
                class="w-5 h-5 mr-2 text-gold"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"
                />
              </svg>
              Basic Information
            </h3>

            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div class="sm:col-span-2 lg:col-span-3">
                <label
                  for="address"
                  class="block text-sm font-medium text-zinc-400 mb-2"
                >
                  Full Address <span class="text-accent-red">*</span>
                </label>
                <input
                  v-model="property.address"
                  required
                  :readonly="!manualInput && !props.property"
                  type="text"
                  id="address"
                  class="w-full rounded-lg bg-zinc-800/50 border-zinc-700 text-white px-4 py-2.5 focus:ring-2 focus:ring-gold focus:border-transparent transition-all duration-200 read-only:opacity-70 read-only:cursor-not-allowed"
                  placeholder="123 Main St, City, State 12345"
                />
              </div>

              <div>
                <label
                  for="property-type"
                  class="block text-sm font-medium text-zinc-400 mb-2"
                >
                  Property Type
                </label>
                <input
                  v-model="property.property_type"
                  type="text"
                  id="property-type"
                  class="w-full rounded-lg bg-zinc-800/50 border-zinc-700 text-white px-4 py-2.5 focus:ring-2 focus:ring-gold focus:border-transparent transition-all duration-200"
                  placeholder="Single Family"
                />
              </div>

              <div>
                <label
                  for="bedrooms"
                  class="block text-sm font-medium text-zinc-400 mb-2"
                >
                  Bedrooms <span class="text-accent-red">*</span>
                </label>
                <input
                  v-model.number="property.bedrooms"
                  required
                  type="number"
                  step="1"
                  min="0"
                  id="bedrooms"
                  class="w-full rounded-lg bg-zinc-800/50 border-zinc-700 text-white px-4 py-2.5 focus:ring-2 focus:ring-gold focus:border-transparent transition-all duration-200"
                  placeholder="3"
                />
              </div>

              <div>
                <label
                  for="bathrooms"
                  class="block text-sm font-medium text-zinc-400 mb-2"
                >
                  Bathrooms <span class="text-accent-red">*</span>
                </label>
                <input
                  v-model.number="property.bathrooms"
                  required
                  type="number"
                  step="0.5"
                  min="0"
                  id="bathrooms"
                  class="w-full rounded-lg bg-zinc-800/50 border-zinc-700 text-white px-4 py-2.5 focus:ring-2 focus:ring-gold focus:border-transparent transition-all duration-200"
                  placeholder="2.5"
                />
              </div>

              <div>
                <label
                  for="price"
                  class="block text-sm font-medium text-zinc-400 mb-2"
                >
                  Price ($) <span class="text-accent-red">*</span>
                </label>
                <input
                  v-model.number="property.price"
                  required
                  type="number"
                  step="0.01"
                  min="0"
                  id="price"
                  class="w-full rounded-lg bg-zinc-800/50 border-zinc-700 text-white px-4 py-2.5 focus:ring-2 focus:ring-gold focus:border-transparent transition-all duration-200"
                  placeholder="250000"
                />
              </div>

              <div>
                <label
                  for="living-area"
                  class="block text-sm font-medium text-zinc-400 mb-2"
                >
                  Living Area (sq ft)
                </label>
                <input
                  v-model.number="property.living_area"
                  type="number"
                  min="0"
                  id="living-area"
                  class="w-full rounded-lg bg-zinc-800/50 border-zinc-700 text-white px-4 py-2.5 focus:ring-2 focus:ring-gold focus:border-transparent transition-all duration-200"
                  placeholder="2000"
                />
              </div>

              <div>
                <label
                  for="monthly_hoa_fee"
                  class="block text-sm font-medium text-zinc-400 mb-2"
                >
                  Monthly HOA Fee ($)
                </label>
                <input
                  v-model.number="property.monthly_hoa_fee"
                  type="number"
                  step="0.01"
                  min="0"
                  id="monthly_hoa_fee"
                  class="w-full rounded-lg bg-zinc-800/50 border-zinc-700 text-white px-4 py-2.5 focus:ring-2 focus:ring-gold focus:border-transparent transition-all duration-200"
                  placeholder="150"
                />
              </div>

              <div class="flex items-center pt-6">
                <label class="flex items-center space-x-3 cursor-pointer group">
                  <div class="relative flex items-center">
                    <input
                      v-model="property.sold"
                      type="checkbox"
                      id="sold"
                      class="sr-only peer"
                    />
                    <div
                      class="w-11 h-6 bg-zinc-800 rounded-full peer peer-checked:bg-accent-green transition-colors duration-200"
                    ></div>
                    <div
                      class="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 peer-checked:translate-x-5"
                    ></div>
                  </div>
                  <span
                    class="text-sm font-medium text-white group-hover:text-accent-green transition-colors duration-200"
                  >
                    Mark as Sold
                  </span>
                </label>
              </div>

              <div class="sm:col-span-2 lg:col-span-3">
                <label
                  for="description"
                  class="block text-sm font-medium text-zinc-400 mb-2"
                >
                  Description
                </label>
                <textarea
                  v-model="property.description"
                  id="description"
                  rows="4"
                  class="w-full rounded-lg bg-zinc-800/50 border-zinc-700 text-white px-4 py-2.5 focus:ring-2 focus:ring-gold focus:border-transparent transition-all duration-200 resize-none"
                  placeholder="Beautiful property with modern amenities..."
                ></textarea>
              </div>
            </div>
          </div>

          <!-- Additional Details -->
          <details
            class="group bg-zinc-900/50 backdrop-blur-sm rounded-xl border border-zinc-800 shadow-xl overflow-hidden"
          >
            <summary
              class="cursor-pointer p-4 sm:p-6 hover:bg-zinc-800/30 transition-colors duration-200 flex items-center justify-between"
            >
              <h3
                class="text-lg sm:text-xl font-semibold text-white flex items-center"
              >
                <svg
                  class="w-5 h-5 mr-2 text-gold"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fill-rule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clip-rule="evenodd"
                  />
                </svg>
                Additional Details
              </h3>
              <svg
                class="w-5 h-5 text-zinc-500 transform group-open:rotate-180 transition-transform duration-200"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fill-rule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clip-rule="evenodd"
                />
              </svg>
            </summary>

            <div class="p-4 sm:p-6 pt-0 border-t border-zinc-800">
              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label
                    for="rent-zestimate"
                    class="block text-sm font-medium text-zinc-400 mb-2"
                  >
                    Est. Rent (Zillow)
                  </label>
                  <input
                    v-model.number="property.rent_zestimate"
                    type="number"
                    step="1"
                    min="0"
                    id="rent-zestimate"
                    class="w-full rounded-lg bg-zinc-800/50 border-zinc-700 text-white px-4 py-2.5 focus:ring-2 focus:ring-gold focus:border-transparent transition-all duration-200"
                    placeholder="2500"
                  />
                </div>

                <div>
                  <label
                    for="zestimate"
                    class="block text-sm font-medium text-zinc-400 mb-2"
                  >
                    Est. Value (Zillow)
                  </label>
                  <input
                    v-model.number="property.zestimate"
                    type="number"
                    step="1"
                    min="0"
                    id="zestimate"
                    class="w-full rounded-lg bg-zinc-800/50 border-zinc-700 text-white px-4 py-2.5 focus:ring-2 focus:ring-gold focus:border-transparent transition-all duration-200"
                    placeholder="300000"
                  />
                </div>

                <div>
                  <label
                    for="price_per_square_foot"
                    class="block text-sm font-medium text-zinc-400 mb-2"
                  >
                    Price Per Sq Ft
                  </label>
                  <input
                    v-model.number="property.price_per_square_foot"
                    type="number"
                    step="0.01"
                    min="0"
                    id="price_per_square_foot"
                    class="w-full rounded-lg bg-zinc-800/50 border-zinc-700 text-white px-4 py-2.5 focus:ring-2 focus:ring-gold focus:border-transparent transition-all duration-200"
                    placeholder="150"
                  />
                </div>

                <div>
                  <label
                    for="year-built"
                    class="block text-sm font-medium text-zinc-400 mb-2"
                  >
                    Year Built
                  </label>
                  <input
                    v-model.number="property.year_built"
                    type="number"
                    step="1"
                    min="1000"
                    max="2100"
                    id="year-built"
                    class="w-full rounded-lg bg-zinc-800/50 border-zinc-700 text-white px-4 py-2.5 focus:ring-2 focus:ring-gold focus:border-transparent transition-all duration-200"
                    placeholder="1990"
                  />
                </div>

                <div>
                  <label
                    for="lot-size"
                    class="block text-sm font-medium text-zinc-400 mb-2"
                  >
                    Lot Size (sq ft)
                  </label>
                  <input
                    v-model.number="property.lot_size"
                    type="number"
                    min="0"
                    id="lot-size"
                    class="w-full rounded-lg bg-zinc-800/50 border-zinc-700 text-white px-4 py-2.5 focus:ring-2 focus:ring-gold focus:border-transparent transition-all duration-200"
                    placeholder="5000"
                  />
                </div>

                <div>
                  <label
                    for="zoning"
                    class="block text-sm font-medium text-zinc-400 mb-2"
                  >
                    Zoning
                  </label>
                  <input
                    v-model="property.zoning"
                    type="text"
                    id="zoning"
                    class="w-full rounded-lg bg-zinc-800/50 border-zinc-700 text-white px-4 py-2.5 focus:ring-2 focus:ring-gold focus:border-transparent transition-all duration-200"
                    placeholder="R-1"
                  />
                </div>
              </div>
            </div>
          </details>

          <!-- Images Section -->
          <div
            class="bg-zinc-900/50 backdrop-blur-sm rounded-xl border border-zinc-800 p-4 sm:p-6 shadow-xl"
          >
            <h3
              class="text-lg sm:text-xl font-semibold text-white mb-4 flex items-center"
            >
              <svg
                class="w-5 h-5 mr-2 text-gold"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fill-rule="evenodd"
                  d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                  clip-rule="evenodd"
                />
              </svg>
              Property Images
            </h3>

            <div class="space-y-3">
              <div
                v-for="(image, index) in property.images"
                :key="`image-${index}`"
                class="flex flex-col sm:flex-row gap-2"
              >
                <input
                  v-model.trim="property.images[index]"
                  type="url"
                  class="flex-1 rounded-lg bg-zinc-800/50 border-zinc-700 text-white px-4 py-2.5 focus:ring-2 focus:ring-gold focus:border-transparent transition-all duration-200"
                  placeholder="https://example.com/image.jpg"
                />
                <button
                  @click.prevent="removeImage(index)"
                  type="button"
                  class="sm:w-auto w-full rounded-lg bg-accent-red/20 hover:bg-accent-red/30 border border-accent-red/30 px-4 py-2.5 text-sm font-medium text-accent-red transition-all duration-200"
                >
                  Remove
                </button>
              </div>
              <button
                @click.prevent="addImage"
                type="button"
                class="w-full sm:w-auto rounded-lg bg-gold/20 hover:bg-gold/30 border border-gold/30 px-4 py-2.5 text-sm font-medium text-gold transition-all duration-200"
              >
                + Add Image URL
              </button>
            </div>
          </div>

          <!-- Deal Information -->
          <details
            class="group bg-zinc-900/50 backdrop-blur-sm rounded-xl border border-zinc-800 shadow-xl overflow-hidden"
            open
          >
            <summary
              class="cursor-pointer p-4 sm:p-6 hover:bg-zinc-800/30 transition-colors duration-200 flex items-center justify-between"
            >
              <h3
                class="text-lg sm:text-xl font-semibold text-white flex items-center"
              >
                <svg
                  class="w-5 h-5 mr-2 text-gold"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z"
                  />
                  <path
                    fill-rule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z"
                    clip-rule="evenodd"
                  />
                </svg>
                Deal Information
                <span class="ml-2 text-xs text-accent-red">* Required</span>
              </h3>
              <svg
                class="w-5 h-5 text-zinc-500 transform group-open:rotate-180 transition-transform duration-200"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fill-rule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clip-rule="evenodd"
                />
              </svg>
            </summary>

            <div class="p-4 sm:p-6 pt-0 border-t border-zinc-800">
              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label
                    for="purchase_price"
                    class="block text-sm font-medium text-zinc-400 mb-2"
                  >
                    Purchase Price <span class="text-accent-red">*</span>
                  </label>
                  <input
                    v-model.number="property.purchase_price"
                    type="number"
                    step="0.01"
                    min="0"
                    id="purchase_price"
                    required
                    class="w-full rounded-lg bg-zinc-800/50 border-zinc-700 text-white px-4 py-2.5 focus:ring-2 focus:ring-gold focus:border-transparent transition-all duration-200"
                    placeholder="250000"
                  />
                </div>

                <div>
                  <label
                    for="balance_to_close"
                    class="block text-sm font-medium text-zinc-400 mb-2"
                  >
                    Balance to Close <span class="text-accent-red">*</span>
                  </label>
                  <input
                    v-model.number="property.balance_to_close"
                    type="number"
                    step="0.01"
                    min="0"
                    id="balance_to_close"
                    required
                    class="w-full rounded-lg bg-zinc-800/50 border-zinc-700 text-white px-4 py-2.5 focus:ring-2 focus:ring-gold focus:border-transparent transition-all duration-200"
                    placeholder="10000"
                  />
                </div>

                <div>
                  <label
                    for="monthly_holding_cost"
                    class="block text-sm font-medium text-zinc-400 mb-2"
                  >
                    Monthly Holding Cost <span class="text-accent-red">*</span>
                  </label>
                  <input
                    v-model.number="property.monthly_holding_cost"
                    type="number"
                    step="0.01"
                    min="0"
                    id="monthly_holding_cost"
                    required
                    class="w-full rounded-lg bg-zinc-800/50 border-zinc-700 text-white px-4 py-2.5 focus:ring-2 focus:ring-gold focus:border-transparent transition-all duration-200"
                    placeholder="1500"
                  />
                </div>

                <div>
                  <label
                    for="interest_rate"
                    class="block text-sm font-medium text-zinc-400 mb-2"
                  >
                    Interest Rate (%) <span class="text-accent-red">*</span>
                  </label>
                  <input
                    v-model.number="property.interest_rate"
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    id="interest_rate"
                    required
                    class="w-full rounded-lg bg-zinc-800/50 border-zinc-700 text-white px-4 py-2.5 focus:ring-2 focus:ring-gold focus:border-transparent transition-all duration-200"
                    placeholder="5.5"
                  />
                </div>

                <div>
                  <label
                    for="assignment_fee"
                    class="block text-sm font-medium text-zinc-400 mb-2"
                  >
                    Assignment Fee
                  </label>
                  <input
                    v-model.number="property.assignment_fee"
                    type="number"
                    step="0.01"
                    min="0"
                    id="assignment_fee"
                    class="w-full rounded-lg bg-zinc-800/50 border-zinc-700 text-white px-4 py-2.5 focus:ring-2 focus:ring-gold focus:border-transparent transition-all duration-200"
                    placeholder="5000"
                  />
                </div>

                <div>
                  <label
                    for="escrow"
                    class="block text-sm font-medium text-zinc-400 mb-2"
                  >
                    Escrow
                  </label>
                  <input
                    v-model.number="property.escrow"
                    type="number"
                    step="0.01"
                    min="0"
                    id="escrow"
                    class="w-full rounded-lg bg-zinc-800/50 border-zinc-700 text-white px-4 py-2.5 focus:ring-2 focus:ring-gold focus:border-transparent transition-all duration-200"
                    placeholder="2000"
                  />
                </div>

                <div>
                  <label
                    for="deal_holder"
                    class="block text-sm font-medium text-zinc-400 mb-2"
                  >
                    Deal Holder <span class="text-accent-red">*</span>
                  </label>
                  <input
                    v-model="property.deal_holder"
                    type="text"
                    id="deal_holder"
                    required
                    class="w-full rounded-lg bg-zinc-800/50 border-zinc-700 text-white px-4 py-2.5 focus:ring-2 focus:ring-gold focus:border-transparent transition-all duration-200"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label
                    for="deal_holder_phone"
                    class="block text-sm font-medium text-zinc-400 mb-2"
                  >
                    Deal Holder Phone
                  </label>
                  <input
                    v-model="property.deal_holder_phone"
                    type="tel"
                    id="deal_holder_phone"
                    class="w-full rounded-lg bg-zinc-800/50 border-zinc-700 text-white px-4 py-2.5 focus:ring-2 focus:ring-gold focus:border-transparent transition-all duration-200"
                    placeholder="(123) 456-7890"
                  />
                </div>

                <div>
                  <label
                    for="deal_holder_email"
                    class="block text-sm font-medium text-zinc-400 mb-2"
                  >
                    Deal Holder Email
                  </label>
                  <input
                    v-model="property.deal_holder_email"
                    type="email"
                    id="deal_holder_email"
                    class="w-full rounded-lg bg-zinc-800/50 border-zinc-700 text-white px-4 py-2.5 focus:ring-2 focus:ring-gold focus:border-transparent transition-all duration-200"
                    placeholder="email@example.com"
                  />
                </div>

                <div class="sm:col-span-2 lg:col-span-3">
                  <label
                    for="transaction_document_url"
                    class="block text-sm font-medium text-zinc-400 mb-2"
                  >
                    Transaction Document URL
                  </label>
                  <input
                    v-model="property.transaction_document_url"
                    type="url"
                    id="transaction_document_url"
                    class="w-full rounded-lg bg-zinc-800/50 border-zinc-700 text-white px-4 py-2.5 focus:ring-2 focus:ring-gold focus:border-transparent transition-all duration-200"
                    placeholder="https://docs.google.com/..."
                  />
                </div>

                <div class="sm:col-span-2 lg:col-span-3">
                  <label
                    for="docs_url"
                    class="block text-sm font-medium text-zinc-400 mb-2"
                  >
                    Docs URL <span class="text-accent-red">*</span>
                  </label>
                  <input
                    v-model="property.docs_url"
                    type="url"
                    id="docs_url"
                    required
                    class="w-full rounded-lg bg-zinc-800/50 border-zinc-700 text-white px-4 py-2.5 focus:ring-2 focus:ring-gold focus:border-transparent transition-all duration-200"
                    placeholder="https://docs.google.com/..."
                  />
                </div>

                <div class="sm:col-span-2 lg:col-span-3">
                  <label
                    for="price_breakdown"
                    class="block text-sm font-medium text-zinc-400 mb-2"
                  >
                    Price Breakdown Notes <span class="text-accent-red">*</span>
                  </label>
                  <textarea
                    v-model="property.price_breakdown"
                    id="price_breakdown"
                    rows="3"
                    required
                    class="w-full rounded-lg bg-zinc-800/50 border-zinc-700 text-white px-4 py-2.5 focus:ring-2 focus:ring-gold focus:border-transparent transition-all duration-200 resize-none"
                    placeholder="Breakdown of pricing details..."
                  ></textarea>
                </div>

                <div class="sm:col-span-2 lg:col-span-3">
                  <label
                    for="additional_benefits"
                    class="block text-sm font-medium text-zinc-400 mb-2"
                  >
                    Additional Benefits
                  </label>
                  <textarea
                    v-model="property.additional_benefits"
                    id="additional_benefits"
                    rows="3"
                    class="w-full rounded-lg bg-zinc-800/50 border-zinc-700 text-white px-4 py-2.5 focus:ring-2 focus:ring-gold focus:border-transparent transition-all duration-200 resize-none"
                    placeholder="Additional benefits and notes..."
                  ></textarea>
                </div>

                <div class="flex items-center">
                  <label
                    class="flex items-center space-x-3 cursor-pointer group"
                  >
                    <div class="relative flex items-center">
                      <input
                        v-model="property.in_house_deal"
                        type="checkbox"
                        id="in_house_deal"
                        class="sr-only peer"
                      />
                      <div
                        class="w-11 h-6 bg-zinc-800 rounded-full peer peer-checked:bg-gold transition-colors duration-200"
                      ></div>
                      <div
                        class="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 peer-checked:translate-x-5"
                      ></div>
                    </div>
                    <span
                      class="text-sm font-medium text-white group-hover:text-gold transition-colors duration-200"
                    >
                      In House Deal
                    </span>
                  </label>
                </div>

                <div class="flex items-center">
                  <label
                    class="flex items-center space-x-3 cursor-pointer group"
                  >
                    <div class="relative flex items-center">
                      <input
                        v-model="property.rental_restriction"
                        type="checkbox"
                        id="rental_restriction"
                        class="sr-only peer"
                      />
                      <div
                        class="w-11 h-6 bg-zinc-800 rounded-full peer peer-checked:bg-accent-red transition-colors duration-200"
                      ></div>
                      <div
                        class="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 peer-checked:translate-x-5"
                      ></div>
                    </div>
                    <span
                      class="text-sm font-medium text-white group-hover:text-accent-red transition-colors duration-200"
                    >
                      Rental Restriction
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </details>
        </div>

        <!-- Form Actions -->
        <div
          class="bg-zinc-900/50 backdrop-blur-sm rounded-xl border border-zinc-800 p-4 sm:p-6 shadow-xl"
        >
          <div class="flex flex-col sm:flex-row gap-3 sm:justify-end">
            <NuxtLink :to="props.redirect" class="w-full sm:w-auto">
              <button
                type="button"
                class="w-full sm:w-auto rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 px-6 py-2.5 text-sm font-medium text-white transition-all duration-200"
              >
                Cancel
              </button>
            </NuxtLink>
            <button
              :disabled="
                data.form.loading ||
                data.loading ||
                (!showForm && !manualInput && !props.property)
              "
              type="submit"
              class="w-full sm:w-auto rounded-lg bg-gold hover:bg-gold-light px-6 py-2.5 text-sm font-medium text-black shadow-lg shadow-gold/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-gold"
            >
              <span
                v-if="data.form.loading"
                class="flex items-center justify-center"
              >
                <svg
                  class="animate-spin -ml-1 mr-3 h-5 w-5 text-black"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    class="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    stroke-width="4"
                  ></circle>
                  <path
                    class="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Saving...
              </span>
              <span v-else>Save Property</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>
<script setup>
import { ref, reactive, onMounted, watch, computed } from "vue";
import debounce from "lodash.debounce";
import { useRoute, useRouter, navigateTo } from "#app";
import { usePropertiesStore } from "~/store/DataStore.js";

const propertiesStore = usePropertiesStore();

const props = defineProps({
  property: {
    type: Object,
    default: null,
  },
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

const config = useRuntimeConfig();
const router = useRouter();
const route = useRoute();

const access_token = config.public.MAPBOX_API_TOKEN;
const zillowApiKey = config.public.ZILLOW_API_KEY;
const apiBaseUrl = config.public.apiBaseUrl;

console.log(apiBaseUrl);

const manualInput = ref(false);
const propertyNotFound = ref(false);
const fetchComplete = ref(false);

const data = reactive({
  loading: false,
  loadingMessage: "Fetching property data...",
  errors: {},
  form: {
    latitude: null,
    longitude: null,
    address: null,
    unit_number: null,
    is_appartment: false,
    type: null,
    loading: false,
  },
});

const defaultProperty = {
  address: "",
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
  nearby_hospitals: [],
  nearby_schools: [],
  nearby_homes: [],
  price_history: [],
  tax_history: [],
  contact_recipients: [
    {
      display_name: "Sahil Valecha",
      email: "deals@urcreativesolutions.com",
      phone: { prefix: "", areacode: "786", number: "969-9945" },
      image_url: "",
    },
  ],
  purchase_price: null,
  balance_to_close: null,
  monthly_holding_cost: null,
  interest_rate: null,
  transaction_document_url: "",
  docs_url: "",
  escrow: null,
  deal_holder: "",
  deal_holder_phone: "",
  deal_holder_email: "",
  assignment_fee: null,
  in_house_deal: false,
  rental_restriction: false,
  price_breakdown: "",
  additional_benefits: "",
  created_by: "user",
  re_api_id: null,
};

const property = ref({ ...JSON.parse(JSON.stringify(defaultProperty)) });

const showForm = computed(() => {
  if (props.property) return true;
  if (manualInput.value) return true;
  if (fetchComplete.value && !propertyNotFound.value && data.form.address)
    return true;
  return false;
});

onMounted(() => {
  if (props.property) {
    const propData = JSON.parse(JSON.stringify(props.property));
    property.value = {
      ...JSON.parse(JSON.stringify(defaultProperty)),
      ...propData,
    };

    const parseJsonField = (fieldName, defaultVal = []) => {
      if (typeof property.value[fieldName] === "string") {
        try {
          const parsed = JSON.parse(property.value[fieldName]);
          property.value[fieldName] = Array.isArray(parsed)
            ? parsed
            : defaultVal;
        } catch (error) {
          console.error(`Error parsing ${fieldName}:`, error);
          property.value[fieldName] = defaultVal;
        }
      } else if (
        !property.value[fieldName] ||
        (Array.isArray(defaultVal) && !Array.isArray(property.value[fieldName]))
      ) {
        property.value[fieldName] = defaultVal;
      }
    };

    parseJsonField("images", []);
    parseJsonField("nearby_homes", []);
    parseJsonField("nearby_schools", []);
    parseJsonField("price_history", []);
    parseJsonField("tax_history", []);

    property.value.contact_recipients = [
      { ...defaultProperty.contact_recipients[0] },
    ];

    if (!Array.isArray(property.value.images)) {
      property.value.images = [];
    }

    fetchComplete.value = true;
    propertyNotFound.value = false;
  } else {
    property.value = { ...JSON.parse(JSON.stringify(defaultProperty)) };
    fetchComplete.value = false;
    propertyNotFound.value = false;
  }

  property.value.created_by = props.created_by;
});

watch(manualInput, (newValue) => {
  fetchComplete.value = false;
  propertyNotFound.value = false;
  data.loading = false;
  if (newValue) {
    data.form.address = null;
    data.form.latitude = null;
    data.form.longitude = null;
    const creator = property.value.created_by;
    property.value = {
      ...JSON.parse(JSON.stringify(defaultProperty)),
      created_by: creator,
    };
  }
});

watch(
  () => data.form.address,
  (newAddress) => {
    if (!newAddress && !manualInput.value && !props.property) {
      fetchComplete.value = false;
      propertyNotFound.value = false;
      data.loading = false;
      const creator = property.value.created_by;
      property.value = {
        ...JSON.parse(JSON.stringify(defaultProperty)),
        created_by: creator,
      };
    }
  }
);

const prepareAndFetchAddress = () => {
  if (manualInput.value || !data.form.address) {
    data.loading = false;
    fetchComplete.value = false;
    return;
  }

  let fullAddress = data.form.address;
  if (data.form.is_appartment && data.form.unit_number && data.form.type) {
    fullAddress += `, ${data.form.type} ${data.form.unit_number}`;
  } else if (data.form.is_appartment && data.form.unit_number) {
    fullAddress += ` #${data.form.unit_number}`;
  }
  property.value.address = fullAddress;

  data.loading = true;
  fetchComplete.value = false;
  propertyNotFound.value = false;

  const creator = property.value.created_by;
  const currentAddress = property.value.address;
  property.value = {
    ...JSON.parse(JSON.stringify(defaultProperty)),
    created_by: creator,
    address: currentAddress,
  };
  property.value.description = "";

  debouncedFetchPropertyData(fullAddress);
};

const debouncedFetchPropertyData = debounce(async (addressToFetch) => {
  if (!addressToFetch) {
    data.loading = false;
    fetchComplete.value = true;
    propertyNotFound.value = true;
    return;
  }

  await fetchRealEstateApiId(addressToFetch);
  const apiUrl = `https://zillow-com1.p.rapidapi.com/property?address=${encodeURIComponent(
    addressToFetch
  )}`;
  await fetchPropertyData(apiUrl);
}, 800);

const fetchRealEstateApiId = async (address) => {
  try {
    data.loadingMessage = "Looking up property ID...";

    const addressParts = address.split(",");
    let searchAddress = address;

    if (addressParts.length >= 2) {
      searchAddress = `${addressParts[0].trim()}, ${addressParts[1].trim()}`;
    }

    console.log("Searching Real Estate API with:", searchAddress);

    const response = await $fetch("/api/real-estate-search", {
      method: "POST",
      body: {
        search: searchAddress,
        search_types: ["A"],
      },
    });

    console.log("Real Estate API Response:", response);

    if (response?.data && response.data.length > 0) {
      const exactMatch = response.data.find((item) => item.searchType === "A");

      if (exactMatch && exactMatch.id) {
        property.value.re_api_id = exactMatch.id;
        console.log("Found Real Estate API ID:", exactMatch.id);
      } else if (response.data[0].id) {
        property.value.re_api_id = response.data[0].id;
        console.log("Using first result ID:", response.data[0].id);
      } else {
        console.log("No ID found in Real Estate API results");
        property.value.re_api_id = null;
      }
    } else {
      console.log("No results from Real Estate API");
      property.value.re_api_id = null;
    }
  } catch (error) {
    console.error("Error fetching Real Estate API ID:", error);
    property.value.re_api_id = null;
  }
};

watch(() => data.form.address, prepareAndFetchAddress);
watch(() => data.form.unit_number, prepareAndFetchAddress);
watch(() => data.form.type, prepareAndFetchAddress);
watch(() => data.form.is_appartment, prepareAndFetchAddress);

watch(
  () => property.value.balance_to_close,
  (newBalance) => {
    if (newBalance !== null && newBalance !== undefined) {
      property.value.price = newBalance;
    }
  }
);

const fetchPropertyData = async (url) => {
  try {
    data.loadingMessage = "Fetching property details...";

    const responseData = await $fetch(url, {
      headers: {
        "X-RapidAPI-Key": zillowApiKey,
        "X-RapidAPI-Host": "zillow-com1.p.rapidapi.com",
      },
    });

    if (responseData && responseData.zpid) {
      propertyNotFound.value = false;
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
      property.value.price_per_square_foot =
        responseData.resoFacts?.pricePerSquareFoot ?? null;
      property.value.monthly_hoa_fee = responseData.monthlyHoaFee ?? null;
      property.value.nearby_schools = responseData.schools ?? [];
      property.value.nearby_homes = responseData.nearbyHomes ?? [];
      property.value.price_history = responseData.priceHistory ?? [];
      property.value.tax_history = responseData.taxHistory ?? [];

      await fetchPropertyImages(responseData.zpid);
    } else {
      console.log("No property data found from Zillow API.");
      propertyNotFound.value = true;
      data.loading = false;
      fetchComplete.value = true;
    }
  } catch (error) {
    console.error("Error fetching property data:", error);
    propertyNotFound.value = true;
    data.loading = false;
    fetchComplete.value = true;
  }
};

const fetchPropertyImages = async (zpid) => {
  const apiUrl = `https://zillow-com1.p.rapidapi.com/images?zpid=${zpid}`;
  try {
    data.loadingMessage = "Loading property images...";

    const response = await $fetch(apiUrl, {
      headers: {
        "X-RapidAPI-Key": zillowApiKey,
        "X-RapidAPI-Host": "zillow-com1.p.rapidapi.com",
      },
    });
    if (response && Array.isArray(response.images) && response.images.length) {
      property.value.images = response.images.slice(0, 12);
    } else {
      console.log("No images found for zpid:", zpid);
      property.value.images = [];
    }
  } catch (error) {
    console.error("Error fetching images:", error);
    property.value.images = [];
  } finally {
    data.loading = false;
    fetchComplete.value = true;
  }
};

const handleRetrieve = async (event) => {
  if (event.detail.features && event.detail.features.length > 0) {
    const feature = event.detail.features[0];
    data.form.latitude = feature.properties.coordinates?.latitude;
    data.form.longitude = feature.properties.coordinates?.longitude;
    data.form.address = feature.properties.address_line1
      ? `${feature.properties.address_line1}, ${feature.properties.place}, ${feature.properties.region_code} ${feature.properties.postcode}`
      : feature.properties.full_address;
  } else {
    console.warn("No location selected from the dropdown.");
  }
};

const addImage = () => {
  if (!Array.isArray(property.value.images)) {
    property.value.images = [];
  }
  property.value.images.push("");
};

const removeImage = (index) => {
  if (Array.isArray(property.value.images)) {
    property.value.images.splice(index, 1);
  }
};
const handleSubmit = async () => {
  data.form.loading = true;
  data.errors = {};

  // Create a clean copy of the property
  let propertyToSubmit = JSON.parse(JSON.stringify(property.value));

  // Convert arrays and objects to JSON strings
  const stringifyField = (fieldName) => {
    if (
      Array.isArray(propertyToSubmit[fieldName]) ||
      (typeof propertyToSubmit[fieldName] === "object" &&
        propertyToSubmit[fieldName] !== null)
    ) {
      propertyToSubmit[fieldName] = JSON.stringify(propertyToSubmit[fieldName]);
    } else if (
      propertyToSubmit[fieldName] === null ||
      propertyToSubmit[fieldName] === undefined
    ) {
      propertyToSubmit[fieldName] = "[]";
    }
  };

  stringifyField("images");
  stringifyField("nearby_homes");
  stringifyField("nearby_schools");
  stringifyField("price_history");
  stringifyField("tax_history");
  stringifyField("contact_recipients");

  // Set created_by from props
  propertyToSubmit.created_by = props.created_by;

  console.log("created by:", props.created_by);

  // Clean up empty strings to null for numeric fields
  const numericFields = [
    "price",
    "bedrooms",
    "bathrooms",
    "rent_zestimate",
    "zestimate",
    "year_built",
    "lot_size",
    "price_per_square_foot",
    "living_area",
    "purchase_price",
    "balance_to_close",
    "monthly_holding_cost",
    "interest_rate",
    "monthly_hoa_fee",
    "escrow",
    "assignment_fee",
  ];

  numericFields.forEach((field) => {
    if (
      propertyToSubmit[field] === "" ||
      propertyToSubmit[field] === undefined
    ) {
      propertyToSubmit[field] = null;
    }
  });

  // Clean up empty strings to null for string fields that can be null
  const nullableStringFields = [
    "description",
    "property_type",
    "zoning",
    "deal_holder",
    "deal_holder_phone",
    "deal_holder_email",
    "price_breakdown",
    "additional_benefits",
    "re_api_id",
  ];

  nullableStringFields.forEach((field) => {
    if (propertyToSubmit[field] === "") {
      propertyToSubmit[field] = null;
    }
  });

  try {
    console.log("Submitting property:", propertyToSubmit);

    const response = await propertiesStore.store({
      property: propertyToSubmit,
    });

    console.log("API response:", response);

    // Always try to write to Google Sheets
    console.log("Writing property to Google Sheets, ID:", response.ID);
    try {
      // Create a copy of the submitted property data with the ID
      const propertyForSheets = {
        ...propertyToSubmit,
        ID: response.ID,
        CreatedAt: response.CreatedAt,
        UpdatedAt: response.UpdatedAt,
        DeletedAt: response.DeletedAt,
      };

      await propertiesStore.writeToSheet(propertyForSheets);
      console.log("Successfully wrote to Google Sheets");
    } catch (sheetError) {
      console.error("Failed to write to Google Sheets:", sheetError);
      // Don't block the user flow if sheets write fails
    }

    await navigateTo(props.redirect);
  } catch (error) {
    console.error("Error saving property:", error);
    data.errors = {
      submit: `Failed to save property: ${
        error.message || "Unknown error"
      }. Please try again.`,
    };
  } finally {
    data.form.loading = false;
  }
};
</script>

<style scoped>
/* Custom scrollbar */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #18181b;
}

::-webkit-scrollbar-thumb {
  background: #3f3f46;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #52525b;
}

/* Mapbox styling */
.mapboxgl-ctrl-geocoder {
  box-shadow: none !important;
  border: 1px solid #3f3f46;
  border-radius: 0.5rem;
  background: rgba(39, 39, 42, 0.5) !important;
}

.mapboxgl-ctrl-geocoder--input {
  height: calc(1.5em + 0.75rem + 2px);
  padding: 0.625rem 1rem !important;
  background-color: rgba(39, 39, 42, 0.5) !important;
  color: white !important;
  border: none !important;
  border-radius: 0.5rem;
}

.mapboxgl-ctrl-geocoder--input:focus {
  outline: 2px solid transparent;
  outline-offset: 2px;
  box-shadow: 0 0 0 2px #18181b, 0 0 0 4px #d4af37;
}

.mapboxgl-ctrl-geocoder--suggestion-list {
  background-color: #18181b !important;
  border: 1px solid #3f3f46 !important;
  border-radius: 0.5rem;
  overflow: hidden;
  margin-top: 0.25rem;
}

.mapboxgl-ctrl-geocoder--suggestion {
  color: #d4d4d8 !important;
  padding: 0.75rem 1rem !important;
  cursor: pointer;
  border-bottom: 1px solid #27272a;
}

.mapboxgl-ctrl-geocoder--suggestion:last-child {
  border-bottom: none;
}

.mapboxgl-ctrl-geocoder--suggestion:hover,
.mapboxgl-ctrl-geocoder--suggestion.active {
  background-color: #27272a !important;
  color: white !important;
}

.mapboxgl-ctrl-geocoder--icon-search {
  fill: #71717a;
}

.mapboxgl-ctrl-geocoder--icon-loading {
  fill: #d4af37 !important;
}

.mapboxgl-ctrl-geocoder--button {
  background-color: transparent !important;
}

/* Details/Summary styling */
details > summary {
  list-style: none;
}

details > summary::-webkit-details-marker {
  display: none;
}

/* Read-only input styling */
input:read-only {
  background-color: rgba(39, 39, 42, 0.5);
  cursor: not-allowed;
  opacity: 0.7;
}

/* Select dropdown styling */
select option {
  color: #09090b;
  background-color: white;
}

/* Custom toggle switch animations */
.peer:checked ~ div:last-child {
  transform: translateX(1.25rem);
}

/* Focus states for better accessibility */
input:focus-visible,
textarea:focus-visible,
select:focus-visible {
  outline: 2px solid #d4af37;
  outline-offset: 2px;
}

/* Mobile-specific improvements */
@media (max-width: 640px) {
  .mapboxgl-ctrl-geocoder {
    width: 100% !important;
    max-width: 100% !important;
  }

  .mapboxgl-ctrl-geocoder--input {
    font-size: 16px !important; /* Prevents zoom on iOS */
  }
}

/* Smooth transitions for all interactive elements */
button,
input,
textarea,
select,
label {
  transition: all 0.2s ease-in-out;
}

/* Loading spinner animation */
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

/* Backdrop blur support */
@supports (backdrop-filter: blur(12px)) or (-webkit-backdrop-filter: blur(12px)) {
  .backdrop-blur-sm {
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
  }
}

/* Better focus indicators for keyboard navigation */
*:focus-visible {
  outline: 2px solid #d4af37;
  outline-offset: 2px;
}

/* Disabled state styling */
button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}

/* Error message styling */
.error-message {
  color: #ef4444;
  font-size: 0.875rem;
  margin-top: 0.5rem;
}

/* Success message styling */
.success-message {
  color: #10b981;
  font-size: 0.875rem;
  margin-top: 0.5rem;
}

/* Card hover effects */
.bg-zinc-900\/50:hover {
  background-color: rgba(24, 24, 27, 0.6);
}

/* Smooth scroll behavior */
html {
  scroll-behavior: smooth;
}

/* Print styles */
@media print {
  .no-print {
    display: none !important;
  }
}
</style>
