<template>
    <VCard title="Lista Tramos sin Actualizacion" class="h-100">
        <VTable height="400" fixed-header class="text-no-wrap referral-table">
            <thead>
                <tr>
                    <th scope="col" class="w-50">
                        Ruta
                    </th>
                    <th scope="col">
                        Contrata
                    </th>
                    <th scope="col">
                        Días sin Avance
                    </th>
                    <th scope="col" class="text-end">
                        % Avance
                    </th>
                </tr>
            </thead>

            <tbody class="text-high-emphasis">
                <tr v-for="project in projects" :key="project.id">
                    <td>{{ project.tramo }}</td>
                    <td>
                        <VChip v-if="project.contrata" size="small" color="primary">
                            {{ project.contrata }}
                        </VChip>
                    </td>
                    <td class="text-center">
                        <span :class="getTimeDifference(project.hace).isOver24h ? 'text-error' : ''">
                            {{ getTimeDifference(project.hace).formatted }}
                        </span>
                    </td>
                    <td class="text-end font-weight-medium">{{ parseFloat(project.avance).toFixed(1) }}%</td>
                </tr>
            </tbody>
        </VTable>
    </VCard>
</template>

<script setup>
defineProps({
    projects: {
        type: Array,
        default: () => [],
    },
})

function getTimeDifference(dateString) {
    if (!dateString) {
        return { formatted: 'N/A', isOver24h: false };
    }

    const pastDate = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - pastDate.getTime();

    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInMinutes = Math.floor((diffInMs % (1000 * 60 * 60)) / (1000 * 60));

    const isOver24h = diffInHours >= 24;

    if (diffInHours >= 24) {
        const days = Math.floor(diffInHours / 24);
        const hours = diffInHours % 24;
        return { formatted: `${days}d ${hours}h ${diffInMinutes}m`, isOver24h: true };
    }

    return { formatted: `${diffInHours}h ${diffInMinutes}m`, isOver24h: false };
}


</script>