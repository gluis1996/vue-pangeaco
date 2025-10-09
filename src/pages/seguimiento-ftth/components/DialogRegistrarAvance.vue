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
                    :min="0"
                    :readonly="Number(trabajo.trabajados_original) === Number(trabajo.total)"
                    :rules="[ 
                        reglaValorCambiado(trabajo),
                        reglaNoMenor(trabajo),
                        reglaNoMayorQueTotal(trabajo)
                    ]"
                />
                </VCol>
                <VCol cols="12" sm="3">
                    <div class="d-flex flex-column justify-center" style="height: 100%;">
                        <div class="d-flex justify-space-between mb-1">
                            <span class="text-caption">Avance</span>
                            <span class="text-caption font-weight-bold">{{ calcularAvance(trabajo).toFixed(2) }}%</span>
                        </div>
                        <VProgressLinear
                            :model-value="calcularAvance(trabajo)"
                            color="primary"
                            height="8"
                            rounded
                        />
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
                    :rules="[
                        reglaValorCambiado(trabajo),
                        reglaMufaNoMayorQueTotal(trabajo),
                        reglaMufaNoMenorQueOriginal('mufas_instaladas')
                    ]"
                />
                </VCol>
                <VCol cols="12" sm="4">
                <VTextField
                    v-model="formState.mufas.mufas_empalmados"
                    label="Mufas Empalmadas"
                    type="number"
                    density="compact"
                    :min="0"
                    :rules="[
                        reglaEmpalmadosNoMayorQueInstaladas,
                        reglaValorCambiado(trabajo),
                        reglaMufaNoMayorQueTotal(trabajo),
                        reglaMufaNoMenorQueOriginal('mufas_empalmados')
                    ]"
                />
                </VCol>
                <VCol cols="12" sm="4">
                <VTextField
                    v-model="formState.mufas.rotulado"
                    label="Rotulado"
                    type="number"
                    density="compact"
                    :min="0"
                    :rules="[
                        reglaRotuladoNoMayorQueInstaladas,
                        reglaValorCambiado(trabajo),
                        reglaMufaNoMayorQueTotal(trabajo),
                        reglaMufaNoMenorQueOriginal('rotulado')
                    ]"
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

const emit = defineEmits(['update:isDialogVisible', 'datosActualizados', 'trabajoActualizado'])

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

// Observador para forzar la validación cuando cambian las mufas
watch(() => formState.value.mufas, (newMufas, oldMufas) => {
  // Solo re-validamos si el diálogo está visible y hay datos de mufas
  if (props.isDialogVisible && newMufas) {
    // Buscamos el índice del formulario de "INSTALACION PASIVOS"
    const pasivosIndex = formState.value.trabajos.findIndex(t => t.nombre === 'INSTALACION PASIVOS');
    if (pasivosIndex !== -1) formRefs.value[pasivosIndex]?.validate();
  }
}, { deep: true });

const dialogValueUpdate = val => {
  emit('update:isDialogVisible', val);
  // Si el diálogo se está cerrando (val es false), emitimos el evento.
  if (!val) {
    emit('datosActualizados');
  }
}

const actualizarTrabajo = async (trabajo, index) => {
  
  // Preparamos el payload para enviar al API
  const payload = {
    trabajo: trabajo,
  };
   

  // Si el trabajo es "INSTALACION PASIVOS", añadimos los datos de las mufas
  if (trabajo.nombre === 'INSTALACION PASIVOS' && formState.value.mufas) {
    // Hacemos una copia y nos aseguramos de que los valores sean numéricos, con 0 por defecto.
    const mufasPayload = { ...formState.value.mufas };
    mufasPayload.mufas_instaladas = Number(mufasPayload.mufas_instaladas) || 0;
    mufasPayload.mufas_empalmados = Number(mufasPayload.mufas_empalmados) || 0;
    mufasPayload.rotulado = Number(mufasPayload.rotulado) || 0;
    
    // Usamos la copia saneada en el payload
    payload.mufas = mufasPayload;
  }

  isLoading.value = true; // Activamos el loader
  try {
      if (trabajo.nombre === 'INSTALACION PASIVOS' ) {
          const response = await $api(`/internodal/trabajos/actualizar-trabajo-mufas/${trabajo.id}`, {
              method: 'PUT',
              body: payload,
              onResponseError({response}){
                  
              }
          })
                     
          
      }else{
          const response = await $api(`/internodal/trabajos/actualizar-trabajo-avance/${trabajo.id}`, {
              method: 'PUT',
              body: payload,
              onResponseError({response}){
                  
              }
          })
           
          
      }

      // ✅ ¡Solución! Actualizamos el valor original para que coincida con el nuevo.
      trabajo.trabajados_original = Number(trabajo.trabajados) || 0;

      // ✅ ¡Paso Clave! Forzamos la re-validación del formulario específico.
      nextTick(() => {
        formRefs.value[index]?.validate();
      });

      // Emitimos el evento de éxito
      emit('trabajoActualizado', { message: `'${trabajo.nombre}' actualizado correctamente.`, color: 'secundary' });

  } catch (error) {
      console.error("Error al actualizar el trabajo:", error);
      emit('trabajoActualizado', { message: `Error al actualizar '${trabajo.nombre}'.`, color: 'error' });
  } finally {
      isLoading.value = false; // Desactivamos el loader, tanto si hubo éxito como si hubo error
    }
}

