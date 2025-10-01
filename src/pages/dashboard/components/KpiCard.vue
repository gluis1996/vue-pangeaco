<template>
  <VCard>
    <VCardText>
      <div class="d-flex justify-space-between">
        <div class="d-flex flex-column">
          <p class="mb-1">
            {{ title }}
          </p>
          <h4 class="text-h4 mb-1">
            {{ value }}
          </h4>
        </div>
        <VAvatar
          :icon="icon"
          :color="color"
          variant="tonal"
          size="42"
        />
      </div>
    </VCardText>
  </VCard>
</template>

<script setup>
defineProps({
  title: { type: String, required: true },
  value: { type: [String, Number], required: true },
  icon: { type: String, required: true },
  color: { type: String, default: 'primary' },
})
</script>