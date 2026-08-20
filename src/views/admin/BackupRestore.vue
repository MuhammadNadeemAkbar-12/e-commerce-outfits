<template>
  <div class="q-pa-md">
    <div class="row items-center justify-between q-col-gutter-sm q-mb-md">
      <div>
        <div class="text-h5 text-weight-bold">Backup &amp; Restore</div>
        <div class="text-caption text-grey-7">Private application archives. Restoring replaces current application records.</div>
      </div>
      <q-btn color="primary" icon="backup" label="Create Backup" :loading="creating" @click="createBackup" />
    </div>

    <q-banner rounded class="bg-warning text-dark q-mb-md">
      <template #avatar><q-icon name="warning" /></template>
      Restore is destructive. The system validates the archive and creates a pre-restore backup before importing data.
    </q-banner>
    <q-banner v-if="error" rounded class="bg-red-1 text-negative q-mb-md">{{ error }}</q-banner>

    <q-card flat bordered>
      <q-table :rows="backups" :columns="columns" row-key="id" :loading="loading" hide-pagination :rows-per-page-options="[0]">
        <template #body-cell-creator="props"><q-td :props="props">{{ props.row.creator?.name || 'Deleted user / system' }}</q-td></template>
        <template #body-cell-size="props"><q-td :props="props">{{ formatSize(props.value) }}</q-td></template>
        <template #body-cell-checksum="props"><q-td :props="props" class="text-caption" style="max-width: 180px; overflow-wrap: anywhere">{{ props.value || '—' }}</q-td></template>
        <template #body-cell-status="props"><q-td :props="props"><q-badge :color="props.value === 'available' ? 'positive' : 'negative'">{{ props.value }}</q-badge></q-td></template>
        <template #body-cell-created_at="props"><q-td :props="props">{{ formatDate(props.value) }}</q-td></template>
        <template #body-cell-actions="props"><q-td :props="props"><div class="row no-wrap q-gutter-xs">
          <q-btn flat round dense icon="download" color="primary" :disable="props.row.status !== 'available'" @click="download(props.row)" aria-label="Download backup"><q-tooltip>Download</q-tooltip></q-btn>
          <q-btn flat round dense icon="restore" color="warning" :disable="props.row.status !== 'available'" @click="openRestore(props.row)" aria-label="Restore backup"><q-tooltip>Restore</q-tooltip></q-btn>
          <q-btn flat round dense icon="delete" color="negative" @click="remove(props.row)" aria-label="Delete backup"><q-tooltip>Delete</q-tooltip></q-btn>
        </div></q-td></template>
        <template #no-data><div class="full-width row flex-center q-pa-lg text-grey-6">No backups have been created yet.</div></template>
      </q-table>
      <q-separator />
      <q-card-actions align="between"><span class="text-caption text-grey-7">{{ pagination.total }} backup(s)</span><q-pagination v-model="pagination.page" :max="pagination.lastPage" :max-pages="5" direction-links boundary-links @update:model-value="loadBackups" /></q-card-actions>
    </q-card>

    <q-dialog v-model="restoreDialog" persistent>
      <q-card style="min-width: min(500px, 92vw)">
        <q-card-section class="bg-warning text-dark"><div class="text-h6">Restore backup?</div></q-card-section>
        <q-card-section>
          <p class="q-mt-none">You are about to overwrite current application data with <strong>{{ selected?.filename }}</strong>.</p>
          <q-input v-model="confirmation" outlined label="Type RESTORE DATABASE to continue" :rules="[value => value === phrase || 'Exact confirmation phrase required']" />
          <div class="text-caption text-grey-7 q-mt-sm">A protected pre-restore backup is created first. You may need to sign in again if the restored data does not contain your current account.</div>
        </q-card-section>
        <q-card-actions align="right"><q-btn flat label="Cancel" v-close-popup /><q-btn color="negative" label="Restore Now" :disable="confirmation !== phrase" :loading="restoring" @click="restore" /></q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { useQuasar } from 'quasar'
import AdminService from '@/services/adminApi'

const $q = useQuasar()
const backups = ref([])
const loading = ref(false)
const creating = ref(false)
const restoring = ref(false)
const error = ref('')
const selected = ref(null)
const restoreDialog = ref(false)
const confirmation = ref('')
const phrase = 'RESTORE DATABASE'
const pagination = reactive({ page: 1, lastPage: 1, total: 0 })
const columns = [
  { name: 'filename', label: 'Archive', field: 'filename', align: 'left' },
  { name: 'creator', label: 'Created by', field: 'creator', align: 'left' },
  { name: 'created_at', label: 'Created', field: 'created_at', align: 'left' },
  { name: 'size', label: 'Size', field: 'size', align: 'right' },
  { name: 'checksum', label: 'SHA-256', field: 'checksum', align: 'left' },
  { name: 'status', label: 'Status', field: 'status', align: 'left' },
  { name: 'actions', label: 'Actions', field: 'actions', align: 'right' },
]

const loadBackups = async () => {
  loading.value = true; error.value = ''
  const response = await AdminService.listBackups({ page: pagination.page, per_page: 25 })
  if (!response.success) error.value = response.message
  else {
    const page = response.data?.data
    backups.value = page?.data || []
    pagination.page = page?.current_page || 1
    pagination.lastPage = page?.last_page || 1
    pagination.total = page?.total || 0
  }
  loading.value = false
}

const createBackup = async () => {
  creating.value = true; error.value = ''
  const response = await AdminService.createBackup()
  creating.value = false
  if (!response.success) error.value = response.message
  else { $q.notify({ type: 'positive', message: 'Backup created.' }); loadBackups() }
}

const download = async (backup) => {
  const response = await AdminService.downloadBackup(backup.id)
  if (!response.success) { error.value = response.message; return }
  const url = URL.createObjectURL(new Blob([response.data], { type: 'application/zip' }))
  const link = document.createElement('a'); link.href = url; link.download = backup.filename; link.click(); URL.revokeObjectURL(url)
}

const openRestore = (backup) => { selected.value = backup; confirmation.value = ''; restoreDialog.value = true }
const restore = async () => {
  restoring.value = true; error.value = ''
  const response = await AdminService.restoreBackup(selected.value.id, confirmation.value)
  restoring.value = false
  if (!response.success) { error.value = response.message; return }
  restoreDialog.value = false
  $q.notify({ type: 'positive', message: 'Restore completed. A pre-restore backup was created.' })
  loadBackups()
}

const remove = (backup) => {
  $q.dialog({ title: 'Delete backup?', message: `Delete ${backup.filename}? This cannot be undone.`, cancel: true, persistent: true })
    .onOk(async () => { const response = await AdminService.deleteBackup(backup.id); if (!response.success) error.value = response.message; else { $q.notify({ type: 'positive', message: 'Backup deleted.' }); loadBackups() } })
}
const formatDate = (value) => value ? new Date(value).toLocaleString() : '—'
const formatSize = (bytes) => bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / (1024 * 1024)).toFixed(2)} MB`
onMounted(loadBackups)
</script>
