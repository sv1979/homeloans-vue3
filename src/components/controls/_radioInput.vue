<script setup>
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