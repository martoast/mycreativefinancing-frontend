<template>
    <div class="bg-black min-h-screen w-full">
      <div class="container mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div class="flex justify-center mb-8">
          <a href="https://urcreativeservices.com/">
            <img src="/logo.png" alt="Logo" class="h-16 w-auto" />
          </a>
        </div>
        <property-form created_by="admin" redirect="/admin/"></property-form>
      </div>
    </div>
  </template>
  
  <script setup>
  definePageMeta({
    middleware: 'admin'
  })
  </script>