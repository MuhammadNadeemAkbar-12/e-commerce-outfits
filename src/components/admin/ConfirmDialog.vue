<template>
  <Teleport to="body">
    <Transition name="backdrop">
      <div v-if="modelValue" class="confirm-backdrop" @click.self="$emit('update:modelValue', false)" />
    </Transition>
    <Transition name="dialog">
      <div v-if="modelValue" class="confirm-wrapper" role="dialog" aria-modal="true">
        <div class="confirm-box">
          <!-- Icon -->
          <div class="confirm-icon" :class="iconClass">
            <q-icon :name="icon" size="28px" />
          </div>

          <!-- Content -->
          <div class="confirm-content">
            <h3 class="confirm-title">{{ title }}</h3>
            <p class="confirm-message">{{ message }}</p>
          </div>

          <!-- Actions -->
          <div class="confirm-actions">
            <button class="btn-cancel" @click="$emit('update:modelValue', false)">
              {{ cancelLabel }}
            </button>
            <button class="btn-confirm" :class="confirmClass" @click="handleConfirm">
              <q-spinner v-if="loading" size="14px" color="white" />
              <span>{{ loading ? 'Please wait...' : confirmLabel }}</span>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  title:       { type: String, default: 'Are you sure?' },
  message:     { type: String, default: 'This action cannot be undone.' },
  confirmLabel:{ type: String, default: 'Confirm' },
  cancelLabel: { type: String, default: 'Cancel' },
  type:        { type: String, default: 'danger' }, // danger | warning | success | info
  loading:     { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue', 'confirm'])

const iconMap = {
  danger:  'warning',
  warning: 'report_problem',
  success: 'check_circle',
  info:    'info',
}

const icon = computed(() => iconMap[props.type] ?? 'warning')

const iconClass = computed(() => ({
  'icon-danger':  props.type === 'danger',
  'icon-warning': props.type === 'warning',
  'icon-success': props.type === 'success',
  'icon-info':    props.type === 'info',
}))

const confirmClass = computed(() => ({
  'btn-danger':  props.type === 'danger',
  'btn-warning': props.type === 'warning',
  'btn-success': props.type === 'success',
  'btn-info':    props.type === 'info',
}))

const handleConfirm = () => {
  emit('confirm')
}
</script>

<style scoped>
.confirm-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.55);
  backdrop-filter: blur(3px);
  z-index: 9998;
}

.confirm-wrapper {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 1rem;
  pointer-events: none;
}

.confirm-box {
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.18);
  padding: 28px 28px 24px;
  width: 100%;
  max-width: 400px;
  pointer-events: all;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* Icon */
.confirm-icon {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.icon-danger  { background: #fee2e2; color: #dc2626; }
.icon-warning { background: #fef3c7; color: #d97706; }
.icon-success { background: #d1fae5; color: #059669; }
.icon-info    { background: #dbeafe; color: #2563eb; }

/* Content */
.confirm-content { display: flex; flex-direction: column; gap: 4px; }
.confirm-title {
  margin: 0;
  font-size: 1.05rem;
  font-weight: 700;
  color: #0f172a;
}
.confirm-message {
  margin: 0;
  font-size: 0.875rem;
  color: #64748b;
  line-height: 1.5;
}

/* Actions */
.confirm-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 4px;
}

.btn-cancel {
  padding: 8px 18px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
  color: #475569;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}
.btn-cancel:hover { background: #f1f5f9; }

.btn-confirm {
  padding: 8px 18px;
  border-radius: 8px;
  border: none;
  color: #fff;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: opacity 0.2s, box-shadow 0.2s;
}
.btn-confirm:hover { opacity: 0.92; }

.btn-danger  { background: linear-gradient(135deg, #ef4444, #dc2626); }
.btn-warning { background: linear-gradient(135deg, #f59e0b, #d97706); }
.btn-success { background: linear-gradient(135deg, #10b981, #059669); }
.btn-info    { background: linear-gradient(135deg, #6366f1, #4f46e5); }

/* Animations */
.backdrop-enter-active, .backdrop-leave-active { transition: opacity 0.2s ease; }
.backdrop-enter-from, .backdrop-leave-to { opacity: 0; }

.dialog-enter-active { transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1); }
.dialog-leave-active { transition: all 0.18s ease; }
.dialog-enter-from  { opacity: 0; transform: scale(0.88) translateY(16px); }
.dialog-leave-to    { opacity: 0; transform: scale(0.94) translateY(8px); }
</style>
