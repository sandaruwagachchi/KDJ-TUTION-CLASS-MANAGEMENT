<template>
  <q-item
    clickable
    :tag="isInternal ? 'div' : 'a'"
    :target="isInternal ? undefined : '_blank'"
    :href="isInternal ? undefined : props.link"
    :to="isInternal ? props.link : undefined"
  >
    <q-item-section v-if="props.icon" avatar>
      <q-icon :name="props.icon" />
    </q-item-section>

    <q-item-section>
      <q-item-label>{{ props.title }}</q-item-label>
      <q-item-label caption>{{ props.caption }}</q-item-label>
    </q-item-section>
  </q-item>
</template>

<script setup>
const props = defineProps({
  title: {
    type: String,
    required: true,
  },

  caption: {
    type: String,
    default: '',
  },

  link: {
    type: String,
    default: '#',
  },

  icon: {
    type: String,
    default: '',
  },

  isRoute: {
    type: Boolean,
    default: false
  }
})

import { computed } from 'vue'

const isInternal = computed(() => {
  return props.isRoute || props.link.startsWith('/')
})
</script>
