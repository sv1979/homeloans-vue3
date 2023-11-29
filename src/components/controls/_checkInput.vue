<script setup>
import { onMounted, computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useVuelidate } from '@vuelidate/core'
import { required } from '@vuelidate/validators'
import Checkbox from 'primevue/checkbox';
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

// const classObject = computed(() => {
//   let string_classes = props.inputClasses,
//     obj_classes = {}

//   if (string_classes) {
//     string_classes = string_classes.split(' ')
//     string_classes.map((el) => {
//       obj_classes[el] = true
//     })
//   }
//   return {
//     ...obj_classes
//     // 'is-danger': this.$v.$anyError && this.$v.value.$invalid,
//   }
// })

const validations = computed(() => {
  const valids = {}
  const fv = props.field.validations
  if (fv && fv.required) valids['required'] = required
  return { value: valids }
})

const $v = useVuelidate(validations, fieldValue)

function selectValue(event) {
  let value = event

  if (fieldValue !== null && fieldValue !== '') {
    emit('change', {
      name: props.field.name,
      value: props.field.reversed ? !value : value,
      valid: !$v.$invalid
    })
    emit('save', { [props.field.name]: props.field.reversed ? !value : value })
    emit('validate', { steps: [route.params.step] })
  }
}

function checkboxInput(event) {
  // console.log(44, event)
}

onMounted(() => {
  if (props.field.reversed) {
    fieldValue.value = !fieldValue.value
  }
});

</script>

<script>
import TooltipLabel from '@/components/TooltipLabel.vue'
export default {
  name: 'check-input',
  components: {
    TooltipLabel
  }
}
</script>

<template>
  <div>
    <slot v-if="field.sublabel"><span class="sublabel" v-html="field.sublabel"></span></slot>
    <label v-if="field.label" class="checkbox_wrapper mb-1">
      <Checkbox 
        unstyled
        :class="classObject" 
        v-model="fieldValue"
        :modelValue="fieldValue"
        @update:modelValue="selectValue" 
        :disabled="disabled" 
        :data-test-id="`${field.name}`"
        :name="`${field.name}`"
        :binary="true" 
        />
      <span class="check" :class="{checked: fieldValue}"></span>  
      <span :for="`${field.name}`" class="check_label">{{field.label}}</span>  
    </label>

    <Checkbox v-if="!field.label"
        unstyled
        :class="classObject" 
        v-model="fieldValue"
        :modelValue="fieldValue"
        @update:modelValue="selectValue" 
        :disabled="disabled" 
        :data-test-id="`${field.name}`"
        :name="`${field.name}`"
        :binary="true" 
        v-on:input="checkboxInput"
    />
  </div>
  <span v-if="!field.label" class="check" :class="{checked: fieldValue}"></span>  
</template>