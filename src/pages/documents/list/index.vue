<script setup lang="ts">
import { watchDebounced } from '@vueuse/core';
import { computed, onMounted, ref } from 'vue';
import AddFolderModal from '../components/add-folder-modal.vue';
import RenameFolderModal from '../components/rename-folder-modal.vue';
import DeleteFolderModal from '../components/delete-folder-modal.vue';
import VoidDocumentModal from '../components/void-document-modal.vue';
import SignDocumentModal from '../components/sign-document-modal.vue';
import RejectDocumentModal from '../components/reject-document-modal.vue';
import MoveDocumentModal from '../components/move-document-modal.vue';
import StatusDocumentModal from '../components/status-document-modal.vue';
import HistoryDocumentModal from '../components/history-document-modal.vue';
import { getFoldersApi } from '@/composables/api/folders/get.api';
import { getDocumentsApi, type IDocumentData } from '@/composables/api/documents/get.api';
import { formatDate } from '@/utils/date';
import { useSelectableFolders } from '@/composables/selectable/folders';
import { useAuthStore } from '@/stores/auth.store';
import { otpDocumentApi } from '@/composables/api/documents/otp.api';

const authStore = useAuthStore();
const folderRef = ref<Record<string, any>>({});
const rowMenuRef = ref<Record<string, any>>({});

const filter = ref({
  folder: '',
  status: '',
  search: '',
  tab: 1,
})

const setRowMenuRef = (el: any, folderIndex: number, rowIndex: number) => {
  if (el) {
    const key = `${folderIndex}-${rowIndex}`;
    rowMenuRef.value[key] = el;
  }
};

const toggleMenu = (folderIndex: number, rowIndex: number) => {
  const key = `${folderIndex}-${rowIndex}`;
  rowMenuRef.value[key]?.toggle();
};

const addFolderModalRef = ref()
const addFolder = () => {
  addFolderModalRef.value.toggleModal();
}

const addedFolder = async () => {
  folders.value = (await getFoldersApi()).data
}

const renameFolderModalRef = ref()
const renameFolder = (folderIndex: number, _id: string, name: string) => {
  renameFolderModalRef.value.toggleModal({ _id }, { name });
  folderRef.value[folderIndex].toggle() 
}

const renamedFolder = async () => {
  folders.value = (await getFoldersApi()).data
}

const deleteFolderModalRef = ref()
const deleteFolder = (folderIndex: number, _id: string) => {
  deleteFolderModalRef.value.toggleModal(_id);
  folderRef.value[folderIndex].toggle() 
}

const deletedFolder = async () => {
  folders.value = (await getFoldersApi()).data
}

const folders = ref<{ _id: string, name: string }[]>()
const documents = ref()

const documentsByFolder = computed(() => {
  if (!folders.value || !documents.value) return {};

  const map: Record<string, any[]> = {};

  for (const folder of folders.value) {
    map[folder._id] = documents.value.filter(
      (doc: any) => doc.folder_id === folder._id
    );
  }

  return map;
});

onMounted(async () => {
  folders.value = (await getFoldersApi()).data
  await loadDocuments()
})

watchDebounced(
  () => [filter.value.search, filter.value.folder, filter.value.status, filter.value.tab],
  async () => {
    await loadDocuments()
  },
  { debounce: 500, maxWait: 1000 },
);

const voidDocumentModalRef = ref()
const voidDocument = (folderIndex: number, rowIndex: number, _id: string) => {
  voidDocumentModalRef.value.toggleModal({ _id });
  toggleMenu(folderIndex, rowIndex)
}
const voidedDocument = async () => {
  await loadDocuments()
}

const signDocumentModalRef = ref()
const signDocument = async (_id: string) => {
  signDocumentModalRef.value.toggleModal({ _id });
  await otpDocumentApi(_id)
}
const signedDocument = async () => {
  await loadDocuments()
}

const statusDocumentModalRef = ref()
const statusDocument = (status: string, reason: string, created_at: string, created_by: string) => {
  statusDocumentModalRef.value.toggleModal({ status, reason, created_at, created_by });
}

const historyDocumentModalRef = ref()
const historyDocument = (file_id: string, created_by: string, name: string) => {
  historyDocumentModalRef.value.toggleModal(file_id, created_by, name);
}

