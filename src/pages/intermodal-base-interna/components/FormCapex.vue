<template>
  <VCardText>
    <VRow>
      <VCol cols="12" md="2">
        <v-text-field
          v-model="formLocal.capex.diseno"
          label="Diseño"
          suffix="S/."
          density="compact"
          @keydown="handleRightToLeftInput($event, 'diseno', 'capex.diseno')"
          @click="
            (event) => {
              if (event.target.setSelectionRange)
                event.target.setSelectionRange(
                  event.target.value.length,
                  event.target.value.length
                );
            }
          "
        />
      </VCol>

      <VCol cols="12" md="2">
        <v-text-field
          v-model="formLocal.capex.licencia"
          label="Licencia"
          suffix="S/."
          density="compact"
          @keydown="
            handleRightToLeftInput($event, 'licencia', 'capex.licencia')
          "
          @click="
            (event) => {
              if (event.target.setSelectionRange)
                event.target.setSelectionRange(
                  event.target.value.length,
                  event.target.value.length
                );
            }
          "
        />
      </VCol>

      <VCol cols="12" md="2">
        <v-text-field
          v-model="formLocal.capex.mat_bucle"
          label="Mat Bucle"
          suffix="S/."
          density="compact"
          @keydown="
            handleRightToLeftInput($event, 'mat_bucle', 'capex.mat_bucle')
          "
          @click="
            (event) => {
              if (event.target.setSelectionRange)
                event.target.setSelectionRange(
                  event.target.value.length,
                  event.target.value.length
                );
            }
          "
        />
      </VCol>

      <VCol cols="12" md="2">
        <v-text-field
          v-model="formLocal.capex.c_oc"
          label="C.O.C"
          suffix="S/."
          density="compact"
          @keydown="handleRightToLeftInput($event, 'c_oc', 'capex.c_oc')"
          @click="
            (event) => {
              if (event.target.setSelectionRange)
                event.target.setSelectionRange(
                  event.target.value.length,
                  event.target.value.length
                );
            }
          "
        />
      </VCol>

      <VCol cols="12" md="2">
        <v-text-field
          v-model="formLocal.capex.mat"
          label="Mat Sap"
          suffix="S/."
          density="compact"
          @keydown="handleRightToLeftInput($event, 'mat', 'capex.mat')"
          @click="
            (event) => {
              if (event.target.setSelectionRange)
                event.target.setSelectionRange(
                  event.target.value.length,
                  event.target.value.length
                );
            }
          "
        />
      </VCol>

      <VCol cols="12" md="2">
        <v-text-field
          v-model="formLocal.capex.mo"
          label="Mo Total"
          suffix="S/."
          density="compact"
          readonly
        ></v-text-field>
      </VCol>
      <VCol cols="12" md="2">
        <v-text-field
          v-model="capexTotal"
          label="Capex"
          suffix="S/."
          readonly
          density="compact"
        ></v-text-field>
      </VCol>
      
      <VCol cols="12" md="2">
        <v-text-field
          v-model="costoOpex"
          label="Opex"
          type="number"
          suffix="S/."
          readonly
          density="compact"
        ></v-text-field>
      </VCol>

      <VCol cols="12" md="2">
        <v-text-field
          v-model="costoAereo"
          label="Opex Aéreo"
          type="number"
          suffix="S/."
          readonly
          density="compact"
        ></v-text-field>
      </VCol>

      <VCol cols="12" md="2">
        <v-text-field
          v-model="costoOpexSub"
          label="Opex Sub"
          type="number"
          suffix="S/."
          readonly
          density="compact"
        ></v-text-field>
      </VCol>
      <VDivider />
    </VRow>
  </VCardText>
</template>

<script setup>
import { computed, ref, watch } from "vue";

