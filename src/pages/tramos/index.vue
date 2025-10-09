<template>
  <VRow class="mb-4">
    <!-- Loader Global para la página -->
    <VOverlay
      v-model="isPageLoading"
      class="align-center justify-center"
      persistent
    >
      <VProgressCircular indeterminate color="primary" size="64" />
    </VOverlay>
  </VRow>
  <!-- Componente de Filtros -->
  <FiltrosTramos v-model="filtros" :estados-unicos="estadosUnicos" />

  <!-- Componente de Tabla -->
  <!-- Pasamos isLoading para que la tabla pueda mostrar un estado de carga -->
  <tabla
    :lista_tramos="filteredTramos"
    :loading="isLoading"
    @toggleAsignacion="abrirDialogoAsignar"
    @verDetalle="recibirIdDesdeTabla"
    @verTrabajos="abrirTrabajos"
    @verCandados="abrirCandados"
    @asignarTecnico="abrirDialogoAsignarTecnico"
  />

  <DialogLicencia
    v-model:open="openLicencia"
    :id_proyecto="idSeleccionado"
    :items="licenciasDelProyecto"
    :isedit="licenciasDelProyecto.length > 0"
    :minimo="licenciasDelProyecto.length"
    :user-role="currentUser?.role"
    :data="lista_data"
    @save="crearLicencia"
    @cancel="openLicencia = false"
  />
  <!-- Dialog Estado Avance -->

  <DialogTrabajos
    v-model:open="openTrabajos"
    :id-proyecto="idSeleccionado"
    :options="options"
    :initial-data="trabajosParaDialogo"
    :is-edit="
      !!(
        trabajosParaDialogo.trabajos && trabajosParaDialogo.trabajos.length > 0
      )
    "
    @submit="onTrabajoDialogSubmit"
    @cancel="openTrabajos = false"
  />

  <DialogCandados
    v-model:open="openCandados"
    :id-proyecto="idSeleccionado"
    :is-edit="!!(lista_candado_buscado.length > 0)"
    :initial-data="lista_candado_buscado"
    :minimo="lista_candado_buscado.length"
    @cancel="openCandados = false"
    @save="registrarCandados"
    @save-foto="registrarFoto"
    @delete-foto="eliminarFoto"
  />

  <!-- Dialog para ASIGNAR proyecto -->
  <DialogAsignar
    v-model:open="openAsignar"
    :proyecto="tramoParaAsignar"
    @guardar="guardarAsignacion"
    @cancel="openAsignar = false"
  />

  <VSnackbar
    v-model="snackbar.show"
    :color="snackbar.color"
    :timeout="3000"
    location="top top"
  >
    {{ snackbar.message }}
  </VSnackbar>

  <ConfirmacionSolicitud
    :mensaje="mensajeDialog"
    :openDialog="openDialog"
    :valor="valorDialog"
    :titulo="tituloDialog"
    @confirmar="handleConfirmar"
  />
</template>

<script setup>
// 1. Imports de componentes de UI y el nuevo composable
import tabla from "./components/tabla.vue";
import FiltrosTramos from "./components/FiltrosTramos.vue";
import DialogLicencia from "@/pages/seguimiento-licencia/components/DialogLicencia.vue";
import DialogTrabajos from "@/pages/intermodal-base-interna/components/DialogTrabajos.vue";
import DialogCandados from "./dialog/DialogCandado.vue";
import DialogAsignar from "./dialog/DialogAsignar.vue";
import datos from "@/pages/intermodal-base-interna/composables/data.js";
import ConfirmacionSolicitud from "../../components/dialogs/ConfirmacionSolicitud.vue";
import { useTramos } from "./useTramos.js";
import { useTramoDialog } from "./useTramoDialog.js";
import { useTrabajoDialog } from "./useTrabajoDialog";
import { ref } from "vue";
import { useCandados } from "./useCandados";
import { useAsignacion } from "./useAsignacion.js";
import { useAsigancionTecnico } from "./useAsigancionTecnico.js";

const openDialog = ref(false);
const mensajeDialog = ref("");
const tituloDialog = ref("");
const valorDialog = ref([]);
const isPageLoading = ref(false);

const options = reactive({
  regiones: ["LIMA", "PROVINCIA"],
  departamentos: [
    "LIMA",
    "AREQUIPA",
    "ANCASH",
    "JUNIN",
    "CUSCO",
    "LAMBAYEQUE",
    "LA LIBERTAD",
    "ICA",
    "PIURA",
  ],
  nodosConcentrador: [
    "HIGUERETA",
    "LA VICTORIA",
    "LOS OLIVOS",
    "SAN JOSE",
    "AREQUIPA 15 DE ENERO",
    "CHIMBOTE CENTRO",
    "HUANCAYO CENTRO",
    "CUSCO LARAPA",
    "CHICLAYO LEONARDO ORTIZ",
    "TRUJILLO CENTRO",
    "ICA CENTRO",
    "PIURA CENTRO",
  ],
  estados: ["EN PROCESO", "CULMINADO", "STAND BY"],
  tipos_trabajos: datos.value.rows,
});

const snackbar = reactive({
  show: false,
  message: "",
  color: "",
});

// 2. Usamos el composable para obtener toda la lógica
const {
  filtros,
  estadosUnicos,
  filteredTramos,
  isLoading,
  error,
  cargarTramos, // 1. Obtenemos la función para recargar
} = useTramos();

// 3. Declara el ID seleccionado aquí, como una referencia compartida.
const idSeleccionado = ref(null);

const {
  recibirIdDesdeTabla,
  crearLicencia,
  openLicencia,
  lista_data,
  licenciasDelProyecto,
  currentUser,
} = useTramoDialog({
  snackbar,
  idSeleccionado, // 4. Pasa la referencia al composable
  isPageLoading,
  onSuccess: cargarTramos, // 2. Se la pasamos al diálogo como el callback `onSuccess`
});

const {
  abrirTrabajos,
  onTrabajoDialogSubmit,
  openTrabajos,
  trabajosParaDialogo,
} = useTrabajoDialog({
  idSeleccionado, // 4. Pasa la referencia al otro composable también
  onSuccess: cargarTramos, // 2. Se la pasamos al diálogo como el callback `onSuccess`
});

const {
  abrirCandados,
  registrarCandados,
  registrarFoto,
  eliminarFoto,
  lista_candado_buscado,
  openCandados,
} = useCandados({
  idSeleccionado,
  snackbar,
  isPageLoading,
  onSuccess: cargarTramos,
});

const {
  abrirDialogoAsignar,
  guardarAsignacion,
  openAsignar,
  tramoParaAsignar,
} = useAsignacion({
  snackbar,
  idSeleccionado,
  onSuccess: cargarTramos,
});

const { abrirDialogoAsignarTecnico, asignacionTramoTecnico } =
  useAsigancionTecnico({
    openDialog,
    mensajeDialog,
    tituloDialog,
    valorDialog,
    isPageLoading,
    snackbar,
    onSuccess: cargarTramos, // 2. Se la pasamos al diálogo como el callback `onSuccess`
  });

async function handleConfirmar(datos) {
   
  if (datos.accion === "Asignar_tecnico_tramo") {
    openDialog.value = false;
    asignacionTramoTecnico(datos);
  }
}
</script>
