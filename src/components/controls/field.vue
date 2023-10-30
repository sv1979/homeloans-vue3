<template>
  <div>
    <div v-if="field" class="control-wrap" :class="getWrapperClasses">
      <slot name="label"></slot>
      <slot name="sublabel"></slot>
      <component
        v-if="componentName"
        :is="componentName"
        :field="field"
        :val="field.value"
        :disabled="disabled"
        :this_field="this_field"
        :checkImmediately="checkImmediately"
        :labelOverride="labelOverride"
        :maxValueOverride="maxValueOverride"
        :inputClasses="inputClasses"
        :resolvePluralLabels="resolvePluralLabels"
        :suffix="field.suffix"
        :id="id"
        ref="fieldref"
        @save="saveField"
        @change="updateField"
        @placechanged="$emit('placechanged', $event)"
        @amountchanged="$emit('amountchanged', $event)"
      >
        <slot />
      </component>
    </div>
    <p v-else>No field found with name: {{ field ? field.fieldName : fieldName }}</p>
  </div>
</template>

<script>
import RadioInput from '@/components/controls/_radioInput.vue'
import TextInput from '@/components/controls/_textInput.vue'
export default {
  name: 'field',
  components: {
    TextInput,
    // SelectInput,
    // NumberControl,
    RadioInput
    // RangeInput,
    // CheckInput,
    // CheckInputMultiple,
    // CodeInput,
    // TooltipLabel,
  }
}
</script>

<script setup>
import { ref, onMounted, computed, isProxy, toRaw } from 'vue'
import { storeToRefs } from 'pinia'
import commonMixin from '@/helpers/commonMixin'
import { useApplicationStore } from '@/stores/application'
import constants from '@/helpers/constants'
const emit = defineEmits(['change', 'saveFields'])

const { guid, initialLoad, fields, processing, history, steps, activeIndex } = storeToRefs(
  useApplicationStore()
)
const { getFields, setFields, saveFields } = useApplicationStore()

const props = defineProps({
  fieldName: String,
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
const fieldref = ref(null)

const key = computed(() => {
  return field.fieldName
})

const field = computed(() => {
  // const fieldsObj = toRaw(getFields)
  // let cloneField
  // if (commonMixin.isObjectNonEmpty(toRaw(propFieldRef.value))) {
  //   cloneField = propFieldRef.value
  // } else {
  //   cloneField = !!fieldsObj[props.fieldName] ? toRaw(fieldsObj[props.fieldName]) : null
  // }
  // if (labelOverrideRef.value && cloneField) {
  //   cloneField.label = labelOverrideRef
  // }
  // return { ...cloneField }
  console.log(props.fieldName)
  return getFields[props.fieldName]
})

const canSave = computed(() => {
  return toRaw(getFields['Accepted_Privacy_Declaration'].value)
})

const componentName = computed({
  get() {
    const fieldRaw = toRaw(field.value)
    if (commonMixin.isObjectEmpty(fieldRaw)) {
      return null
    }
    if (constants.TEXT_INPUT_FIELDS.includes(fieldRaw.type)) {
      return 'text-input'
    }
    switch (fieldRaw.type) {
      case 'label':
        return 'tooltip-label'
        break
      case 'number-control':
        return 'number-control'
        break
      case 'radio':
        return 'radio-input'
        break
      case 'range':
        return 'range-input'
        break
      case 'checkboxMultiple':
        return 'check-input-multiple'
        break
      case 'checkbox':
        return 'check-input'
        break
      case 'code':
        return 'code-input'
        break
      default:
        return null
    }
  }
})

const getWrapperClasses = computed(() => {
  return (
    props.wrapperClasses + ` field-${field.value.type}` + ` ${props.disabled ? 'field_is_disabled' : ''}`
  )
})

function updateField(ev) {
  if (!field.partOfGroup) {
    setFields({ [ev.name]: ev.value })
  }
  // this.$store.commit('setFields', { [ev.name]: ev.value })
  // if (ev.name === 'Loan_Interest_Rate') {
  //   const selectedRate = this.field.options.find((o) => o.value === ev.value)
  //   if (selectedRate && selectedRate.id) {
  //     this.$store.commit('setFields', { ['InterestRateId']: selectedRate.id })
  //   }
  // }
  emit('change', ev)
}

function saveField(ev) {
  if (props.alwaysSave || (canSave.value && !field.partOfGroup && !props.skipSave)) {
    saveFields()
  }
}
</script>