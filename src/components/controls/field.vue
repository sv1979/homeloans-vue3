<template>
    <div v-if="field" class="control-wrap" :class="getWrapperClasses">
        <slot name="label"></slot>
        <slot name="sublabel"></slot>
        <component v-if="compName" :is="compName" :field="field" :val="field.value" :disabled="disabled"
            :this_field="this_field" :checkImmediately="checkImmediately" :labelOverride="labelOverride"
            :maxValueOverride="maxValueOverride" :inputClasses="inputClasses" :resolvePluralLabels="resolvePluralLabels"
            :suffix="field.suffix" :id="id" ref="field" @save="saveField" @change="updateField"
            @placechanged="$emit('placechanged', $event)" @amountchanged="$emit('amountchanged', $event)">
            <slot />
        </component>
    </div>
    <p v-else>No field found with name: {{ field ? field.name : name }}</p>
</template>

<script>
export default {
    name: 'field',
    components: {
        // TextInput,
        // SelectInput,
        // NumberControl,
        // RadioInput,
        // RangeInput,
        // CheckInput,
        // CheckInputMultiple,
        // CodeInput,
        // TooltipLabel,
    },
}
</script>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useApplicationStore } from '@/stores/application'
const { guid, initialLoad, fields, processing, history, steps, activeIndex } = storeToRefs(useApplicationStore())

const props = defineProps({
    name: String,
    this_field: {
      type: String,
      default: ''
    },
    checkImmediately: {
      type: Boolean,
      default: false,
    },
    alwaysSave: {
      type: Boolean,
      default: false,
    },
    skipSave: {
      type: Boolean,
      default: false,
    },
    propField: {
        type: Object,
        default(rawProps) {
            return {}
        }
    },
    disabled: {
      type: Boolean,
      default: false,
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
      default: false,
    }
})

const propFieldRef = ref(props.propField)
const labelOverrideRef = ref(props.labelOverride)

const key = computed(() => {
    return field.name
})

const field = computed(() => {
    let field = propFieldRef
        ? propFieldRef
        : fields && name && fields[this.name]
            ? fields[name]
            : null;
    let cloneField = { ...field };
    if (labelOverrideRef) {
        cloneField.label = labelOverrideRef;
    }
    return cloneField;
})

</script>