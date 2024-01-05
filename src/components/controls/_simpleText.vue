<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useVuelidate } from '@vuelidate/core'
import { email } from '@vuelidate/validators'
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
})

const value = ref(null);

const validations = computed(() => {
    const valids = {};
    const fv = props.field.validations;
    if (fv && fv.required) valids['required'] = required;
    if (fv && fv.email) valids['email'] = email;
    if (fv && fv.minLength) valids['minLength'] = minLength(fv.minLength);
    if (fv && fv.maxLength) valids['maxLength'] = maxLength(fv.maxLength);
    if (fv && fv.minValue) {
        valids['minValue'] = minValue(
            props.field.type === 'date' ? new Date(fv.minValue) : fv.minValue
        );
    }
    if (fv && fv.maxValue) {
        valids['maxValue'] = maxValue(
            props.field.type === 'date'
                ? new Date(fv.maxValue)
                : props.maxValueOverride !== null ? Number(props.maxValueOverride) : fv.maxValue
        );
    }

    if (props.field.type === 'date' && props.field.adult)
        valids['maxValue'] = maxValue(props.dateopts.maxDate);
    if (props.field.amountField) {
        valids['lookLoanAmount'] = () => {
            return !(
                toRaw(getFields['Loan_Amount'].value) >= 100000 &&
                toRaw(getFields['Loan_Amount'].value) <= 4000000
            );
        };
    }
    if (props.field.type === 'address') {
        valids['address'] = () => {
            return props.rawValue !== 'novalid';
        };
    }
    return { value: valids };
})

const $v = useVuelidate(validations, value)

watch(() => props.val, function(newVal, oldVal) {
    const _value = !newVal && props.field.default ? props.field.default : newVal;
    value.value = _value
    emit('validate', { steps: [route.params.step | route.path] })
},
    { immediate: true }
);

</script>

<script>
import { required } from '@vuelidate/validators'
import axios from 'axios'
import constants from '@/helpers/constants'

export default {
    name: 'simple-text'
}
</script>

<template>
    <input class="input" :class="{ 'is-danger': $v.$anyError }" v-model="value" :placeholder="field.placeholder"
        :disabled="disabled" :type="field.type === 'email' ? 'email' : 'text'"
        :inputmode="field.type === 'tel' ? 'numeric' : ''" v-on:keyup="keypressed" v-on:blur="onchange(value)" ref="input"
        :data-test-id="field.name" />
</template>
