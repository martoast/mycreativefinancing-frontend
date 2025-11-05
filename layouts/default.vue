<template>
  <div>
    <!-- Navbar -->
    <nav class="bg-black shadow-md border-b border-zinc-900">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <!-- Logo or site name -->
          <div class="flex items-center">
            <NuxtLink to="/" class="flex items-center">
              <img src="/logo.png" alt="Logo" class="h-8 w-auto" />
            </NuxtLink>
          </div>

          <!-- Auth buttons (when not logged in) -->
          <div v-if="!authState.isAuthenticated" class="flex items-center space-x-4">
            <NuxtLink to="/login">
              <button class="px-4 py-2 text-sm font-medium text-white hover:text-gold transition-colors">
                Log in
              </button>
            </NuxtLink>
            <NuxtLink to="/register">
              <button class="px-4 py-2 text-sm font-medium text-black bg-gold rounded-md hover:bg-gold-light transition-colors">
                Register
              </button>
            </NuxtLink>
          </div>

          <!-- User menu (when logged in) -->
          <div v-else class="relative z-10">
            <Menu as="div" class="relative ml-3">
              <div>
                <MenuButton
                  class="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2 focus:ring-offset-black"
                >
                  <span class="sr-only">Open user menu</span>
                  <div class="flex items-center">
                    <span
                      v-if="authState.isAdmin"
                      class="text-gold font-medium mr-2"
                      >Admin</span
                    >
                    <span
                      v-else-if="authState.isEmployee"
                      class="text-accent-blue font-medium mr-2"
                      >Employee</span
                    >
                    <span v-else class="text-zinc-300 mr-2">{{
                      userEmail
                    }}</span>
                    <div
                      class="w-8 h-8 rounded-full bg-gold/10 text-gold border border-gold/30 flex items-center justify-center"
                    >
                      <UserIcon class="h-5 w-5" />
                    </div>
                  </div>
                </MenuButton>
              </div>
              <transition
                enter-active-class="transition ease-out duration-100"
                enter-from-class="transform opacity-0 scale-95"
                enter-to-class="transform opacity-100 scale-100"
                leave-active-class="transition ease-in duration-75"
                leave-from-class="transform opacity-100 scale-100"
                leave-to-class="transform opacity-0 scale-95"
              >
                <MenuItems
                  class="absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-zinc-900 border border-zinc-800 py-1 shadow-lg ring-1 ring-black/5 focus:outline-none"
                >
                  <!-- Add Admin Panel link -->
                  <MenuItem v-if="authState.isAdmin" v-slot="{ active }">
                    <NuxtLink
                      to="/admin/"
                      :class="[
                        active ? 'bg-zinc-800' : '',
                        'flex w-full items-center px-4 py-2 text-sm text-white',
                      ]"
                    >
                      <HomeIcon class="h-5 w-5 mr-2 text-zinc-400" />
                      Admin Panel
                    </NuxtLink>
                  </MenuItem>
                  <MenuItem v-if="authState.isEmployee" v-slot="{ active }">
                    <NuxtLink
                      to="/employee/"
                      :class="[
                        active ? 'bg-zinc-800' : '',
                        'flex w-full items-center px-4 py-2 text-sm text-white',
                      ]"
                    >
                      <HomeIcon class="h-5 w-5 mr-2 text-zinc-400" />
                      Employee Panel
                    </NuxtLink>
                  </MenuItem>
                  <MenuItem v-slot="{ active }">
                    <button
                      @click="logout"
                      :class="[
                        active ? 'bg-zinc-800' : '',
                        'flex w-full items-center px-4 py-2 text-sm text-white',
                      ]"
                    >
                      <ArrowRightOnRectangleIcon
                        class="h-5 w-5 mr-2 text-zinc-400"
                      />
                      Sign out
                    </button>
                  </MenuItem>
                </MenuItems>
              </transition>
            </Menu>
          </div>
        </div>
      </div>
    </nav>

    <!-- Page content -->
    <main>
      <slot />
    </main>
  </div>
</template>

<script setup>
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/vue";
import {
  UserIcon,
  ArrowRightOnRectangleIcon,
  HomeIcon,
} from "@heroicons/vue/24/outline";

const { $auth } = useNuxtApp();
const authState = $auth.getState();

// Get user email
const userEmail = computed(() => {
  return authState.value.user?.email?.split("@")[0] || "User";
});

// Logout function
async function logout() {
  await $auth.logout();
}
</script>