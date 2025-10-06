<!-- src/pages/intermodal-base-interna/components/dialog.vue -->
<template>
  <!-- NOTA: Para este ejemplo, he creado un componente FormDiseno.vue que no está en el contexto. -->
  <!-- Puedes seguir este patrón para los demás VCardText. -->
  <VDialog v-model="openLocal" max-width="1400" :retain-focus="false" scrollable>
    <VCard class="dialog-card">
      <VCardTitle class="text-h5 pa-6 bg-primary text-white d-flex justify-space-between align-center">
        <span>Nuevo Registro - Intermodal Base Interna</span>
        <VBtn icon variant="text" color="white" @click="onCancel">
          <VIcon>mdi-close</VIcon>
        </VBtn>
      </VCardTitle>
      
      <VCardText class="pa-0">
        <VForm ref="formRef">
          <!-- Sección Proyecto -->
          <VCard class="ma-4 mb-6" elevation="2">
            <VCardTitle class="text-h6 pa-4 bg-grey-lighten-4">
              <VIcon class="me-2">mdi-folder-outline</VIcon>
              Datos del Proyecto
            </VCardTitle>
            <FormProyecto v-model="form.proyecto" :options="options" />
          </VCard>

          <!-- Sección Diseño -->
          <VCard class="ma-4 mb-6" elevation="2">
            <VCardTitle class="text-h6 pa-4 bg-grey-lighten-4">
              <VIcon class="me-2">mdi-pencil-ruler</VIcon>
              Datos de Diseño
            </VCardTitle>
            <FormDiseno v-model="form.diseno" />
          </VCard>

          <!-- Sección Integración -->
          <VCard class="ma-4 mb-6" elevation="2">
            <VCardTitle class="text-h6 pa-4 bg-grey-lighten-4">
              <VIcon class="me-2">mdi-network</VIcon>
              Datos de Integración
            </VCardTitle>
            <FormIntegracion v-model="form.integracion" />
          </VCard>

          <!-- Sección CAPEX -->
          <VCard class="ma-4 mb-6" elevation="2">
            <VCardTitle class="text-h6 pa-4 bg-grey-lighten-4">
              <VIcon class="me-2">mdi-currency-usd</VIcon>
              Datos CAPEX
            </VCardTitle>
            <FormCapex v-model="form" />
          </VCard>

          <!-- Sección PEX -->
          <VCard class="ma-4 mb-6" elevation="2">
            <VCardTitle class="text-h6 pa-4 bg-grey-lighten-4">
              <VIcon class="me-2">mdi-calendar-clock</VIcon>
              Datos PEX
            </VCardTitle>
            <FormPex v-model="form.pex" />
          </VCard>

          <!-- Sección Saltos -->
          <VCard class="ma-4 mb-6" elevation="2">
            <VCardTitle class="text-h6 pa-4 bg-grey-lighten-4">
              <VIcon class="me-2">mdi-map-marker-multiple</VIcon>
              Configuración de Saltos
            </VCardTitle>
            <FormSalto v-model="form.saltos" :nodos="options.nodos" />
          </VCard>
        </VForm>
      </VCardText>

      <VDivider />
      
      <VCardActions class="pa-6 bg-grey-lighten-5">
        <VSpacer />
        <VBtn 
          color="secondary" 
          variant="outlined" 
          @click="onCancel"
          class="me-3"
        >
          <VIcon start>mdi-cancel</VIcon>
          Cancelar
        </VBtn>
        <VBtn 
          color="primary" 
          :disabled="!isComplete" 
          @click="onSubmit"
          variant="elevated"
        >
          <VIcon start>mdi-check</VIcon>
          Guardar Registro
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>

<script setup>
import { reactive, ref, watch, computed, onMounted } from "vue";
import { VCardText } from "vuetify/components";
import FormProyecto from "./FormProyecto.vue"; // 1. Importar el nuevo componente
import FormDiseno from "./FormDiseno.vue"; // 1. Importar el nuevo componente
import FormIntegracion from "./FormIntegracion.vue"; // 1. Importar el nuevo componente
import FormCapex from "./FormCapex.vue"; // 1. Importar el nuevo componente
import FormPex from "./FormPex.vue";
import FormSalto from "./FormSaltos.vue";
import { $api } from "@/utils/api";
/* -------- props / emits -------- */
const props = defineProps({
  open: { type: Boolean, default: false },
  options: {
    type: Object,
    default: () => ({
      regiones: [],
      departamentos: [],
      nodosConcentrador: [],
      nodos: [], // <-- Nuevo: para almacenar la lista de nodos
      tipos_trabajos: [], // [{ id_tipo, nombre, unidad? }]
    }),
  },
});
const emit = defineEmits(["update:open", "submit", "cancel"]);

