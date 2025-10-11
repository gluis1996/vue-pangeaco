<template>
  <VForm @submit.prevent="onSubmit">
    <VCard>
      <VCardTitle class="th-principal">ADMINISTRATIVO</VCardTitle>
      <VCardText>
        <VRow class="mb-2" align="center">
          <VCol cols="12" sm="6" md="4" lg="3">
            <VSelect
              v-model="form.fase"
              :items="['FASE 1', 'FASE 2', 'FASE 3']"
              label="Fase"
              required
              clearable
              :disabled="isEdit && props.isAdmin !== 'admin'"
            />
          </VCol>
          <VCol cols="12" sm="6" md="4" lg="3">
            <VSelect
              v-model="form.enlace"
              :items="['PRINCIPAL', 'TRAMOS']"
              label="Enlace"
              required
              clearable
              :disabled="isEdit && props.isAdmin !== 'admin'"
            />
          </VCol>
          <VCol cols="12" sm="6" md="4" lg="3">
            <VSelect
              v-model="form.nodo"
              :items="['SAN JUAN', 'HIGUERETA', 'OTRO NODO']"
              label="Nodo"
              required
              clearable
              :disabled="isEdit && props.isAdmin !== 'admin'"
            />
          </VCol>
          <VCol cols="12" sm="6" md="4" lg="3">
            <VTextField
              v-model="form.odf"
              label="ODF"
              placeholder="Ej: PG_JUODF01"
              required
              :disabled="isEdit && props.isAdmin !== 'admin'"
            />
          </VCol>
          <VCol cols="12" sm="6" md="4" lg="3">
            <VTextField
              v-model="form.modulo"
              type="number"
              label="Modulo"
              placeholder="Ej: 1"
              required
              :disabled="isEdit && props.isAdmin !== 'admin'"
            />
          </VCol>
          <VCol cols="12" sm="6" md="4" lg="3">
            <VTextField
              v-model="form.bandeja"
              type="number"
              label="Bandeja"
              placeholder="Ej: 1"
              required
              :disabled="isEdit && props.isAdmin !== 'admin'"
            />
          </VCol>
          <VCol cols="12" sm="6" md="4" lg="3">
            <VTextField
              v-model="form.puerto"
              type="number"
              label="Puerto"
              placeholder="Ej: 1"
              required
              :disabled="isEdit && props.isAdmin !== 'admin'"
            />
          </VCol>
          <VCol cols="12" sm="6" md="4" lg="3">
            <VTextField
              v-model="form.cable"
              label="Cable"
              placeholder="Ej: P08 o BA-HI-01-P"
              required
              :disabled="isEdit && props.isAdmin !== 'admin'"
            />
          </VCol>
          <VCol cols="12" sm="6" md="4" lg="3">
            <VTextField
              v-model="form.hilo"
              label="Hilo"
              placeholder="Ej: 1"
              required
              :disabled="isEdit && props.isAdmin !== 'admin'"
            />
          </VCol>
        </VRow>
      </VCardText>
    </VCard>

    <!-- Sección TECNICO -->
    <VCard class="mt-4">
      <VCardTitle>TÉCNICO</VCardTitle>
      <VCardText>
        <VRow>
          <VCol cols="12" sm="6" md="4" lg="3">
            <VTextField
              v-model="form.router"
              label="Router"
              placeholder="Ej: RC_M6000_2S16_HIGUERETA_01"
            />
          </VCol>

          <VCol cols="12" sm="6" md="4" lg="3">
            <VTextField
              v-model="form.puerto_router"
              label="Puerto Router"
              placeholder="Ej: GigabitEthernet 0/2/0/2"
            />
          </VCol>

          <VCol cols="12" sm="6" md="4" lg="3">
            <VTextField
              v-model="form.enlace_final"
              type="number"
              label="Enlace Final"
              placeholder="Ej: 1"
            />
          </VCol>

          <VCol cols="12" sm="6" md="4" lg="3">
            <VTextField
              v-model="form.obs"
              label="Observación"
              placeholder="Ej: Observación ..."
            />
          </VCol>

          <VCol cols="12" sm="6" md="4" lg="3">
            <VTextField
              v-model="form.obs2"
              label="Observación 2"
              placeholder="Ej: Observación adicional..."
            />
          </VCol>

          <VCol cols="12" sm="6" md="4" lg="3">
            <VTextField
              v-model="form.distancia"
              type="number"
              label="Distancia (m)"
              suffix="m"
              placeholder="Ej: 100"
            />
          </VCol>

          <VCol cols="12" sm="6" md="4" lg="3">
            <VTextField
              v-model="form.sfp"
              label="Sfp"
              placeholder="Ej: ZTE_10K..."
            />
          </VCol>

          <VCol cols="12" sm="6" md="4" lg="3">
            <VTextField
              v-model="form.sfp_entregar"
              type="number"
              suffix="und"
              label="sfp Entregar"
              placeholder="Ej: 1"
            />
          </VCol>

          <VCol cols="12" sm="6" md="4" lg="3">
            <VSelect
              v-model="form.estado_final"
              :items="['Completada', 'Pendiente']"
              label="Estado Final"
              clearable
            />
          </VCol>

          <VCol cols="12" sm="6" md="4" lg="3">
            <VSelect
              v-model="form.router_interior"
              :items="['Instalado', 'Pendiente']"
              label="Router Interior"
              clearable
            />
          </VCol>

          <VCol cols="12" sm="6" md="4" lg="3">
            <VTextField
              v-model="form.ip"
              label="IP"
              placeholder="Ej: 192.168.1.1"
            />
          </VCol>

          <VCol cols="12" sm="6" md="4" lg="3">
            <VTextField
              v-model="form.contrata"
              label="Contrata"
              placeholder="Ej: ABC"
            />
          </VCol>

          <!-- Agrega aquí más campos técnicos si necesitas -->
        </VRow>
      </VCardText>
    </VCard>

    <div class="mt-4">
      <VBtn type="submit" color="primary" class="mr-2">
        {{ isEdit ? "Actualizar" : "Registrar" }}
      </VBtn>
      <VBtn color="secondary" @click="$emit('cancel')">Cancelar</VBtn>
    </div>
  </VForm>
