<template>
  <div class="pa-6">
    <h2>403 – No autorizado</h2>
    <p>No tienes permisos para ver esta página.</p>
    <RouterLink :to="{ name: 'dashboard' }">Volver al inicio</RouterLink>
  </div>
</template>

<script setup>
definePage({ meta: { public: true } })
</script>
