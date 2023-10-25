<script setup>
import { computed, ref } from 'vue'
import { useVuelidate } from '@vuelidate/core'
import { useApplicationStore } from '@/stores/application'
import { useDebounceFn } from "@vueuse/core"
const { getFields, setFields, saveFields } = useApplicationStore()
const emit = defineEmits(['change', 'save', 'validate'])

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

const searchUrl = ref('')

const value = ref(null);
const addressRightValue = ref('');
const addressRightSuggestions = ref([]);

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
                : props.maxValueOverride !== null ? Number(this.maxValueOverride) : fv.maxValue
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

const getAddressDataDebounced = useDebounceFn(() => {
    axios(searchUrl.value).then((data) => {
        if (data.data.length > 0) {
            addressRightSuggestions.value = [];
            data.data.map((el) => {
                addressRightSuggestions.value.push(el);
            });
        }
    });
}, 1000, { maxWait: 5000 })

function getAddressRightData(event) {
    const searchTerm = event.target.value;
    searchUrl.value = `${constants.URLS.ADDRESSRIGHT_API_CALL}${searchTerm}`;
    getAddressDataDebounced()
}

function setAutocompleteValue() {
    if (addressRightValue.value && addressRightValue.value.label) {
        setFields({ [props.field.name]: addressRightValue.value.label })
        saveFields()
    } else {
        addressRightValue.value = props.field.value
    }

    if (props.field.corresponding_field) {
        if (addressRightValue.value && addressRightValue.value.id) {
            emit('placechanged', addressRightValue.value.label)
            setFields({ [props.field.corresponding_field]: addressRightValue.value.id })
            saveFields()
        } else {
            setFields({ [props.field.corresponding_field]: '' })
            saveFields();
        }
    }
}
</script>

<script>
import { required } from '@vuelidate/validators'
import axios from 'axios'
import constants from '@/helpers/constants'

export default {
    name: 'autocomplete-input',
}

</script>

<template>
    <v-autocomplete variant="solo" :class="{ 'autocomplete_input': true, 'is-danger': $v.$anyError }"
        v-model="addressRightValue" ref="autocomplete" max-height="172" :this_field="this_field"
        v-on:input="getAddressRightData" :items="addressRightSuggestions" return-object required item-title="label"
        :placeholder="field.placeholder" @update:modelValue="setAutocompleteValue" :disabled="disabled"
        :data-test-id="field.name" name="field.name">
    </v-autocomplete>
</template>
