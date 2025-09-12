<!-- src/pages/intermodal-base-interna/components/dialog.vue -->
<template>
  <!-- VDialog: diálogo de Vuetify. 
       v-model="openLocal" enlaza el estado abierto/cerrado a un computed 
       que a su vez refleja la prop 'open' y emite 'update:open' al padre. -->
  <VDialog v-model="openLocal" max-width="800">
    <!-- Contenedor principal del diálogo -->
    <VCard>
      <!-- Título del diálogo -->
      <VCardTitle class="text-h6">Nuevo Registro</VCardTitle>

      <!-- Cuerpo del diálogo -->
      <VCardText>
        <!-- VForm: agrupa campos y permite validación con validate() -->
        <VForm ref="formRef">
          <!-- Tabs: navegación por secciones (solo 1 habilitada por ahora) -->
          <VTabs v-model="tab" class="mb-2">
            <VTab value="planeamiento">Planeamiento</VTab>
            <VTab value="planta" disabled>Planta</VTab>
            <VTab value="plazos-estados" disabled>Plazos - Estados</VTab>
            <VTab value="medidas" disabled>Medidas</VTab>
          </VTabs>

          <!-- VWindow: renderiza el contenido de la pestaña activa -->
          <VWindow v-model="tab" :touch="false" class="disable-tab-transition">
            <!-- Item: contenido para la pestaña 'planeamiento' -->
            <VWindowItem value="planeamiento">
              <!-- Layout responsivo -->
              <VRow class="mt-2">
                <!-- Campo IP (requerido) -->
                <VCol cols="12" md="4">
                  <VTextField
                    v-model="form.ip"              
                    label="IP"                     
                    :rules="[req]"                 
                    density="compact"              
                  />
                </VCol>

                <!-- Campo EECC (requerido) -->
                <VCol cols="12" md="4">
                  <VTextField
                    v-model="form.eecc"
                    label="EECC"
                    :rules="[req]"
                    density="compact"
                  />
                </VCol>

                <!-- Campo Prioridad numérica (requerido) -->
                <VCol cols="12" md="4">
                  <VTextField
                    v-model="form.prioridad"
                    label="Prioridad"
                    type="number"                 
                    :rules="[req]"
                    density="compact"
                  />
                </VCol>

                <!-- Campo Nodo (requerido) -->
                <VCol cols="12" md="4">
                  <VTextField
                    v-model="form.nodo"
                    label="Nodo"
                    :rules="[req]"
                    density="compact"
                  />
                </VCol>

                <!-- Campo UIPS (requerido) -->
                <VCol cols="12" md="4">
                  <VTextField
                    v-model="form.uips"
                    label="UIPS"
                    :rules="[req]"
                    density="compact"
                  />
                </VCol>

                <!-- Select Región (requerido) -->
                <VCol cols="12" md="4">
                  <VSelect
                    v-model="form.region"
                    :items="options.regiones"    
                    label="Región"
                    :rules="[req]"
                    density="compact"
                  />
                </VCol>

                <!-- Select Departamento (requerido) -->
                <VCol cols="12" md="4">
                  <VSelect
                    v-model="form.dpto"
                    :items="options.departamentos"
                    label="Departamento"
                    :rules="[req]"
                    density="compact"
                  />
                </VCol>

                <!-- Select Nodo concentrador (requerido) -->
                <VCol cols="12" md="4">
                  <VSelect
                    v-model="form.nodo_concentrador"
                    :items="options.nodosConcentrador"
                    label="Nodo concentrador"
                    :rules="[req]"
                    density="compact"
                  />
                </VCol>
              </VRow>
            </VWindowItem>
          </VWindow>
        </VForm>
      </VCardText>

      <!-- Separador visual -->
      <VDivider />

      <!-- Acciones del diálogo -->
      <VCardText class="d-flex gap-4">
        <!-- Submit: deshabilitado si visualmente falta algo; 
             además, onSubmit valida formalmente con VForm.validate() -->
        <VBtn :disabled="!isComplete" @click="onSubmit">Submit</VBtn>

        <!-- Cancel: cierra el diálogo y avisa al padre -->
        <VBtn color="secondary" variant="tonal" @click="onCancel">Cancel</VBtn>
      </VCardText>
    </VCard>
  </VDialog>
