<script setup>
import { ref, computed } from 'vue'
import { useTippy } from 'vue-tippy'

const props = defineProps({
    field: {
        type: Object,
        default(rawProps) {
            return {}
        }
    },
    bottom: {
        type: Boolean,
        default: false
    },
    classes: {
      type: String,
      default: '',
      required: false
    }
})

const button = ref()

const tooltipObject = computed(() => {
    const tooltip = props.field && props.field.tooltip ? props.field.tooltip : null;
    return tooltip;
})

const labelObject = computed(() => {
    const label = props.field && props.field.label ? props.field.label : null;
    return label;
})

useTippy(button, {
    theme: 'heartland',
    content: tooltipObject,
    allowHTML: true,
    placement: props.bottom ? 'bottom' : 'top'
})

</script>

<template>
    <label class="label" :class="classes" v-if="labelObject || tooltipObject">
        <slot>
            <span v-if="!!labelObject" v-html="labelObject"></span>
        </slot>
        <button v-if="!!tooltipObject" ref="button" class="tool"></button>
    </label>
</template>

<style scoped>
    .label {
        margin-bottom: 0.3rem;
    }
</style>