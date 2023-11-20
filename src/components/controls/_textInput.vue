<script setup>
import { computed, reactive, ref, toRaw } from 'vue'
import { useVuelidate } from '@vuelidate/core'
import { required, email, minLength, maxLength, minValue, maxValue } from '@vuelidate/validators'
import { useApplicationStore } from '@/stores/application'
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
  checkImmediately: {
    type: Boolean,
    default: false
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
  maxValueOverride: {
    type: String,
    default: null
  },
  inputClasses: {
    type: String,
    default: ''
  },
  suffix: {
    type: String,
    default: ''
  },
  resolvePluralLabels: {
    type: Boolean,
    default: false
  }
})

const value = ref(null)
const rawValue = ref('')
const dateops = reactive({
  minYear: null,
  maxDate: null,
  focused: null
})

const validations = computed(() => {
  const valids = {}
  const fv = toRaw(props.field.validations)

  if (fv && fv.required) valids['required'] = required
  if (fv && fv.email) valids['email'] = email
  if (fv && fv.minLength) valids['minLength'] = minLength(fv.minLength)
  if (fv && fv.maxLength) valids['maxLength'] = maxLength(fv.maxLength)
  if (fv && fv.minValue) {
    valids['minValue'] = minValue(props.field.type === 'date' ? new Date(fv.minValue) : fv.minValue)
  }
  if (fv && fv.maxValue) {
    valids['maxValue'] = maxValue(
      props.field.type === 'date'
        ? new Date(fv.maxValue)
        : props.maxValueOverride !== null
        ? Number(this.maxValueOverride)
        : fv.maxValue
    )
  }

  if (props.field.type === 'date' && props.field.adult)
    valids['maxValue'] = maxValue(props.dateopts.maxDate)
  if (props.field.amountField) {
    valids['lookLoanAmount'] = () => {
      return !(
        toRaw(getFields['Loan_Amount'].value) >= 100000 &&
        toRaw(getFields['Loan_Amount'].value) <= 4000000
      )
    }
  }
  if (props.field.type === 'address') {
    valids['address'] = () => {
      return props.rawValue !== 'novalid'
    }
  }
  return { value: valids }
})

const v$ = useVuelidate()
// const $v = useVuelidate(validations, props.field.value)

const validationMessage = computed(() => {
  const fv = toRaw(props.field.validations)

  console.log(fv)

  return fv && fv.email && $v.$anyError && !$v.value.email
    ? 'Must be a valid email'
    : fv && fv.minLength && $v.$anyError && !$v.value.minLength
    ? `Must have at least ${fv.minLength} characters`
    : fv && fv.maxLength && $v.$anyError && !$v.value.maxLength
    ? `Must be no longer than ${fv.maxLength} characters`
    : fv && fv.minValue && $v.$anyError && !$v.value.minValue
    ? `Minimum is ${fv.minValue}`
    : fv && fv.maxValue && $v.$anyError && !$v.value.maxValue
    ? `Maximum is ${maxValueOverride !== null ? maxValueOverride : fv.maxValue}`
    : fv &&
      fv.includes &&
      $v.$anyError &&
      !$v.value.custom &&
      props.field.customValidationText
    ? props.field.customValidationText
    : props.field.type === 'date' && props.field.adult && $v.$anyError && !$v.value.maxValue
    ? 'Should be 18 years old'
    : props.field.type === 'address' && $v.$anyError
    ? 'We can’t find this address – please check the spelling.'
    : props.field.type === 'address' &&
      $v.$anyError &&
      !$v.value.full_address &&
      $v.value.required
    ? 'Please select full address'
    : fv &&
      fv.required &&
      $v.$anyError &&
      !$v.value.required &&
      props.field.type === 'textarea'
    ? 'Please complete this field'
    : fv && fv.required && $v.$anyError && !$v.value.required
    ? 'This field is required'
    : ''
})

function onchangeCurrency(value) {
  setFields({ [props.field.name]: value })
  saveFields()
}
</script>

