<template>
  <VSheet elevation="0" class="nodo-select-container">
    <!-- Campo de autocompletado optimizado para buscar y seleccionar nodos -->
    <VAutocomplete
      v-model="selectedNodo"
      :label="props.label"
      :items="filteredNodos"
      item-title="display_text"
      item-value="nombre_nodo"
      :loading="loading.nodos"
      density="compact"
      variant="outlined"
      class="w-100"
      :menu-props="{ 
        maxHeight: 320,
        closeOnContentClick: true
      }"
      placeholder="Escribe para buscar por nodo, nombre o sector..."
      :disabled="!nodosSource.length"
      clearable
      auto-select-first
      :search="searchText"
      @update:search="onSearchUpdate"
      @update:model-value="onNodoSelected"
      @click:clear="resetSelection"
    >
      <!-- Template para personalizar cómo se ven los items en la lista desplegable -->
      <template #item="{ props: itemProps, item }">
        <VListItem v-bind="itemProps">
          <VListItemTitle>
            <strong class="text-primary">{{ item.raw.nodo }}</strong> - {{ item.raw.nombre_nodo }}
          </VListItemTitle>
          <VListItemSubtitle>
            {{ item.raw.sector }}
          </VListItemSubtitle>
        </VListItem>
      </template>
    </VAutocomplete>
    
    <!-- Chip mostrando selección actual -->
    <div v-if="selectedNodoData" class="mt-2">
      <VChip
        size="small"
        color="primary"
        variant="elevated"
        closable
        @click:close="resetSelection"
      >
        <VIcon start icon="tabler-network" />
        {{ selectedNodoData.nodo }} - {{ selectedNodoData.nombre_nodo }}
      </VChip>
    </div>

    <!-- Campo oculto para validación -->
    <VTextField
      :model-value="modelValue"
      :rules="required ? [requiredRule] : []"
      class="d-none"
    />
  </VSheet>
</template>

<script setup>
import { ref, onMounted, reactive, computed, watch, shallowRef, nextTick } from 'vue'
import { $api } from '@/utils/api'
import { label } from '@/views/components/chip/demoCodeChip'

// Función de debounce para optimizar la búsqueda
const debounce = (func, wait) => {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

const props = defineProps({
  modelValue: {
    type: String,
    default: null,
  },
  required: {
    type: Boolean,
    default: false,
  },
  items: {
    type: Array,
    default: null,
  },
  label: {
    type: String,
    default: 'Nodo',
  },
})

const emit = defineEmits(['update:modelValue', 'nodo-selected'])

// Estados reactivos optimizados
const nodos = shallowRef([])
const selectedNodo = ref(null)
const searchText = ref('')
const filteredNodos = shallowRef([])

const loading = reactive({
  nodos: false,
})

const requiredRule = v => !!v || 'Este campo es requerido'

// Computed para obtener la fuente de datos correcta
const nodosSource = computed(() => {
  const sourceNodos = props.items || nodos.value
  
  // Solo procesamos si tenemos datos y no están ya procesados
  if (!sourceNodos.length) return []
  
  // Verificamos si ya tienen display_text para evitar re-procesamiento
  if (sourceNodos[0]?.display_text) return sourceNodos
  
  // Procesamos solo una vez y memorizamos
  return sourceNodos.map(nodo => ({
    ...nodo,
    display_text: `${nodo.nodo} - ${nodo.nombre_nodo}`
  })).sort((a, b) => a.nodo.localeCompare(b.nodo))
})

// Función de filtrado optimizada
const filterNodos = (searchTerm) => {
  const source = nodosSource.value
  
  if (!searchTerm || searchTerm.length < 2) {
    // Si no hay búsqueda o es muy corta, mostrar solo los primeros 50
    filteredNodos.value = source.slice(0, 50)
    return
  }
  
  const term = searchTerm.toLowerCase()
  const filtered = source.filter(nodo => 
    nodo.nodo?.toLowerCase().includes(term) ||
    nodo.nombre_nodo?.toLowerCase().includes(term) ||
    nodo.sector?.toLowerCase().includes(term)
  )
  
  // Limitar resultados para mejor rendimiento
  filteredNodos.value = filtered.slice(0, 100)
}

// Debounced filter function
const debouncedFilter = debounce(filterNodos, 300)

// Manejar actualizaciones de búsqueda
const onSearchUpdate = (value) => {
  searchText.value = value
  debouncedFilter(value)
}

// Computed para obtener datos completos del nodo seleccionado
const selectedNodoData = computed(() => {
  if (!selectedNodo.value) return null
  const sourceNodos = nodosSource.value

  return sourceNodos.find(nodo => nodo.nombre_nodo === selectedNodo.value)
})

// Función optimizada para cargar nodos desde la API
const fetchNodos = async () => {
  try {
    loading.nodos = true
    const response = await $api('/internodal/nodo/listar-nodo', { method: 'GET' })
    
    if (response.success && Array.isArray(response.rows)) {      
      // Procesamos los datos una sola vez al cargar
      const processedNodos = response.rows.map(nodo => ({
        ...nodo, 
        display_text: `${nodo.nodo} - ${nodo.nombre_nodo}`
      })).sort((a, b) => a.nodo.localeCompare(b.nodo))
      
      nodos.value = processedNodos
      
      // Inicializar filtro con los primeros elementos
      nextTick(() => {
        filterNodos('')
      })
    } else {
      console.error('Error en la respuesta de la API:', response)
      nodos.value = []
      filteredNodos.value = []
    }
  } catch (error) {
    console.error('Error al cargar nodos:', error)
    nodos.value = []
    filteredNodos.value = []
  } finally {
    loading.nodos = false
  }
}

// Manejo de selección de nodo
const onNodoSelected = (nombreNodo) => {
  emit('update:modelValue', nombreNodo)
  
  // Emitir datos completos del nodo seleccionado
  const nodoData = selectedNodoData.value
  if (nodoData) {
    emit('nodo-selected', {
      id: nodoData.id,
      sector: nodoData.sector,
      nodo: nodoData.nodo,
      nombre_nodo: nodoData.nombre_nodo
    })
  }
}

// Resetear selección
const resetSelection = () => {
  selectedNodo.value = null
  emit('update:modelValue', null)
  emit('nodo-selected', null)
}

// Watch optimizado para sincronizar modelValue con selección interna
watch(() => props.modelValue, (newValue) => {
  selectedNodo.value = newValue
}, { immediate: true })

// Watch para manejar cambios en props.items
watch(() => props.items, (newItems) => {
  if (newItems && newItems.length > 0) {
    nextTick(() => {
      filterNodos('')
    })
  }
}, { immediate: true })

// Cargar nodos al montar el componente
onMounted(() => {
  // Solo busca los nodos si no se le pasaron como prop
  if (!props.items) {
    fetchNodos()
  } else {
    // Si ya tenemos items, inicializar el filtro
    nextTick(() => {
      filterNodos('')
    })
  }
})
</script>

<style scoped>
.nodo-select-container {
  width: 100%;
}

.w-100 {
  width: 100%;
}
</style>