/* -------- v-model puente -------- */
const openLocal = computed({
  get: () => props.open,
  set: (v) => emit("update:open", v),
});

/* -------- form -------- */
const formRef = ref(null);

const defaultForms = () => ({
  proyecto: {
    eecc: "",
    prioridad: "",
    nodo: "",
    uips: null,
    region: "",
    departamento: "",
    nodo_concentrador: "",
    desplieges_router: "",
    enlace: "",
    comercial: "",
    tipo_enlace: "",
  },
  diseno: {
    estado_diseño: "",
    distancia: "",
    aereo: "",
    sub_c_red: "",
    sub_s_red: "",
    tramo: "",
  },
  integracion: {
    despliege_e_i: "",
    router: "",
    proveedor: "",
    integracion_intermodal: "",
    jumpeo: "",
  },
  capex: {
    mat: "",
    mo: "",
  },
  pex: {
    estado_pex: "",
    fecha_interna: "",
    kick_off: "",
    culminacion: "",
  },
  saltos: [], // <-- ¡Añadir esta línea!
});

const form = reactive(defaultForms());

const FIELDS_PROYECTO = [
  "eecc",
  "prioridad",
  "nodo",
  "uips",
  "region",
  "departamento",
  "nodo_concentrador",
  "tipo_enlace",
];

/* -------- reset al abrir -------- */
watch(
  () => props.open,
  (v) => {
    if (v) {
      // Resetea el formulario a su estado inicial.
      // Los componentes hijos se encargarán de sus propios campos.
      Object.assign(form, defaultForms());
      requestAnimationFrame(() => formRef.value?.resetValidation());
    }
  }
);

/* -------- validación mínima -------- */
const isComplete = computed(() => {
  // 1. Validación de la sección Proyecto
  const requiredProjectFields = FIELDS_PROYECTO.filter(
    (k) => !["ip", "uips"].includes(k)
  );
  const okProyectoRequerido = requiredProjectFields.every((k) => {
    const value = form.proyecto[k];
    return value !== "" && value !== null && value !== undefined;
  });

  // 2. Validación de la sección Saltos (¡NUEVO!)
  // Para que sea requerido, debe haber al menos un salto y cada uno debe tener su ubicación.
  const saltosCompletados = form.saltos.filter((salto) => {
    // 'nombre_nodo' es el campo que se llena al seleccionar una ubicación en UbicacionSelect.
    return (
      salto.nombre_nodo !== null &&
      salto.nombre_nodo !== undefined &&
      salto.nombre_nodo !== ""
    );
  }).length;

  const okSaltos =
    form.saltos.length > 0 && saltosCompletados === form.saltos.length;

  // El formulario es completo solo si AMBAS secciones son válidas.
  return okProyectoRequerido && okSaltos;
});

/* -------- submit / cancel -------- */
async function onSubmit() {
  // Construimos el objeto con la estructura deseada
  const rawPayload = {
    proyecto: form.proyecto,
    diseno: form.diseno,
    integracion: form.integracion,
    capex: form.capex,
    pex: form.pex,
    saltos: form.saltos,
  };

  // Recorremos cada sección y convertimos los campos vacíos "" a null.
  const payload = JSON.parse(JSON.stringify(rawPayload), (key, value) => {
    return value === "" ? null : value;
  });

  emit("submit", payload);
  emit("update:open", false);
}

function onCancel() {
  emit("cancel");
  emit("update:open", false);
}
</script>

<style scoped>
.dialog-card {
  border-radius: 12px !important;
}

.dialog-card .v-card-title {
  border-radius: 12px 12px 0 0 !important;
}

.v-card .v-card-title {
  border-radius: 8px 8px 0 0 !important;
}

/* Animación suave para las tarjetas */
.v-card {
  transition: all 0.3s ease;
}

.v-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1) !important;
}

/* Espaciado mejorado para los iconos */
.v-icon {
  opacity: 0.8;
}

/* Estilo para botones principales */
.v-btn.v-btn--elevated {
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
}
</style>
