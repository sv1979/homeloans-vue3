<script setup>
import { onMounted, computed, reactive, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useVuelidate } from '@vuelidate/core'
import { required } from '@vuelidate/validators'
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

function onChange(event) {
  const value = event.target.value
  console.log(111, value)
  if (value && fieldValue !== null && fieldValue !== '') {
    emit('change', {
      name: props.field.name,
      value: value,
      valid: !$v.$invalid
    })
    emit('save', { [props.field.name]: value })
    emit('validate', { steps: [route.params.step] })
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
    <div :class="shellClass">
      <div class="radio_button_wrapper" v-for="(option, i) in field.options" :key="`${field.name}-${i}`"
        :class="getWrapperClassObject(option)">

        <input type="radio" v-model="fieldValue" :class="classObject" :disabled="disabled" :name="field.name"
          :value="option.hasOwnProperty('value') ? option.value : option"
          :id="`${field.name}-${option.hasOwnProperty('value') ? option.value.toString() : option}`"
          :data-test-id="`${field.name}-${option.hasOwnProperty('value') ? option.value.toString() : option}`"
          @change="onChange($event)" />
        <label :for="`${field.name}-${option.hasOwnProperty('value') ? option.value.toString() : option}`">
          <span v-if="field.modifier && field.modifier === 'big_buttons'">
            <span class="big_button_title button_title">{{ option.hasOwnProperty('name') ? option.name : option }}</span>
            <span class="big_button_description">{{ option.hasOwnProperty('description') ? option.description : '' }}</span>
            <span class="checkmark"> </span>
          </span>
          <span v-else-if="field.modifier && field.modifier === 'mid_buttons'">
            <span class="mid_button_title button_title">{{ option.hasOwnProperty('name') ? option.name : option }}</span>
            <span class="checkmark"> </span>
          </span>
          <span v-else>
            {{ option.hasOwnProperty('name') ? workoutLabel(option.name, option.name_joint) : workoutLabel(option) }}
          </span>
        </label>
      </div>
    </div>
  </div>
</template>