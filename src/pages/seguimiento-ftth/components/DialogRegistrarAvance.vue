<template>
  <VDialog
    :model-value="props.isDialogVisible"
    max-width="900" :retain-focus="false"
    @update:model-value="dialogValueUpdate"
  >
    <VCard title="Registrar Avance">
      <!-- Loader Overlay -->
      <VOverlay
        v-model="isLoading"
        class="align-center justify-center"
        persistent
      >
        <VProgressCircular indeterminate color="primary" size="64" />
      </VOverlay>

      <VCardText>
        <!-- Iteramos sobre cada trabajo para crear una fila de formulario -->
        <VForm v-for="(trabajo, index) in formState.trabajos" :key="trabajo.id" :ref="el => formRefs[index] = el" v-slot="{ isValid }" class="mb-6">
            <VRow align="center">
                <!-- Nombre del Trabajo -->
                <VCol cols="12">
                <h6 class="text-h6">{{ trabajo.nombre }}</h6>
                </VCol>

                <!-- Campos Principales -->
                <VCol cols="12" sm="3">
                <VTextField
                    :model-value="trabajo.total"
                    label="Total a Instalar"
                    :suffix="trabajo.unidad"
                    density="compact"
                    readonly
                />
                </VCol>
                <VCol cols="12" sm="3">
                <VTextField
                    v-model="trabajo.trabajados"
                    label="Trabajado"
                    type="number"
                    :suffix="trabajo.unidad"
                    density="compact"
                    :min="0" :rules="[
                        reglaValorCambiado(trabajo),
                        reglaNoMenor(trabajo),
                        reglaNoMayorQueTotal(trabajo)
                    ]"
                />
                </VCol>
                <VCol cols="12" sm="3">
                <div class="d-flex align-center justify-center" style="height: 100%;">
                    <VProgressCircular
                    :model-value="calcularAvance(trabajo.total, trabajo.trabajados)"
                    :rotate="360"
                    :size="50"
                    :width="8"
                    color="primary"
                    >
                    {{ calcularAvance(trabajo.total, trabajo.trabajados).toFixed(0) }}%
                    </VProgressCircular>
                </div>
                </VCol>
                <VCol cols="12" sm="3" class="text-center">
                    <VBtn color="primary" @click="actualizarTrabajo(trabajo, index)" :disabled="!isValid.value">
                        Actualizar
                    </VBtn>
                </VCol>
            </VRow>

            <!-- Campos Adicionales para INSTALACION PASIVOS -->
            <VRow v-if="trabajo.nombre === 'INSTALACION PASIVOS' && formState.mufas">
                <VCol cols="12" sm="4">
                <VTextField
                    v-model="formState.mufas.mufas_instaladas"
                    label="Mufas Instaladas"
                    type="number"
                    density="compact"
                    :min="0"
                />
                </VCol>
                <VCol cols="12" sm="4">
                <VTextField
                    v-model="formState.mufas.mufas_empalmados"
                    label="Mufas Empalmadas"
                    type="number"
                    density="compact"
                    :min="0"
                />
                </VCol>
                <VCol cols="12" sm="4">
                <VTextField
                    v-model="formState.mufas.rotulado"
                    label="Rotulado"
                    type="number"
                    density="compact"
                    :min="0"
                />
                </VCol>
            </VRow>
        </VForm>
      </VCardText>

      <VCardActions>
        <VSpacer />
        <VBtn
          color="secondary"
          @click="dialogValueUpdate(false)"
        >
          Cerrar
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue'
import { $api } from '@/utils/api'

const props = defineProps({
  isDialogVisible: { type: Boolean, required: true },
  detalleData: { type: Object, default: null }
})

const emit = defineEmits(['update:isDialogVisible', 'datosActualizados'])

// Estado local para el formulario
const formState = ref({
  trabajos: [],
  mufas: null,
});
const isLoading = ref(false);
const formRefs = ref([]); // Array para almacenar las referencias de los formularios

