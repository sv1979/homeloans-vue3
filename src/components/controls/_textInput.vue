<!-- <script setup>
import { computed, reactive, ref, toRaw } from 'vue'
import { useVuelidate } from '@vuelidate/core'
import { useApplicationStore } from '@/stores/application'
const { getFields, setFields, saveFields } = useApplicationStore()
const emit = defineEmits(['change', 'save', 'validate'])
console.log(22)
</script > -->


<script>

import { required, email, minLength, maxLength, minValue, maxValue } from '@vuelidate/validators'
import { computed, reactive, ref, toRaw } from 'vue'
import { useVuelidate } from '@vuelidate/core'
import { useApplicationStore } from '@/stores/application'
// const emit = defineEmits(['change', 'save', 'validate'])
import TooltipLabel from '@/components/TooltipLabel.vue'
import AutocompleteInput from '@/components/controls/_autocompleteInput.vue'
import SimpleText from '@/components/controls/_simpleText.vue'
import GoogleAutocomplete from '@/components/controls/_googleAutocomplete.vue'
import InputNumber from 'primevue/inputnumber'
import { validationRules, validationMessage } from '@/helpers/validationMixin.js'

export default {
  name: 'text-input',
  components: {
    TooltipLabel,
    AutocompleteInput,
    SimpleText,
    GoogleAutocomplete,
    InputNumber
  },
  props: {
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
  },
  setup(props) {
    const { getFields, setFields, saveFields } = useApplicationStore()
    const state = reactive({ fieldValue: props.val })
    const rawValue = ref('')
    const dateops = reactive({
      minYear: null,
      maxDate: null,
      focused: null
    })
    const rules = computed(() => {
      if (validationRules) return validationRules(props);
      return { fieldValue: {} }
    })
    const v$ = useVuelidate(rules, state)

    function onchangeCurrency(event) {
      setFields({ [props.field.name]: event.value })
      saveFields()
    }

    return {
      v$,
      props,
      validationMessage,
      onchangeCurrency,
      state
    }
  }
}
</script>

<template>
  <div class="control">
    <tooltip-label :field="field"></tooltip-label>
    <slot v-if="field.sublabel"><span class="sublabel" v-html="field.sublabel"></span></slot>

    <div class="textFieldWrap"
      :key="field.name" :message="validationMessage">
      <div class="pre-label" v-if="field.leftLabel">{{ field.leftLabel }}</div>

      <b-datepicker v-if="field.type === 'date'" :placeholder="field.placeholder" :min-date="dateopts.minYear"
        :max-date="dateopts.maxDate" :focused-date="dateopts.focused" :value="fieldValue" :disabled="disabled"
        icon="calendar-today" :mobile-native="false" @input.native="input($event.target.value)"
        @input="onchange($event)" />
      <b-autocomplete v-else-if="field.type === 'autocomplete'" v-model="fieldValue" :data="filteredData"
        :disabled="disabled" :placeholder="field.placeholder" :this_field="this_field"
        @select="(option) => onchange(option)">
        <template slot="empty" v-if="field.notFound">{{ field.notFound }}</template>
      </b-autocomplete>

      <autocomplete-input v-else-if="field.type === 'addressright'" :field="field" :val="val" :disabled="disabled"
        :this_field="this_field" :id="id" :classes="classes" />

      <google-autocomplete v-else-if="field.type === 'address'" :field="field" :val="val" :disabled="disabled"
        :this_field="this_field" :id="id" :classes="classes" country="nz" />

      <div v-else-if="field.type === 'label'">{{ fieldValue }}</div>
      
      <div v-else-if="field.type === 'currency'" class="control" :class="commonClassesObject">
        <div class="p-inputgroup flex-1 currency_wrap">
          <span class="p-inputgroup-addon">$</span>
          <InputNumber v-model="v$.fieldValue.$model" locale="en-NZ" :minFractionDigits="0" :maxFractionDigits="2" :class="{
            'p-invalid': (isAmountField && this.wrongAmountField) || (v$ && v$.$errors.length)
          }" :placeholder="field.placeholder" :disabled="disabled" maxlength="13" :data-field="field.name"
            v-on:blur="onchangeCurrency" ref="input" :data-test-id="field.name" />
        </div>
      </div>

      <div v-else class="control" :class="commonClassesObject">
        <textarea v-if="field.type === 'textarea'" class="input input_textarea"
          :class="{ 'is-danger': v$.$errors.length }" v-model="fieldValue" :placeholder="field.placeholder"
          :disabled="disabled" v-on:blur="onchange(fieldValue)" ref="input" cols="30" rows="5"
          :data-test-id="field.name" />
        <simple-text v-else :class="{ 'is-danger': v$.$errors.length }" :field="field" :val="val" :disabled="disabled"
          :this_field="this_field" :id="id" :classes="classes" />

        <p v-if="suffix" class="suffix_part">
          {{ suffix }}
        </p>
      </div>
      <p v-if="this.wrongAmountField" class="help is-danger" v-text="wrongAmountField === 'high' ? 'Max loan amount $4,000,000' : 'Min loan amount $100,000'
        " />

      <p v-if="v$ && v$.$errors.length && this.wrongAddressRightSelection" class="help is-danger">
        Please select address from the dropdown
      </p>

      <div class="input-errors" v-for="error of v$.fieldValue.$errors" :key="error.$uid">
        <div class="error-msg">{{ validationMessage(props, v$) }}</div>
      </div>
    </div>
  </div>
</template>