<script setup lang="ts">
import { getDocumentsApi } from '@/composables/api/documents/get.api';
import { useAuthStore } from '@/stores/auth.store';
import { toast } from '@/toast';
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter()
const code = ref()

const authStore = useAuthStore() 

const onClick = async () => {
  const response = await getDocumentsApi({
    search: {
      hash: code.value
    }
  })

  if (response.data.length === 0) {
    toast('dokumen tidak ditemukan', {
      color: 'danger',
    });
    return
  }

  const isIncluded = response.data[0]?.approvals?.some(
    (approval) => approval.user_id === authStore.authUser?._id
  )

  if (isIncluded) {
    router.push('/documents/' + response.data[0]?._id)
    return
  }
   
  router.push('/verification/' + response.data[0]?._id)
}
</script>

<template>
  <div>
    <base-card>
      <div class="flex flex-col gap-2 text-center">
        <p>Masukan kode verifikasi untuk memastikan keaslian dan integritasnya.</p>
        <p>Sistem kami akan memeriksa apakah dokumen ini telah terdaftar dan belum mengalami perubahan sejak ditandatangani.</p>
        <base-input v-model="code" placeholder="Masukan kode verifikasi dokumen" class="my-4" />
        <base-button @click="onClick" variant="filled" color="primary">Verification Document</base-button>
      </div>
    </base-card>
  </div>
</template>
