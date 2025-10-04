<script setup>
import { useApi } from "@/composables/useApi";
import { ref, onMounted } from "vue";

const statistics = ref([]);
const loading = ref(false);

const fetchStatistics = async () => {
  try {
    loading.value = true;
    const { data } = await useApi("/internodal/reporte/resumen").json();

    // La API devuelve los datos directamente en el formato que necesitamos
    if (data.value && data.value.success && data.value.data) {
      statistics.value = data.value.data;
    }
  } catch (error) {
    console.error("Error al obtener estadísticas:", error);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchStatistics();
});
</script>

<template>
  <VCard>
    <VCardItem>
      <VCardTitle>Opex / Capex</VCardTitle>
      <VCardSubtitle class="d-flex align-center gap-x-2"> </VCardSubtitle>
      
    </VCardItem>

    <VCardText>
      <div
        v-if="loading"
        class="d-flex justify-center align-center"
        style="min-height: 100px"
      >
        <VProgressCircular indeterminate color="primary" size="50" />
      </div>
      <div
        v-else
        class="d-flex justify-space-between flex-column flex-sm-row gap-4 flex-wrap"
      >
        <div
          v-for="item in statistics"
          :key="item.title"
          class="d-flex align-center"
        >
          <VAvatar
            :color="item.color"
            rounded
            variant="tonal"
            size="40"
            class="me-3"
          >
            <VIcon size="24" :icon="item.icon" />
          </VAvatar>

          <div class="d-flex flex-column">
            <h5 class="text-h5">
              {{ item.stats }}
            </h5>
            <div class="text-body-1">
              {{ item.title }}
            </div>
          </div>
        </div>
      </div>
    </VCardText>
  </VCard>
</template>
