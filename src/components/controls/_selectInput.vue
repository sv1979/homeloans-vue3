<script setup>
import { onMounted, computed, ref, watch, toRaw } from 'vue'
import { useRoute } from 'vue-router'
import { useVuelidate } from '@vuelidate/core'
import { required } from '@vuelidate/validators'
import Dropdown from 'primevue/dropdown';
import { useApplicationStore } from '@/stores/application'
const { getFields, setFields, saveFields } = useApplicationStore()
const emit = defineEmits(['change', 'save', 'validate'])

const route = useRoute()
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
  inputClasses: {
    type: String,
    default: ''
  },
  resolvePluralLabels: {
    type: Boolean,
    default: false
  }
})

let fieldValue = ref(props.val)

const validations = computed(() => {
  const valids = {}
  const fv = props.field.validations
  if (fv && fv.required) valids['required'] = required
  if (props.field.nullable) {
    valids['nullable'] = () => {
      return this.value !== '-';
    };
  }
  return { value: valids }
})

const getSelectedOptionById = (id) => {
  return props.field.options.find((option) => option.id === id)
}

const getSelectedOptionByValue = (v) => {
  return props.field.options.find((option) => option.value === v)
}

onMounted(() => {
  if (props.field.name === 'Loan_Interest_Rate') {
    const initialValue = getFields['InterestRateId'].value
    const options = props.field.options

    if (initialValue && options.length) {
      const preselected = toRaw(getSelectedOptionById(initialValue))
      if (preselected && preselected.value) {
        fieldValue = preselected
        selectValue({ value: preselected.value })
      }
    }
  }
});

const $v = useVuelidate(validations, fieldValue)

function selectValue(event) {
  let value;
  if (typeof event !== 'string') {
    value = event.value || toRaw(event).value
  } else {
    value = event
  }

  if (fieldValue !== null && fieldValue !== '') {
    emit('change', {
      name: props.field.name,
      value: value,
      valid: !$v.$invalid
    })
    emit('save', { [props.field.name]: value })
    emit('validate', { steps: [route.params.step] })
  }

  if (props.field.name === 'Loan_Interest_Rate') {
    const selectedRate = fieldValue.value ? fieldValue.value : toRaw(getSelectedOptionByValue(fieldValue)).value
    const options = props.field.options
    if (selectedRate && options.length) {
      const preselected = toRaw(props.field.options.find((option) => option.value === selectedRate))
      if (preselected && preselected.value) {
        emit('change', {
          name: 'InterestRateId',
          value: preselected.id
        })
        emit('save', { 'InterestRateId': preselected.id })
      }
    }
  }
}
</script>

<script>
import TooltipLabel from '@/components/TooltipLabel.vue'
export default {
  name: 'select-input',
  components: {
    TooltipLabel
  }
}
</script>

<template>
  <div>
    <tooltip-label :field="field"></tooltip-label>
    <slot v-if="field.sublabel"><span class="sublabel" v-html="field.sublabel"></span></slot>
    <Dropdown v-model="fieldValue" :options="field.options" optionLabel="name" optionValue="value"
      @update:modelValue="selectValue" :placeholder="field.placeholder" class="" />
  </div>
</template>