</template>

<script setup>
import { reactive, watch, computed, ref } from "vue";
import { VCard, VCol, VRow, VSelect } from "vuetify/components";

const props = defineProps({
  item: { type: Object, default: null },
  isAdmin: { type: String, default: "tecnico" },
  id_proyecto_tramo: { type: [Number, String], default: null },
});
const emit = defineEmits(["save", "cancel"]);
// const iseditable = ref(false);
// if (props.isAdmin !== "admin") {
//   iseditable.value = true;
// }

const form = reactive({
  id: null,
  id_proyecto_tramo: props.id_proyecto_tramo ?? null,
  fase: null,
  enlace: null,
  nodo: null,
  odf: null,
  modulo: null,
  bandeja: null,
  puerto: null,
  cable: null,
  hilo: null,
  router: null,
  puerto_router: null,
  enlace_final: null,
  obs: null,
  obs2: null,
  distancia: null,
  sfp: null,
  sfp_entregar: null,
  estado_final: null,
  router_interior: null,
  ip: null,
  contrata: null,
  // ...otros campos si necesitas
});

// Si es edición, rellena el formulario
watch(
  () => props.item,
  (val) => {
    if (val) {
      form.id = val.id ?? null;
      form.id_proyecto_tramo = props.id_proyecto_tramo ?? null;
      form.fase = val.fase ?? null;
      form.enlace = val.enlace ?? null;
      form.nodo = val.nodo ?? null;
      form.odf = val.odf ?? null;
      form.modulo = val.modulo ?? null;
      form.bandeja = val.bandeja ?? null;
      form.puerto = val.puerto ?? null;
      form.cable = val.cable ?? null;
      form.hilo = val.hilo ?? null;
      form.router = val.router ?? null;
      form.puerto_router = val.puerto_router ?? null;
      form.enlace_final = val.enlace_final ?? null;
      form.obs = val.obs ?? null;
      form.obs2 = val.obs2 ?? null;
      form.distancia = val.distancia ?? null;
      form.sfp = val.sfp ?? null;
      form.sfp_entregar = val.sfp_entregar ?? null;
      form.estado_final = val.estado_final ?? null;
      form.router_interior = val.router_interior ?? null;
      form.ip = val.ip ?? null;
      form.contrata = val.contrata ?? null;
    } else {
      form.id = null;
      form.id_proyecto_tramo = props.id_proyecto_tramo ?? null;
      form.fase = null;
      form.enlace = null;
      form.nodo = null;
      form.odf = null;
      form.modulo = null;
      form.bandeja = null;
      form.puerto = null;
      form.cable = null;
      form.hilo = null;
      form.router = null;
      form.puerto_router = null;
      form.enlace_final = null;
      form.obs = null;
      form.obs2 = null;
      form.distancia = null;
      form.sfp = null;
      form.sfp_entregar = null;
      form.estado_final = null;
      form.router_interior = null;
      form.ip = null;
      form.contrata = null;
    }
  },
  { immediate: true }
);

const isEdit = computed(() => !!props.item);

function onSubmit() {
  emit("save", { ...form });
}
</script>
