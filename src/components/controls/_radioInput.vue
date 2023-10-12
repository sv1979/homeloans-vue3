<script setup>
import { ref, onMounted, computed, reactive, watch, isProxy, toRaw } from 'vue'
import { useRoute } from 'vue-router'
import { useVuelidate } from '@vuelidate/core'
import { minLength, required } from '@vuelidate/validators'
defineEmits(['change', 'save', 'validate'])

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

let fieldValue = reactive(null)
let tooltipActive = reactive(false)

const shellClass = computed(() => {
  const big_buttons_class = props.field.modifier === 'big_buttons'
  const mid_buttons_class = props.field.modifier === 'mid_buttons'
  return {
    big_buttons_shell: big_buttons_class,
    mid_buttons_shell: mid_buttons_class
  }
})

const classObject = computed(() => {
  let string_classes = props.inputClasses,
    obj_classes = {}

  if (string_classes) {
    string_classes = string_classes.split(' ')
    string_classes.map((el) => {
      obj_classes[el] = true
    })
  }
  return {
    ...obj_classes
    // 'is-danger': this.$v.$anyError && this.$v.value.$invalid,
  }
})

const validations = computed(() => {
  const valids = {}
  const fv = props.field.validations
  if (fv && fv.required) valids['required'] = required
  return { value: valids }
})

const updateValue = (newValue) => {
  if (!newValue && props.field.default) {
    fieldValue = props.field.default
  } else {
    fieldValue = newValue
  }
}

watch(fieldValue, (newValue, oldValue) => {
  console.log(newValue, oldValue)
  updateValue(newValue)
})

const $v = useVuelidate(validations, fieldValue)

function onchange(value) {
  emit('change', {
    name: field.name,
    value: fieldValue,
    valid: !$v.$invalid
  })

  if (fieldValue !== null && fieldValue !== '') {
    emit('save', { [field.name]: fieldValue })
    this.$nextTick(() => {
      emit('validate', { steps: [route.params.step] })
    })
  }
}

function getWrapperClassObject(obj) {
  var string_classes = obj.classes,
    obj_classes = {}
  if (string_classes) {
    string_classes = string_classes.split(' ')
    string_classes.map((el) => {
      obj_classes[el] = true
    })
  }
  return {
    ...obj_classes,
    'as-checkboxes': field.modifier && field.modifier === 'radio_as_a_checkbox',
    'is-vertical': field.modifier && field.modifier === 'vertical',
    'big-buttons': field.modifier && field.modifier === 'big_buttons',
    'mid-buttons': field.modifier && field.modifier === 'mid_buttons'
  }
}

function workoutLabel(name, joint_name = '') {
  if (!props.resolvePluralLabels) return name
  return joint_name ? joint_name : name
}
</script>

<script>
import TooltipLabel from '@/components/TooltipLabel.vue'
export default {
  name: 'radio-input',
  components: {
    TooltipLabel
  }
}
</script>

<template>
  <tooltip-label :field="field"></tooltip-label>
</template>