const calcularAvance = (trabajo) => {
  const objetivoTotal = Number(trabajo.total) || 0;

  // Si el objetivo es 0, el avance es 0 para evitar divisiones por cero.
  if (objetivoTotal === 0) return 0;

  // Lógica especial para "INSTALACION PASIVOS"
  if (trabajo.nombre === 'INSTALACION PASIVOS' && formState.value.mufas) {
    const porcentajes = [];

    // 1. Avance del trabajo principal
    porcentajes.push((Number(trabajo.trabajados) / objetivoTotal) * 100);

    // 2. Avances de las mufas
    const mufas = formState.value.mufas;
    porcentajes.push((Number(mufas.mufas_instaladas) / objetivoTotal) * 100);
    porcentajes.push((Number(mufas.mufas_empalmados) / objetivoTotal) * 100);
    porcentajes.push((Number(mufas.rotulado) / objetivoTotal) * 100);

    // 3. Calcular el promedio de todos los porcentajes
    const sumaPorcentajes = porcentajes.reduce((acc, pct) => acc + (pct || 0), 0);
    return sumaPorcentajes / porcentajes.length;
  }

  // Lógica normal para cualquier otro tipo de trabajo
  const numTrabajado = Number(trabajo.trabajados) || 0;
  return (numTrabajado / objetivoTotal) * 100;
}

// --- Reglas de Validación ---
const reglaValorCambiado = (trabajo) => (valor) => {
  const trabajoPrincipalCambiado = (Number(trabajo.trabajados) || 0) !== (Number(trabajo.trabajados_original) || 0);

  if (trabajo.nombre === 'INSTALACION PASIVOS' && formState.value.mufas) {
    const mufas = formState.value.mufas;
    const mufasOriginal = props.detalleData.mufas[0] || {};

    const instaladasCambiado = (Number(mufas.mufas_instaladas) || 0) !== (Number(mufasOriginal.mufas_instaladas) || 0);
    const empalmadasCambiado = (Number(mufas.mufas_empalmados) || 0) !== (Number(mufasOriginal.mufas_empalmados) || 0);
    const rotuladoCambiado = (Number(mufas.rotulado) || 0) !== (Number(mufasOriginal.rotulado) || 0);

    // Si alguno de los campos (principal o de mufas) ha cambiado, la regla es válida.
    if (trabajoPrincipalCambiado || instaladasCambiado || empalmadasCambiado || rotuladoCambiado) {
      return true;
    }
    return 'Ningún valor ha cambiado.';
  }

  return trabajoPrincipalCambiado || 'El valor no ha cambiado.';
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

const reglaEmpalmadosNoMayorQueInstaladas = (valor) => {
  if (!formState.value.mufas) return true;
  const instaladas = Number(formState.value.mufas.mufas_instaladas) || 0;
  const empalmadas = Number(valor) || 0;

  return empalmadas <= instaladas || 'No puede haber más empalmadas que instaladas.';
}

const reglaRotuladoNoMayorQueInstaladas = (valor) => {
  if (!formState.value.mufas) return true;
  const instaladas = Number(formState.value.mufas.mufas_instaladas) || 0;
  const rotuladas = Number(valor) || 0;

  return rotuladas <= instaladas || 'No puede haber más rotuladas que instaladas.';
}

const reglaMufaNoMayorQueTotal = (trabajo) => (valor) => {
  const valorActual = Number(valor) || 0;
  const total = Number(trabajo.total) || 0;
  return valorActual <= total || `No puede exceder el total de ${total}.`;
}

const reglaMufaNoMenorQueOriginal = (mufaFieldKey) => (valor) => {
  // Si no hay datos originales, la regla pasa.
  if (!props.detalleData?.mufas?.[0]) return true;

  const valorActual = Number(valor) || 0;
  const valorOriginal = Number(props.detalleData.mufas[0][mufaFieldKey]) || 0;

  return valorActual >= valorOriginal || `No puede ser menor que el valor original (${valorOriginal}).`;
}
</script>