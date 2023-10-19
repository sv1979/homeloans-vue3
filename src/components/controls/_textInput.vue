<script setup>
import { onMounted, computed, reactive, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useVuelidate } from '@vuelidate/core'
import { required } from '@vuelidate/validators'
const emit = defineEmits(['change', 'save', 'validate'])

const props = defineProps({
  field: {
    type: Object,
    default(rawProps) {
      return {}
    }
  },
  val: {
    required: true
  },
  disabled: {
    type: Boolean,
    default: false
  },
  this_field: {
    type: String,
    default: ''
  },
  checkImmediately: {
    type: Boolean,
    default: false
  },
  labelOverride: {
    type: String,
    default: ''
  },
  id: {
    type: String,
    default: ''
  },
  classes: {
    type: String,
    default: ''
  },
  maxValueOverride: {
    type: String,
    default: null
  },
  inputClasses: {
    type: String,
    default: ''
  },
  suffix: {
    type: String,
    default: ''
  },
  resolvePluralLabels: {
    type: Boolean,
    default: false
  }
})
</script>

<script>
export default {
  name: 'text-input'
}
</script>

<template>
  <div>Text {{props.field.name}}</div>
</template>