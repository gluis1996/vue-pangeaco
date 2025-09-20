<!-- src/pages/intermodal-base-interna/components/DynamicStateInput.vue -->
 <!-- Selector de modo con VSwitch donde cambiara el tipo de input por fecha o estado -->
<template>
  <VRow dense>
    <!-- Selector de modo con VSwitch -->
    <VCol cols="12" md="4" class="d-flex align-center">
      <VSwitch
        v-model="isDateMode"
        :label="label"
        true-value="fecha"
        false-value="estado"
        inset
        hide-details
      />
    </VCol>

    <!-- Campo dinámico: fecha o estado -->
    <VCol cols="12" md="8">
      <!-- Si es fecha -->
      <AppDateTimePicker
        ref="datePickerRef"
        v-if="isDateMode === 'fecha'"
        :model-value="props.modelValue"
        :label="label"
        density="compact"
        @close="onDatePickerClose"
        @update:model-value="v => emit('update:modelValue', v)"
      />

      <!-- Si es estado -->
      <VSelect
        v-else
        :model-value="props.modelValue"
        :items="props.items"
        :label="label"
        density="compact"
        clearable
        @update:model-value="v => emit('update:modelValue', v)"
      />
    </VCol>
  </VRow>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  modelValue: { type: [String, Date], default: null },
  label: { type: String, required: true },
  items: { type: Array, default: () => [] },
})

const emit = defineEmits(['update:modelValue'])

const isDateLike = (val) => typeof val === 'string' && /^\d{4}-\d{2}-\d{2}/.test(val)
const datePickerRef = ref(null)
const isDateMode = ref(isDateLike(props.modelValue) ? 'fecha' : 'estado')

watch(isDateMode, (newMode, oldMode) => {
  // Si el modo cambia, reseteamos el valor para evitar conflictos de tipo.
  if (newMode !== oldMode) {
    emit('update:modelValue', null)
  }
})

function onDatePickerClose() {
  // Forzamos que el foco vuelva al campo de texto del calendario
  // cuando el menú se cierra. Esto evita que el foco "salte" a otro input.
  const inputElement = datePickerRef.value?.$el.querySelector('input')
  if (inputElement) {
    inputElement.focus()
  }
}

</script>