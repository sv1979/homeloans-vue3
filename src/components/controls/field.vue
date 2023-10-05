<template>
  <div v-if="fieldInstance" class="control-wrap" :class="getWrapperClasses">
    www
    <slot name="label"></slot>
    <slot name="sublabel"></slot>
    <component
      v-if="compName"
      :is="compName"
      :field="fieldInstance"
      :val="fieldInstance.value"
      :disabled="disabled"
      :this_field="this_field"
      :checkImmediately="checkImmediately"
      :labelOverride="labelOverride"
      :maxValueOverride="maxValueOverride"
      :inputClasses="inputClasses"
      :resolvePluralLabels="resolvePluralLabels"
      :suffix="fieldInstance.suffix"
      :id="id"
      ref="field"
      @save="saveField"
      @change="updateField"
      @placechanged="$emit('placechanged', $event)"
      @amountchanged="$emit('amountchanged', $event)"
    >
      <slot />
    </component>
  </div>
  <p v-else>No field found with name: {{ fieldInstance ? fieldInstance.name : name }}</p>
</template>

<script>
export default {
  name: 'field',
  components: {
    // TextInput,
    // SelectInput,
    // NumberControl,
    // RadioInput,
    // RangeInput,
    // CheckInput,
    // CheckInputMultiple,
    // CodeInput,
    // TooltipLabel,
  }
}
</script>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { storeToRefs } from 'pinia'
import commonMixin from '@/helpers/commonMixin'
import { useApplicationStore } from '@/stores/application'
const { guid, initialLoad, fields, processing, history, steps, activeIndex, lookup } = storeToRefs(
  useApplicationStore()
)

const emits = defineEmits(['change', 'delete'])

const props = defineProps({
  name: String,
  this_field: {
    type: String,
    default: ''
  },
  checkImmediately: {
    type: Boolean,
    default: false
  },
  alwaysSave: {
    type: Boolean,
    default: false
  },
  skipSave: {
    type: Boolean,
    default: false
  },
  propField: {
    type: Object,
    default(rawProps) {
      return {}
    }
  },
  disabled: {
    type: Boolean,
    default: false
  },
  labelOverride: {
    type: String,
    default: ''
  },
  maxValueOverride: {
    type: String,
    default: null
  },
  id: {
    type: String,
    default: ''
  },
  inputClasses: {
    type: String,
    default: ''
  },
  wrapperClasses: {
    type: String,
    default: ''
  },
  resolvePluralLabels: {
    type: Boolean,
    default: false
  }
})

const propFieldRef = ref(props.propField)
const labelOverrideRef = ref(props.labelOverride)
const nameRef = ref(props.name)

const key = computed(() => {
  return fieldInstance.name
})

const fieldInstance = computed(() => {
  if (!commonMixin.isObjectEmpty(propFieldRef.value)) {
    return propFieldRef.value
  }
  if (fields.value && nameRef.value && fields.value[nameRef.value]) {
    let cloneField = { ...fields.value[nameRef.value] }
    if (labelOverrideRef) {
      cloneField.label = labelOverrideRef
    }
    return cloneField
  }
})

const canSave = computed(() => {
  return fields.value.Accepted_Privacy_Declaration.value
})

const compName = computed(() => {
  if (!fieldInstance) return null
  const fieldType = fieldInstance.value.type
  const textInputTypes = [
    'text',
    'number',
    'date',
    'address',
    'currency',
    'email',
    'tel',
    'autocomplete',
    'textarea',
    'addressright'
  ]
  if (textInputTypes.includes(fieldType)) {
    return 'text-input'
  }
  if (fieldType === 'label') {
    return 'tooltip-label'
  }
  if (fieldType === 'select') {
    return 'select-input'
  }
  if (fieldType === 'number-control') {
    return 'number-control'
  }
  if (fieldType === 'range') {
    return 'range-input'
  }
  if (fieldType === 'radio') {
    return 'radio-input'
  }
  if (fieldType === 'checkboxMultiple') {
    return 'check-input-multiple'
  }
  if (fieldType === 'checkbox') {
    return 'check-input'
  }
  if (fieldType === 'code') {
    return 'code-input'
  }
  return null
})

function updateField(ev) {
  if (!fieldInstance.value.partOfGroup)
    {this.$store.commit('setFields', { [ev.name]: ev.value });}
  if (ev.name === 'Loan_Interest_Rate') {
    const selectedRate = this.field.options.find((o) => o.value === ev.value);
    if (selectedRate && selectedRate.id) {
      this.$store.commit('setFields', { ['InterestRateId']: selectedRate.id });
    }
  }
  this.$emit('change', ev);
}


</script>