// Observador que se activa cuando llegan nuevos datos
watch(() => props.detalleData, (newData) => {
  if (!newData) {
    // Si no hay datos, reseteamos el estado del formulario
    formState.value = { trabajos: [], mufas: null };
    formRefs.value = [];
    return;
  }

  // Hacemos una copia profunda para no modificar la prop original
  const dataCopy = JSON.parse(JSON.stringify(newData));

  // Preparamos los trabajos
  if (dataCopy.trabajos && Array.isArray(dataCopy.trabajos)) {
    dataCopy.trabajos.forEach(t => {
      // Guardamos el valor original para la validación
      t.trabajados_original = t.trabajados === null ? 0 : Number(t.trabajados);
      t.trabajados = t.trabajados === null ? '' : Number(t.trabajados);
    });
  }

  // Preparamos las mufas, asegurando que sea un objeto o null
  if (dataCopy.mufas && Array.isArray(dataCopy.mufas) && dataCopy.mufas.length > 0) {
    const mufasData = dataCopy.mufas[0];
    mufasData.mufas_instaladas = mufasData.mufas_instaladas === null ? '' : Number(mufasData.mufas_instaladas);
    mufasData.mufas_empalmados = mufasData.mufas_empalmados === null ? '' : Number(mufasData.mufas_empalmados);
    mufasData.rotulado = mufasData.rotulado === null ? '' : Number(mufasData.rotulado);
    dataCopy.mufas = mufasData; // Reemplazamos el array por el objeto
  }

  formState.value = dataCopy;
}, { immediate: true, deep: true });

const dialogValueUpdate = val => {
  emit('update:isDialogVisible', val);
  // Si el diálogo se está cerrando (val es false), emitimos el evento.
  if (!val) {
    emit('datosActualizados');
  }
}

const actualizarTrabajo = async (trabajo, index) => {
  console.log("Actualizando el trabajo:", trabajo);

  // Preparamos el payload para enviar al API
  const payload = {
    trabajo: trabajo,
  };

  // Si el trabajo es "INSTALACION PASIVOS", añadimos los datos de las mufas
  if (trabajo.nombre === 'INSTALACION PASIVOS' && formState.value.mufas) {
    payload.mufas = formState.value.mufas;
  }

  isLoading.value = true; // Activamos el loader
  try {
      if (trabajo.nombre === 'INSTALACION PASIVOS' ) {
          const response = await $api(`/internodal/actualizar-trabajo-mufas/${trabajo.id}`, {
              method: 'PUT',
              body: payload,
              onResponseError({response}){
                  console.log(response);
              }
          })
          console.log('impimeros en endpoint A', response);
          
      }else{
          const response = await $api(`/internodal/actualizar-trabajo-avance/${trabajo.id}`, {
              method: 'PUT',
              body: payload,
              onResponseError({response}){
                  console.log(response);
              }
          })
          console.log('impimeros en endpoint B', response);
      }

      // ✅ ¡Solución! Actualizamos el valor original para que coincida con el nuevo.
      trabajo.trabajados_original = Number(trabajo.trabajados) || 0;

      // ✅ ¡Paso Clave! Forzamos la re-validación del formulario específico.
      nextTick(() => {
        formRefs.value[index]?.validate();
      });

  } catch (error) {
      console.error("Error al actualizar el trabajo:", error);
      // Aquí podrías mostrar una notificación de error
  } finally {
      isLoading.value = false; // Desactivamos el loader, tanto si hubo éxito como si hubo error
    }
}

const calcularAvance = (total, trabajado) => {
  const numTotal = Number(total) || 0;
  const numTrabajado = Number(trabajado) || 0;
  if (numTotal === 0) return 0;
  return (numTrabajado / numTotal) * 100;
}

// --- Reglas de Validación ---
const reglaValorCambiado = (trabajo) => (valor) => {
  const valorActual = Number(valor) || 0;
  const valorOriginal = Number(trabajo.trabajados_original) || 0;

  return valorActual !== valorOriginal || 'El valor no ha cambiado.';
}

const reglaNoMenor = (trabajo) => (valor) => {
  const valorActual = Number(valor) || 0;
  const valorOriginal = Number(trabajo.trabajados_original) || 0;
  
  return valorActual >= valorOriginal || `El valor no puede ser menor que ${valorOriginal}.`;
}

const reglaNoMayorQueTotal = (trabajo) => (valor) => {
  const valorActual = Number(valor) || 0;
  const total = Number(trabajo.total) || 0;

  return valorActual <= total || `El valor no puede exceder el total de ${total}.`;
}
</script>