const props = defineProps({
  modelValue: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(["update:modelValue"]);

// Función para manejar el input de derecha a izquierda con decimales
const handleRightToLeftInput = (event, field, path) => {
  try {
    const input = event.target;
    const key = event.key;

    // Permitir teclas de control (backspace, delete, arrow keys, etc.)
    const controlKeys = [
      "Backspace",
      "Delete",
      "Tab",
      "Enter",
      "ArrowLeft",
      "ArrowRight",
      "ArrowUp",
      "ArrowDown",
    ];

    if (controlKeys.includes(key)) {
      if (key === "Backspace") {
        event.preventDefault();
        let currentValue = String(input.value || "0");

        // Remover último dígito (dividir por 10)
        let numericValue = parseFloat(currentValue) || 0;
        numericValue = Math.floor(numericValue * 10) / 100;

        const newValue = numericValue.toFixed(2);
        updateNestedValue(path, parseFloat(newValue));

        // Mover cursor al final
        setTimeout(() => {
          if (input && input.setSelectionRange) {
            input.setSelectionRange(input.value.length, input.value.length);
          }
        }, 0);
      }
      return;
    }

    // Solo permitir números
    if (!/^\d$/.test(key)) {
      event.preventDefault();
      return;
    }

    event.preventDefault();

    // Obtener valor actual y convertir a centavos
    let currentValue = String(input.value || "0");
    let numericValue = Math.round((parseFloat(currentValue) || 0) * 100);

    // Agregar nuevo dígito desplazando hacia la izquierda
    numericValue = numericValue * 10 + parseInt(key);

    // Convertir de vuelta a formato decimal
    const newValue = (numericValue / 100).toFixed(2);

    updateNestedValue(path, parseFloat(newValue));

    // Mover cursor al final
    setTimeout(() => {
      if (input && input.setSelectionRange) {
        input.setSelectionRange(input.value.length, input.value.length);
      }
    }, 0);
  } catch (error) {
    console.warn("Error en handleRightToLeftInput:", error);
  }
};

// Función para actualizar valores anidados en el objeto
const updateNestedValue = (path, value) => {
  try {
    const newForm = { ...formLocal.value };
    const keys = path.split(".");
    let current = newForm;

    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]]) {
        current[keys[i]] = {};
      }
      current = current[keys[i]];
    }

    current[keys[keys.length - 1]] = value;
    formLocal.value = newForm;
  } catch (error) {
    console.warn("Error en updateNestedValue:", error);
  }
};

// Usamos una computed property para el v-model
const formLocal = computed({
  get: () => props.modelValue,
  set: (value) => emit("update:modelValue", value),
});

const capexTotal = computed(() => {
  const dis = Number(formLocal.value.capex.diseno) || 0;
  const lic = Number(formLocal.value.capex.licencia) || 0;
  const matBucle = Number(formLocal.value.capex.mat_bucle) || 0;
  const cOc = Number(formLocal.value.capex.c_oc) || 0;
  const mat = Number(formLocal.value.capex.mat) || 0;
  const mo = Number(formLocal.value.capex.mo) || 0;
  return parseFloat((mat + mo + dis + lic + matBucle + cOc).toFixed(2));
});

const costoAereo = computed(() => {
  const valorAereo = Number(formLocal.value.diseno.aereo) || 0;
  return parseFloat((Math.ceil(valorAereo / 50) * 3.75 * 1.4 * 12).toFixed(2));
});

const costoOpexSub = computed(() => {
  const vasred = Number(formLocal.value.diseno.sub_s_red) || 0;
  return parseFloat((Math.ceil(vasred / 100) * 73.84 * 12).toFixed(2));
});

const costoOpex = computed(() => {
  return parseFloat((costoAereo.value + costoOpexSub.value).toFixed(2));
});

const montoTotal = computed(() => {
  const png = Number(formLocal.value.diseno.postes_nuevos_generar) || 0;
  const dis = Number(formLocal.value.capex.diseno) || 0;
  const lic = Number(formLocal.value.capex.licencia) || 0;
  const oc = Number(formLocal.value.capex.c_oc) || 0;
  const mat = Number(formLocal.value.capex.mat) || 0;
  return parseFloat((png + dis + lic + oc +  mat).toFixed(2));
});

// Watcher para actualizar automáticamente el campo mo con el montoTotal
watch(montoTotal, (newTotal) => {
  // Formatear a 2 decimales antes de guardar
  const formattedTotal = parseFloat(newTotal.toFixed(2));
  updateNestedValue('capex.mo', formattedTotal);
}, { immediate: true });
</script>
