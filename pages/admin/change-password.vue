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

      <div class="max-w-md mx-auto">
        <h1 class="text-2xl font-semibold text-white mb-6">Change Password</h1>

        <form @submit.prevent="handleSubmit" class="space-y-6">
          <div v-if="successMessage" class="p-4 bg-green-900/50 border border-green-500 rounded-lg">
            <p class="text-green-400 text-sm">{{ successMessage }}</p>
          </div>

          <div v-if="errorMessage" class="p-4 bg-red-900/50 border border-red-500 rounded-lg">
            <p class="text-red-400 text-sm">{{ errorMessage }}</p>
          </div>

          <div>
            <label for="current-password" class="block text-sm font-medium text-gray-300 mb-2">
              Current Password
            </label>
            <input
              id="current-password"
              v-model="currentPassword"
              type="password"
              required
              class="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Enter current password"
            />
          </div>

          <div>
            <label for="new-password" class="block text-sm font-medium text-gray-300 mb-2">
              New Password
            </label>
            <input
              id="new-password"
              v-model="newPassword"
              type="password"
              required
              minlength="8"
              class="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Enter new password (min 8 characters)"
            />
          </div>

          <div>
            <label for="confirm-password" class="block text-sm font-medium text-gray-300 mb-2">
              Confirm New Password
            </label>
            <input
              id="confirm-password"
              v-model="confirmPassword"
              type="password"
              required
              minlength="8"
              class="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Confirm new password"
            />
          </div>

          <button
            type="submit"
            :disabled="loading"
            class="w-full px-4 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="loading">Updating...</span>
            <span v-else>Update Password</span>
          </button>
        </form>
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

const currentPassword = ref("");
const newPassword = ref("");
const confirmPassword = ref("");
const loading = ref(false);
const successMessage = ref("");
const errorMessage = ref("");

const handleSubmit = async () => {
  successMessage.value = "";
  errorMessage.value = "";

  if (newPassword.value !== confirmPassword.value) {
    errorMessage.value = "New passwords do not match";
    return;
  }

  if (newPassword.value.length < 8) {
    errorMessage.value = "New password must be at least 8 characters";
    return;
  }

  loading.value = true;

  try {
    const response = await $auth.fetch(
      `${config.public.apiBaseUrl}/api/admin/change-password`,
      {
        method: "POST",
        body: {
          current_password: currentPassword.value,
          new_password: newPassword.value,
        },
      }
    );

    successMessage.value = "Password updated successfully";
    currentPassword.value = "";
    newPassword.value = "";
    confirmPassword.value = "";
  } catch (error) {
    errorMessage.value = error.data?.error || error.message || "Failed to update password";
  } finally {
    loading.value = false;
  }
};
</script>