</template>

<script setup>
// Importamos utilidades de Vue
import { reactive, ref, watch, computed } from 'vue'

/* =====================  PROPS & EMITS (sin defineModel)  ===================== */

// Declaramos props que llegan del padre.
// - 'open': controla si el diálogo está abierto (Boolean).
// - 'options': catálogos para selects (regiones, departamentos, nodosConcentrador).
const props = defineProps({
  open: {                                    // <- valor que controla abrir/cerrar
    type: Boolean,
    default: false,
  },
  options: {                                  // <- catálogos (si no llegan, usa arrays vacíos)
    type: Object,
    default: () => ({
      regiones: [],
      departamentos: [],
      nodosConcentrador: [],
    }),
  },
})

// Declaramos eventos que el hijo puede emitir al padre.
// - 'update:open': para que el padre reciba cambios del v-model:open.
// - 'submit': cuando el formulario es válido y el usuario confirma.
// - 'cancel': si el usuario cancela sin enviar.
const emit = defineEmits(['update:open', 'submit', 'cancel'])

/* =====================  PUENTE v-model (props <-> emit)  ===================== */

// openLocal es un computed con get/set que "puentea" la prop 'open' con el
// evento 'update:open'. Permite usar v-model en el VDialog sin defineModel.
const openLocal = computed({
  get: () => props.open,                      // lee el valor actual desde la prop
  set: v  => emit('update:open', v),          // emite al padre cuando cambia (clic fuera, Esc, etc.)
})

/* =====================  ESTADO DEL FORM  ===================== */

// Pestaña actual (por defecto 'planeamiento')
const tab = ref('planeamiento')

// Referencia al VForm para poder ejecutar validate(), resetValidation(), etc.
const formRef = ref(null)

// Modelo reactivo con los campos del formulario
const form = reactive({
  ip: '',
  eecc: '',
  prioridad: '',
  nodo: '',
  uips: '',
  region: '',
  dpto: '',
  nodo_concentrador: '',
})

// Regla básica de requerido (acepta 0 como válido)
const req = v => (!!v || v === 0) || 'Requerido'

// Computado para deshabilitar el botón si a simple vista falta algo.
// (No reemplaza la validación formal de VForm, solo ayuda a UX del botón)
const isComplete = computed(() => {
  const keys = ['ip', 'eecc', 'prioridad', 'nodo', 'uips', 'region', 'dpto', 'nodo_concentrador']
  return keys.every(k => form[k] !== '' && form[k] !== null && form[k] !== undefined)
})

/* =====================  CICLO: RESET AL ABRIR  ===================== */

// Observa cuando el diálogo se abre (props.open = true):
// - Resetea valores del form
// - Vuelve a la pestaña inicial
// - Limpia mensajes de validación (resetValidation)
watch(
  () => props.open,                           // observamos la prop 'open'
  v => {
    if (v) {                                  // si se abrió el diálogo
      Object.assign(form, {                   // reseteamos el formulario
        ip: '',
        eecc: '',
        prioridad: '',
        nodo: '',
        uips: '',
        region: '',
        dpto: '',
        nodo_concentrador: '',
      })
      tab.value = 'planeamiento'              // volvemos a la pestaña inicial
      // Limpiamos validaciones en el siguiente frame para asegurar que el DOM está listo
      requestAnimationFrame(() => formRef.value?.resetValidation())
    }
  }
)

/* =====================  HANDLERS: SUBMIT / CANCEL  ===================== */

// onSubmit: valida el formulario; si es válido, emite 'submit' con los datos
// y cierra el diálogo emitiendo 'update:open' en false.
async function onSubmit() {
  // Ejecuta la validación del VForm (muestra mensajes de error en los campos)
  const { valid } = await formRef.value.validate()
  if (!valid) return                          // si no es válido, no enviamos ni cerramos

  emit('submit', { ...form })                 // mandamos los datos al padre
  emit('update:open', false)                  // cerramos el diálogo avisando al padre
}

// onCancel: avisa al padre que se canceló y cierra el diálogo.
function onCancel() {
  emit('cancel')                              // notifica cancelación
  emit('update:open', false)                  // cierra el diálogo avisando al padre
}
</script>
