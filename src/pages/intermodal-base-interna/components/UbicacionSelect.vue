<template>
    <VSheet class="ubicacion-inline" elevation="0">
        <VWindow v-model="step" :touch="false" class="w-100" :disabled="loading.rehidratando">
            <!-- Paso 1: Departamento -->
            <VWindowItem :value="0">
                <VSelect v-model="selectedDepartamento" label="Departamento" :items="departamentos" item-title="nombre"
                    item-value="id_dep" :loading="loading.departamentos" density="compact" variant="outlined"
                    class="w-100" :menu-props="{ maxHeight: 240 }" placeholder="Selecciona…"
                    @update:model-value="onDepartamentoSelected" />
            </VWindowItem>

            <!-- Paso 2: Provincia -->
            <VWindowItem :value="1">
                <VSelect v-model="selectedProvincia" label="Provincia" :items="provincias" item-title="nombre"
                    item-value="id_prov" :loading="loading.provincias" density="compact" variant="outlined"
                    class="w-100" :menu-props="{ maxHeight: 240 }" placeholder="Selecciona…"
                    @update:model-value="onProvinciaSelected">
                    <template #prepend-inner>
                        <VBtn variant="text" :ripple="false"
                            @click.stop="step = 0"><-</VBtn>
                    </template>
                </VSelect>
            </VWindowItem>

            <!-- Paso 3: Distrito (solo si el nivel es 'distrito') -->
            <VWindowItem :value="2">
                <VSelect v-model="selectedDistrito" label="Distrito" :items="distritos" item-title="nombre"
                    item-value="id_dist" :loading="loading.distritos" density="compact" variant="outlined"
                    class="w-100" :menu-props="{ maxHeight: 240 }" placeholder="Selecciona…"
                    @update:model-value="onDistritoSelected">
                    <template #prepend-inner>
                        <VBtn variant="text" :ripple="false"
                            @click.stop="step = 1"><-</VBtn>
                    </template>
                </VSelect>
            </VWindowItem>
        </VWindow>

        <!-- Chip compacto (opcional). Si te ocupa altura, quítalo. -->
        <div v-if="finalSelectionText" class="mt-2">
            <VChip size="small" color="primary" variant="elevated" closable @click:close="resetSelection">
                <VIcon start icon="tabler-map-pin" />
                {{ finalSelectionText }}
            </VChip>
        </div>
        
        <!-- Validación oculta -->
        <VTextField :model-value="modelValue" :rules="[req]" class="d-none" />
    </VSheet>
</template>

<script setup>
import { ref, onMounted, reactive, computed, watch } from 'vue'
import { $api } from '@/utils/api'

const props = defineProps({
    modelValue: {
        type: [Number, String, null],
        default: null,
    },
    level: {
        type: String,
        default: 'distrito', // 'departamento', 'provincia', 'distrito'
        validator: v => ['departamento', 'provincia', 'distrito'].includes(v),
    },
    nameFormat: {
        type: String,
        default: 'full', // 'full' o 'short'
        validator: v => ['full', 'short'].includes(v),
    },
})

const emit = defineEmits(['update:modelValue', 'selection-changed'])

const step = ref(0) // 0: dep, 1: prov, 2: dist

const req = v => !!v || 'Requerido'

const departamentos = ref([])
const provincias = ref([])
const distritos = ref([])

const selectedDepartamento = ref(null)
const selectedProvincia = ref(null)
const selectedDistrito = ref(null)

const loading = reactive({
    departamentos: false,
    provincias: false,
    distritos: false,
    rehidratando: false, // Flag para evitar interacciones durante la carga inicial
})

// Ya no necesitamos los Mocks ni fakeApiCall

const fetchDepartamentos = async () => {
    try {
        loading.departamentos = true
        departamentos.value = []
        const data = await $api('/internodal/ubicacion/listar-departamentos', { method: 'GET' }).catch(() => [])
        departamentos.value = data.response || []
    } finally {
        loading.departamentos = false
    }
}

const onDepartamentoSelected = async (depId) => {
    // Limpiamos los niveles inferiores
    selectedProvincia.value = null
    selectedDistrito.value = null

    if (!depId) {
        emit('update:modelValue', null)
        return
    }

    // Si el nivel es 'departamento', emitimos y terminamos.
    if (props.level === 'departamento') {
        emit('update:modelValue', depId)
        emit('selection-changed', {
            id: depId,
            name: finalSelectionText.value,
        })
        return
    }

    // Si no, cargamos el siguiente nivel (provincia)
    try {
        loading.provincias = true
        provincias.value = []
        const data = await $api(`/internodal/ubicacion/listar-provincia/${depId}`, { method: 'GET' }).catch(() => [])
        provincias.value = data.response || []
        step.value = 1 // Avanzamos al siguiente paso
    } finally {
        loading.provincias = false
    }
}

