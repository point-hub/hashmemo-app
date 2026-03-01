<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

import { findDocumentApi } from '@/composables/api/documents/find-by-id.api';

import CardBreadcrumbs from './card-breadcrumbs.vue';
import CardTable from './card-table.vue';

const route = useRoute();
const document = ref();

onMounted(async () => {
  const response = await findDocumentApi(route.params.id as string);

  document.value = response;
});
</script>

<template>
  <div class="content-container">
    <card-breadcrumbs :document_identifier="`${document?.code} - ${document?.name}`" />
    <card-table />
  </div>
</template>
