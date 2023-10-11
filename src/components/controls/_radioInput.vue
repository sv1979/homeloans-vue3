<script setup>
import { ref, onMounted, computed, isProxy, toRaw } from 'vue'

const props = defineProps({
  field: {
    type: Object,
    default(rawProps) {
      return {}
    }
  },
  val: {
    required: true,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  this_field: {
    type: String,
    default: '',
  },
  labelOverride: {
    type: String,
    default: '',
  },
  id: {
    type: String,
    default: '',
  },
  classes: {
    type: String,
    default: '',
  },
  inputClasses: {
    type: String,
    default: ""
  },
  resolvePluralLabels: {
    type: Boolean,
    default: false,
  }
})

const shellClass = computed(() => {
  const big_buttons_class = props.field.modifier === 'big_buttons';
  const mid_buttons_class = props.field.modifier === 'mid_buttons';
  return {
    big_buttons_shell: big_buttons_class,
    mid_buttons_shell: mid_buttons_class
  }
})

const classObject = computed(() => {
  let string_classes = props.inputClasses,
    obj_classes = {};

  if (string_classes) {
    string_classes = string_classes.split(" ");
    string_classes.map((el) => {
      obj_classes[el] = true;
    })
  }
  return {
    ...obj_classes,
    // 'is-danger': this.$v.$anyError && this.$v.value.$invalid,
  }
})

</script>

<script>
import TooltipLabel from '@/components/TooltipLabel.vue';
export default {
  name: 'radio-input',
  components: {
    TooltipLabel,
  }
}
</script>

<template>
  <tooltip-label :field="field"></tooltip-label>
</template>