<script>
import TooltipLabel from '@/components/TooltipLabel.vue'
import AutocompleteInput from '@/components/controls/_autocompleteInput.vue'
import SimpleText from '@/components/controls/_simpleText.vue'
import GoogleAutocomplete from '@/components/controls/_googleAutocomplete.vue'
import InputNumber from 'primevue/inputnumber'

export default {
  name: 'text-input',
  components: {
    TooltipLabel,
    AutocompleteInput,
    SimpleText,
    GoogleAutocomplete
  }
}
</script>

<template>
  <div class="control">
    <tooltip-label :field="field"></tooltip-label>
    <slot v-if="field.sublabel"><span class="sublabel" v-html="field.sublabel"></span></slot>

    <div
      class="textFieldWrap"
      :data-extra="v$.$anyError ? 'is-danger' : !v$.$invalid && value ? 'is-success' : ''"
      :key="field.name"
      :message="validationMessage"
    >
      <div class="pre-label" v-if="field.leftLabel">{{ field.leftLabel }}</div>

      <b-datepicker
        v-if="field.type === 'date'"
        :placeholder="field.placeholder"
        :min-date="dateopts.minYear"
        :max-date="dateopts.maxDate"
        :focused-date="dateopts.focused"
        :value="value"
        :disabled="disabled"
        icon="calendar-today"
        :mobile-native="false"
        @input.native="input($event.target.value)"
        @input="onchange($event)"
      />
      <b-autocomplete
        v-else-if="field.type === 'autocomplete'"
        v-model="value"
        :data="filteredData"
        :disabled="disabled"
        :placeholder="field.placeholder"
        :this_field="this_field"
        @select="(option) => onchange(option)"
      >
        <template slot="empty" v-if="field.notFound">{{ field.notFound }}</template>
      </b-autocomplete>

      <autocomplete-input
        v-else-if="field.type === 'addressright'"
        :field="field"
        :val="val"
        :disabled="disabled"
        :this_field="this_field"
        :id="id"
        :classes="classes"
      />

      <google-autocomplete
        v-else-if="field.type === 'address'"
        :field="field"
        :val="val"
        :disabled="disabled"
        :this_field="this_field"
        :id="id"
        :classes="classes"
        country="nz"
      />

      <div v-else-if="field.type === 'label'">{{ value }}</div>
      <div
        v-else-if="field.type === 'currency'"
        class="control"
        :class="commonClassesObject"
      >
        <div class="p-inputgroup flex-1 currency_wrap">
          <span class="p-inputgroup-addon">$</span>
          <InputNumber
            v-model="value"
            locale="en-NZ"
            :minFractionDigits="0"
            :maxFractionDigits="2"
            :class="{
              'is-danger': (isAmountField && this.wrongAmountField) || v$.$anyError
            }"
            :placeholder="field.placeholder"
            :disabled="disabled"
            maxlength="13"
            :data-field="field.name"
            v-on:blur="onchangeCurrency(value)"
            ref="input"
            :data-test-id="field.name"
          />
        </div>
      </div>

      <div v-else class="control" :class="commonClassesObject">
        <textarea
          v-if="field.type === 'textarea'"
          class="input input_textarea"
          :class="{ 'is-danger': v$.$anyError }"
          v-model="value"
          :placeholder="field.placeholder"
          :disabled="disabled"
          v-on:blur="onchange(value)"
          ref="input"
          cols="30"
          rows="5"
          :data-test-id="field.name"
        />
        <simple-text
          v-else
          :class="{ 'is-danger': v$.$anyError }"
          :field="field"
          :val="val"
          :disabled="disabled"
          :this_field="this_field"
          :id="id"
          :classes="classes"
        />

        <p v-if="suffix" class="suffix_part">
          {{ suffix }}
        </p>
      </div>
      <p
        v-if="this.wrongAmountField"
        class="help is-danger"
        v-text="
          wrongAmountField === 'high' ? 'Max loan amount $4,000,000' : 'Min loan amount $100,000'
        "
      />

      <p v-if="v$.$anyError && this.wrongAddressRightSelection" class="help is-danger">
        Please select address from the dropdown
      </p>
    </div>
  </div>
</template>