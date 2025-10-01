<template>
  <VCard title="Proyectos sin Avance (Últimas 24h)">
    <VCardText>
      <VList v-if="proyectos.length > 0" lines="two">
        <VListItem
          v-for="proyecto in proyectos"
          :key="proyecto.id"
          :title="proyecto.nodo"
          :subtitle="`Última actualización: ${proyecto.ultima_actualizacion}`"
        >
          <template #prepend>
            <VAvatar color="error" icon="mdi-clock-alert-outline" variant="tonal" />
          </template>
        </VListItem>
      </VList>
      <p v-else class="text-center text-medium-emphasis">
        ¡Buen trabajo! Todos los proyectos han tenido actividad reciente.
      </p>
    </VCardText>
  </VCard>
</template>

<script setup>
defineProps({
  proyectos: {
    type: Array,
    default: () => [],
  },
})
</script>