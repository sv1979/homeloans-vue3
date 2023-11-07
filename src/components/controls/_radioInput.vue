<script setup>
import { onMounted, computed, reactive, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useVuelidate } from '@vuelidate/core'
import { required } from '@vuelidate/validators'
import RadioButton from 'primevue/radiobutton';
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

let fieldValue = reactive(props.val)

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
  console.log(222, newValue, oldValue)
  updateValue(newValue)
})

const $v = useVuelidate(validations, fieldValue)

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
    'as-checkboxes': props.field.modifier && props.field.modifier === 'radio_as_a_checkbox',
    'is-vertical': props.field.modifier && props.field.modifier === 'vertical',
    'big-buttons': props.field.modifier && props.field.modifier === 'big_buttons',
    'mid-buttons': props.field.modifier && props.field.modifier === 'mid_buttons'
  }
}

function workoutLabel(name, joint_name = '') {
  if (!props.resolvePluralLabels) return name
  return joint_name ? joint_name : name
}

function selectValue(event) {
  let value = event
  // if (value.toString() === 'false' | value.toString() === 'true') {
  //   value = value.toString()
  // }
  if (fieldValue !== null && fieldValue !== '') {
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
  name: 'radio-input',
  components: {
    TooltipLabel
  }
}
</script>

<template>
  <div>
    <tooltip-label :field="field"></tooltip-label>
    <slot v-if="field.sublabel"><span class="sublabel" v-html="field.sublabel"></span></slot>
    <div class="radio_button_wrapper mb-1" :class="getWrapperClassObject(field.options[0])">
      <div class="flex gap-3">
        <div class="flex align-items-center" 
          v-for="(option, i) in field.options" :key="`${field.name}-${i}`">

          <RadioButton :inputId="`${field.name}-${option.hasOwnProperty('value') ? option.value.toString() : option}`"
            :class="classObject" 
            v-model="field.value"
            @update:modelValue="selectValue" 
            :disabled="disabled" :name="field.name" 
            :data-test-id="`${field.name}-${option.hasOwnProperty('value') ? option.value.toString() : option}`"
            :value="option.hasOwnProperty('value') ? option.value : option" />

          <label :for="`${field.name}-${option.hasOwnProperty('value') ? option.value.toString() : option}`"
            class="ml-1">{{ workoutLabel(option.name, option.name_joint) }}</label>
        </div>
      </div>
    </div>
  </div>
</template>