const rejectDocumentModalRef = ref()
const rejectDocument = (_id: string) => {
  rejectDocumentModalRef.value.toggleModal({ _id });
}
const rejectedDocument = async () => {
  await loadDocuments()
}

const moveDocumentModalRef = ref()
const moveDocument = (folderIndex: number, rowIndex: number, _id: string) => {
  moveDocumentModalRef.value.toggleModal({ _id });
  toggleMenu(folderIndex, rowIndex)
}
const movedDocument = async () => {
  await loadDocuments()
}

const loadDocuments = async () => {
  documents.value = (await getDocumentsApi({
    search: {
      name: filter.value.search,
      folder: filter.value.folder,
      status: filter.value.status,
      tab: filter.value.tab
    }
  })).data
}

const statusOptions = ref([
  { value: 'awaiting-signature', label: 'awaiting-signature' },
  { value: 'signed', label: 'signed' },
  { value: 'voided', label: 'voided' },
  { value: 'rejected', label: 'rejected' },
]);
const { options: folderOptions } = useSelectableFolders();

const isFolderFiltered = (folder_id: string) => {
  if (!filter.value.folder) {
    return false
  }

  if (filter.value.folder === folder_id) {
    return false
  }

  return true
}

const isShowSignAction = (document: IDocumentData) => {
  if (document.status === 'voided' || document.status === 'rejected') {
    return false
  }

  if (!authStore.authUser) {
    return false
  }
  
  if (!document.approvals?.some((a) => a.user_id === authStore.authUser?._id)) {
    return false
  }

  const hasUnsignedSignature = document.signatures?.some(
    (s) => s.user_id === authStore.authUser?._id && s.signed === false
  );
  
  return !!hasUnsignedSignature
}
</script>

