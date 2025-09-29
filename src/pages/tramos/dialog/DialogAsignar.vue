<template>
  <VDialog
    :model-value="props.open"
    max-width="600"
    persistent
    @update:model-value="val => emit('update:open', val)"
  >
    <VCard v-if="proyecto" title="Asignar Proyecto">
      <VCardText>
        <p class="mb-4">
          Se asignará el proyecto a la EECC:
        </p>

        <!-- Si la IP ya existe, la mostramos como solo lectura -->
        <VTextField
          v-if="proyecto.ip"
          :model-value="proyecto.ip"
          label="IP del Proyecto"
          readonly
          density="compact"
          variant="outlined"
        />

        <!-- Si la IP no existe, mostramos un campo para ingresarla -->
        <VForm v-else ref="formRef">
            <VTextField
                v-model="nuevaIp"
                label="IP del Proyecto (Requerido)"
                placeholder="P-XX-XXXXXXXX"
                :rules="[v => !!v || 'La IP es obligatoria']"
                density="compact"
                autofocus
            />
        </VForm>
      </VCardText>

      <VCardActions>
        <VSpacer />
        <VBtn
          color="secondary"
          variant="tonal"
          @click="onCancel"
        >
          Cancelar
        </VBtn>
        <VBtn
          color="primary"
          :disabled="!esValido"
          @click="onGuardar"
        >
          Guardar Asignación
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  open: { type: Boolean, default: false },
  proyecto: { type: Object, default: null },
})

const emit = defineEmits(['update:open', 'cancel', 'guardar'])

const nuevaIp = ref('')

// Reseteamos la nueva IP cada vez que se abre el diálogo
watch(() => props.open, (isOpen) => {
  if (isOpen) {
    nuevaIp.value = ''
  }
})

// El botón de guardar se habilita si la IP ya existe o si se ha escrito una nueva
const esValido = computed(() => {
  if (props.proyecto?.ip) {
    return true // Si ya tiene IP, es válido para guardar
  }
  return !!nuevaIp.value // Si no tiene, la nueva IP no debe estar vacía
})

function onGuardar() {
  emit('guardar', {
    id: props.proyecto.id,
    ip: props.proyecto.ip || nuevaIp.value, // Usamos la IP existente o la nueva
  })
}

function onCancel() {
  emit('cancel')
  emit('update:open', false)
}
</script>