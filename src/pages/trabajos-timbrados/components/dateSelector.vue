<template>
    <AppDateTimePicker
        v-model="valueProxy"
        :label="label"
        :placeholder="placeholder"
        mode="date"
        clearable
    />
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: { type: String, default: '' },
  label: { type: String, default: 'Fecha' },
  placeholder: { type: String, default: 'Selecciona fecha' },
})

const emit = defineEmits(['update:modelValue'])

const valueProxy = computed({
  get: () => props.modelValue,
  set: v => emit('update:modelValue', v),
})
</script>