<template>
  <add-folder-modal ref="addFolderModalRef" @added="addedFolder" />
  <rename-folder-modal ref="renameFolderModalRef" @renamed="renamedFolder" />
  <delete-folder-modal ref="deleteFolderModalRef" @deleted="deletedFolder" />
  <void-document-modal ref="voidDocumentModalRef" @voided="voidedDocument" />
  <move-document-modal ref="moveDocumentModalRef" @updated="movedDocument" />
  <sign-document-modal ref="signDocumentModalRef" @signed="signedDocument" />
  <reject-document-modal ref="rejectDocumentModalRef" @rejected="rejectedDocument" />
  <status-document-modal ref="statusDocumentModalRef" />
  <history-document-modal ref="historyDocumentModalRef" />
  <div class="flex flex-col gap-8">
    <div class="flex flex-col gap-4">
      <div class="flex gap-4 justify-between">
        <div class="flex gap-2">
          <base-button @click="filter.tab = 1" shape="sharp" class="font-bold px-4!" :class="{'border-b-2': filter.tab === 1}">
            Dikirim oleh saya
          </base-button>
          <base-button @click="filter.tab = 2" shape="sharp" class="font-bold px-4!" :class="{'border-b-2': filter.tab === 2}">
            Ditugaskan kepada saya
          </base-button>
        </div>
        <div class="flex gap-2" v-if="authStore.authUser?.role?.name === 'admin'">
          <base-button @click="addFolder" color="primary" shape="sharp" class="font-bold px-4!">
            Add Folder
          </base-button>
          <router-link to="/documents/upload">
            <base-button color="primary" shape="sharp" class="font-bold px-4!">
              Upload Document
            </base-button>
          </router-link>
        </div>
      </div>
      <div class="flex w-full gap-2">
        <base-input
          v-model="filter.search"
          placeholder="Search..."
          class="flex-1" 
        />
        <div class="flex gap-2">
          <base-choosen
            title="Folder"
            placeholder="All Folders"
            v-model="filter.folder"
            :options="folderOptions"
          />
          <base-choosen
            title="Status"
            placeholder="Status Documents"
            v-model="filter.status"
            :options="statusOptions"
          />
        </div>
      </div>
    </div>

    <div class="flex flex-col gap-8">
      <template v-for="(folder, folderIndex) in folders">
      <div class="flex flex-col gap-4" v-if="!isFolderFiltered(folder._id)">
        <div class="flex gap-2 items-center">
          <base-icon icon="i-fa7-regular:folder" />
          <p>{{ folder.name }}</p>
          <base-popover placement="bottom" ref="folderRef" v-if="authStore.authUser?.role?.name === 'admin'">
            <base-button @click="folderRef[folderIndex].toggle()">
              <base-icon icon="i-fa7-solid:ellipsis" />
            </base-button>
            <template #content>
              <base-card class="p-0! gap-0! -mt-2" shadow>
                <div class="flex flex-col">
                  <base-button @click="renameFolder(folderIndex, folder._id, folder.name)" variant="text" color="info" class="w-full py-1! px-3! m-0! flex gap-2! items-center justify-start text-left!">
                    <p class="flex-1">Rename</p>
                  </base-button>
                  <base-button @click="deleteFolder(folderIndex, folder._id)" variant="text" color="info" class="w-full py-1! px-3! m-0! flex gap-2! items-center justify-start text-left!">
                    <p class="flex-1">Delete</p>
                  </base-button>
                </div>
              </base-card>
            </template>
          </base-popover>
        </div>
        <base-card title="">
          <base-table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Created By</th>
                <th>Created At</th>
                <th>Status</th>
                <th></th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(document, rowIndex) in documentsByFolder[folder._id]" :key="document._id">
                <td>
                  <router-link :to="`/documents/${document._id}`" class="text-blue-600">{{ document.name }}</router-link>
                </td>
                <td>{{ document.created_by.username }}</td>
                <td>{{ formatDate(document.created_at) }}</td>
                <td>
                  <div v-if="document.status === 'rejected'" @click="statusDocument('Rejected', document.rejected_reason, document.rejected_at, document.rejected_by?.username)" class="cursor-pointer text-blue-600">
                    {{ document.status }}
                  </div>
                  <div v-else-if="document.status === 'voided'" @click="statusDocument('Voided', document.voided_reason, document.voided_at, document.voided_by?.username)" class="cursor-pointer text-blue-600">
                    {{ document.status }}
                  </div>
                  <div v-else>
                    {{ document.status }}
                  </div>
                </td>
                <td>
                  <router-link :to="`/documents/${document._id}/audit`">
                    <base-icon icon="i-fa7-regular:clock" class="cursor-pointer" />
                  </router-link>
                </td>
                <td>
                  <base-button
                    v-if="isShowSignAction(document)"
                    class="px-4! mx-1"
                    variant="filled"
                    color="primary"
                    @click="signDocument(document._id)"
                  >
                    Sign
                  </base-button>

                  <base-button
                    v-if="isShowSignAction(document)"
                    class="px-4! mx-1"
                    variant="filled"
                    color="danger"
                    @click="rejectDocument(document._id)"
                  >
                    Reject
                  </base-button>
                  <base-popover v-if="authStore.authUser?.role?.name === 'admin'" placement="bottom" :ref="(el: unknown) => setRowMenuRef(el, folderIndex, rowIndex)">
                    <base-button @click="toggleMenu(folderIndex, rowIndex)">
                      <base-icon icon="i-fa7-solid:ellipsis" />
                    </base-button>
                    <template #content>
                      <base-card class="p-0! gap-0! -mt-2" shadow>
                        <div class="flex flex-col">
                          <base-button @click="moveDocument(folderIndex, rowIndex, document._id)" variant="text" color="info" class="w-full py-1! px-3! m-0! flex gap-2! items-center justify-start text-left!">
                            <p class="flex-1">Move</p>
                          </base-button>
                          <base-divider orientation="vertical" class="my-0!" />
                          <base-button v-if="document.status === 'pending'" @click="voidDocument(folderIndex, rowIndex, document._id)" variant="text" color="info" class="w-full py-1! px-3! m-0! flex gap-2! items-center justify-start text-left!">
                            <p class="flex-1">Void</p>
                          </base-button>
                        </div>
                      </base-card>
                    </template>
                  </base-popover>
                </td>
              </tr>
            </tbody>
          </base-table>
        </base-card>
      </div>
      </template>
    </div>
  </div>
</template>