const onProvinciaSelected = async (provId) => {
    selectedDistrito.value = null

    if (!provId) {
        emit('update:modelValue', null)
        return
    }

    // Si el nivel es 'provincia', emitimos y terminamos.
    if (props.level === 'provincia') {
        emit('update:modelValue', provId)
        emit('selection-changed', {
            id: provId,
            name: finalSelectionText.value,
        })
        return
    }

    // Si no, cargamos el siguiente nivel (distrito)
    try {
        loading.distritos = true
        distritos.value = []
        const data = await $api(`/internodal/ubicacion/listar-distrito/${provId}`, { method: 'GET' }).catch(() => [])
        distritos.value = data.response || []
        step.value = 2 // Avanzamos al siguiente paso
    } finally {
        loading.distritos = false
    }
}

const onDistritoSelected = (distId) => {
    emit('update:modelValue', distId) // Emitimos el ID final
    emit('selection-changed', {
        id: distId,
        name: finalSelectionText.value,
    })
}

const finalSelectionText = computed(() => {
    const dep = departamentos.value.find(d => d.id_dep === selectedDepartamento.value)?.nombre
    if (!dep) return null

    const prov = provincias.value.find(p => p.id_prov === selectedProvincia.value)?.nombre
    const dist = distritos.value.find(d => d.id_dist === selectedDistrito.value)?.nombre

    if (props.nameFormat === 'short') {
        if (props.level === 'distrito' && dist) return dist
        if (props.level === 'provincia' && prov) return prov
        if (props.level === 'departamento' && dep) return dep
    } else { // 'full' format
        if (props.level === 'distrito' && dist) return `${dep} > ${prov} > ${dist}`
        if (props.level === 'provincia' && prov) return `${dep} > ${prov}`
        if (props.level === 'departamento' && dep) return dep
    }

    return null
})

const resetSelection = () => {
    selectedDepartamento.value = null
    selectedProvincia.value = null
    selectedDistrito.value = null
    emit('update:modelValue', null)
    emit('selection-changed', null)
    step.value = 0
}

/* -------- Lógica de Rehidratación al recibir modelValue -------- */
watch(() => props.modelValue, async (newId, oldId) => {
  // Ejecutar solo si el ID es nuevo, válido y no es el que acabamos de setear.
  if (!newId || newId === oldId) return

  // Evitar re-ejecutar si ya estamos en el estado correcto
  if (newId === selectedDistrito.value || newId === selectedProvincia.value || newId === selectedDepartamento.value) {
    return
  }

  loading.rehidratando = true
  await rehidratarSeleccion(newId)
  loading.rehidratando = false
}, { immediate: true }) // `immediate` para que se ejecute al montar el componente

async function rehidratarSeleccion(id) {
  if (!id) return
  // Asegurarnos de que los departamentos estén cargados
  if (!departamentos.value.length) {
    await fetchDepartamentos()
  }

  // 👇 Llamada real a la API para obtener la jerarquía
  const response = await $api(`/internodal/ubicacion/rehidratar-ubicacion/${id}`, { method: 'GET' }).catch(() => null)
  const data = response?.response?.[0]
  if (!data || !data.depId) {
    console.error(`No se pudo rehidratar la ubicación para el ID: ${id}`)
    return
  }

  const { depId, provId, distId } = data
  
  // Si encontramos el departamento, procedemos a cargar y seleccionar en cascada
  if (depId) {
    selectedDepartamento.value = depId
    await onDepartamentoSelected(depId) // Carga provincias y avanza al step 1
    selectedProvincia.value = provId
    await onProvinciaSelected(provId)   // Carga distritos y avanza al step 2
    selectedDistrito.value = distId
  }
}


onMounted(() => {
    fetchDepartamentos() // Lo dejamos para que cargue los departamentos al inicio.
    // Si no hay modelValue, se llamará de todas formas.
})
</script>

<style  scoped>
.ubicacion-inline {
  display: block;      /* se comporta como un input normal dentro del col */
  width: 100%;         /* ocupa exactamente el ancho del VCol */
}
.w-100 { width: 100%; }
</style>