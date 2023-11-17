<script setup>
import { onMounted, computed, reactive, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useVuelidate } from '@vuelidate/core'
import { required } from '@vuelidate/validators'
import Slider from 'primevue/slider'
import InputNumber from 'primevue/inputnumber'
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

const validations = computed(() => {
  const valids = {}
  const fv = props.field.validations
  if (fv && fv.required) valids['required'] = required
  return { value: valids }
})

const getSuffix = computed(() => {
  return ' ' + pluralise(props.field.settings?.measure, props.field.value)
})

const maxLabel = computed(() => {
  const measure = props.field.settings?.measure
  const max = props.field.settings?.max
  return `${max} ${pluralise(measure, max)} max`
})

const minLabel = computed(() => {
  const measure = props.field.settings?.measure
  const min = props.field.settings?.min
  return `${min} ${pluralise(measure, min)} min`
})

function pluralise(label, value) {
  return label ? `${label}${value > 1 ? 's' : ''}`: ''
}

const $v = useVuelidate(validations, props.field.value)

function selectValue(event) {
  let value = event
  if (props.field.value !== null && props.field.value !== '') {
    emit('change', {
      name: props.field.name,
      value: value,
      valid: !$v.$invalid
    })
    emit('save', { [props.field.name]: value })
    emit('validate', { steps: [route.params.step] })
  }
}
</script>

<script>
import TooltipLabel from '@/components/TooltipLabel.vue'
export default {
  name: 'range-input',
  components: {
    TooltipLabel
  }
}
</script>

<template>
  <div>
    <tooltip-label :field="field"></tooltip-label>
    <slot v-if="field.sublabel"><span class="sublabel" v-html="field.sublabel"></span></slot>

    <div class="card flex flex-column justify-content-center">
      <InputNumber
        v-model.number="field.value"
        :disabled="disabled"
        :name="field.name"
        :data-test-id="field.name"
        :suffix="getSuffix"
        :max="field.settings.max"
        :min="field.settings.min"
        @update:modelValue="selectValue"
      />
      <Slider
        v-model="field.value"
        :disabled="disabled"
        :name="field.name"
        :max="field.settings.max"
        :min="field.settings.min"
        @update:modelValue="selectValue"
      />
      <div class="slider-message" v:if="field.settings.measure">
        <span class="slider-message">
          {{ minLabel }}
        </span>
        <span class="slider-message slider-message-right">
          {{ maxLabel }}
        </span>
      </div>
    </div>
  </div>
</template>