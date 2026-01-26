<script setup lang="ts">
import { onBeforeUnmount,onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { verifyPhotoApi } from '@/composables/api/master/auth/verify-photo.api';
import { getUsersApi } from '@/composables/api/master/users/get.api';
import { toast } from '@/toast';
import { apiRequest, handleError } from '@/utils/api';

const route = useRoute();
const router = useRouter();

const emit = defineEmits<{
  (e: 'capture', blob: Blob): void
}>();

const video = ref<HTMLVideoElement | null>(null);
const canvas = ref<HTMLCanvasElement | null>(null);
const previewUrl = ref<string | null>(null);
const blob = ref<Blob | null>(null);

let stream: MediaStream | null = null;

const startCamera = async () => {
  stream = await navigator.mediaDevices.getUserMedia({
    video: { facingMode: 'environment' },
  });
  if (video.value) video.value.srcObject = stream;
};

const stopCamera = () => {
  stream?.getTracks().forEach(t => t.stop());
  stream = null;
};

const capture = () => {
  if (!video.value || !canvas.value) return;

  canvas.value.width = video.value.videoWidth;
  canvas.value.height = video.value.videoHeight;

  const ctx = canvas.value.getContext('2d')!;
  ctx.drawImage(video.value, 0, 0);

  canvas.value.toBlob(b => {
    if (!b) return;

    blob.value = b;
    previewUrl.value = URL.createObjectURL(b);

    emit('capture', b);
    stopCamera();
  }, 'image/jpeg', 0.9);
};

const retake = async () => {
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value);
  previewUrl.value = null;
  blob.value = null;
  await startCamera();
};

onBeforeUnmount(() => {
  stopCamera();
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value);
});

const isPhotoDone = ref(false);
const isAccept = ref(false);
const photo_url = ref();

const onNext = async () => {
  isPhotoDone.value = true;
};

const code = ref();
const isCodeExists = ref(false);
const getUsers = async () => {
  const response = await getUsersApi({
    search: {
      'photo_code': code.value,
    },
  });

  if (!response.data[0]) {
    return;
  }

  isCodeExists.value = true;
};

onMounted(async () => {
  startCamera();
  code.value = route.query.code;
  await getUsers();
});

function getExtensionFromBlob(blob: Blob): string {
  const mimeToExt: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'gif',
  };
  return mimeToExt[blob.type] || '';
}

const onUpload = async () => {
  if (!blob.value) {
    return;
  }

  const response = await apiRequest.post('/v1/storages/presign-upload', {
    type: blob.value.type,
    size: blob.value.size,
    ext: getExtensionFromBlob(blob.value),
  });

  photo_url.value = `${response.data.public_domain}${response.data.public_path}`;

  await fetch(response.data.upload_url, {
    method: 'PUT',
    body: blob.value,
    headers: {
      'Content-Type': blob.value.type,
    },
  });
  console.log(4);
};

const onSubmit = async () => {
  try {
    if (!isAccept.value) {
      return toast('Please accept the Privacy Policy and Terms & Conditions.', { color: 'danger' });
    }

    await onUpload();

    if (!photo_url.value) {
      return toast('Please take a photo.', { color: 'danger' });
    }

    await verifyPhotoApi({
      code: code.value,
      photo_url: photo_url.value,
    });

    await router.push('/signin');
  } catch (error) {
    const errorResponse = handleError(error);
    if (errorResponse.message) {
      toast(errorResponse.message, {
        lists: errorResponse.lists,
        color: 'danger',
      });
    }
  }
};
</script>

<template>
  <base-card class="max-w-xl">
    <form @submit.prevent="onSubmit" class="flex flex-col gap-8" v-if="isCodeExists">
      <div v-if="!isPhotoDone" class="flex flex-col gap-8">
        <div class="flex flex-col">
          <!-- LIVE CAMERA -->
          <video
            v-if="!previewUrl"
            ref="video"
            autoplay
            playsinline
            class="mirror"
          />

          <!-- PREVIEW -->
          <img v-else :src="previewUrl" />

          <!-- ACTIONS -->
          <div class="mt-4 flex items-center justify-center">
            <base-button class="w-full" color="primary" v-if="!previewUrl" @click="capture">Capture</base-button>
            <base-button class="w-full" color="danger" v-else @click="retake">Retake</base-button>
          </div>

          <canvas ref="canvas" class="hidden" />
        </div>
        <base-button v-if="previewUrl" @click="onNext()" type="button" color="primary">Next</base-button>
      </div>
      <div v-if="isPhotoDone" class="flex flex-col gap-4">
        <h1 class="text-2xl">Privacy Policy & Terms Condition</h1>
        <div class="flex flex-col gap-2">
          <h2 class="text-lg">1. PENGANTAR</h2>
          <p>Hash Sign (“Kami”) menghargai dan melindungi privasi pengguna kami. Kebijakan Privasi ini menjelaskan bagaimana kami mengumpulkan, menggunakan, menyimpan, dan melindungi informasi pribadi yang Anda berikan saat menggunakan layanan kami, termasuk layanan tanda tangan elektronik yang disediakan melalui platform Hash Sign (“Layanan”).</p>
          <p>Dengan menggunakan layanan kami, Anda menyetujui pengumpulan dan penggunaan data sesuai dengan Kebijakan ini.</p>
        </div>
        <div class="flex flex-col gap-2">
          <h2 class="text-lg">2. DATA YANG KAMI KUMPULKAN</h2>

          <p>Kami dapat mengumpulkan informasi berikut:</p>

          <p>a. Informasi Identitas</p>
          <ul class="pl-4">
            <li>- Nama lengkap</li>
            <li>- Nomor Induk Kependudukan (NIK)</li>
            <li>- Tanggal lahir</li>
            <li>- Alamat email</li>
            <li>- Nomor telepon</li>
            <li>- Dokumen identitas (misalnya: KTP, NPWP)</li>
            <li>- Foto/selfie untuk verifikasi identitas</li>
          </ul>

          <p>b. Informasi Teknis</p>
          <ul class="pl-4">
            <li>- Alamat IP</li>
            <li>- Informasi perangkat (browser, sistem operasi)</li>
            <li>- Waktu akses dan aktivitas pengguna</li>
          </ul>

          <p>c. Informasi Tanda Tangan Elektronik</p>
          <ul class="pl-4">
            <li>- Hash dokumen</li>
            <li>- Tanda tangan digital (hasil enkripsi hash)</li>
            <li>- Public key (kunci publik)</li>
            <li>- Waktu & lokasi penandatanganan</li>
          </ul>
        </div>
        <div class="flex items-center">
          <base-checkbox v-model="isAccept"></base-checkbox> Saya Menyetujui Privacy Policy & Terms Condition pada Hash Memo
        </div>
        <base-button v-if="previewUrl" type="submit" color="primary">Activate Sign Feature</base-button>
      </div>
    </form>
    <div v-else>
      Request invalid
    </div>
  </base-card>
</template>
