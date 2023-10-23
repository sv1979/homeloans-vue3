<script setup>
import { onMounted, computed, reactive, watch, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useVuelidate } from '@vuelidate/core'
import { useApplicationStore } from '@/stores/application'
const { getFields, setFields, saveFields } = useApplicationStore()
import { required } from '@vuelidate/validators'
import axios from 'axios'
import constants from '@/helpers/constants'
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

const value = ref(null);
const rawValue = ref('');
const dateops = reactive({
  minYear: null,
  maxDate: null,
  focused: null,
});
const mask = reactive(null);
const addressRightValue = ref('');
const addressRightSuggestions = ref([]);
const wrongAddressRightSelection = ref(false);
const masks = reactive(
  {
    numeral: true,
    numeralThousandsGroupStyle: 'thousand',
  }
)

let fieldValue = reactive(props.val)

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

const $v = useVuelidate(validations, fieldValue)

const updateValue = (newValue) => {
  if (!newValue && props.field.default) {
    fieldValue = props.field.default
  } else {
    fieldValue = newValue
  }
}

watch(fieldValue, (newValue, oldValue) => {
  console.log(224, newValue, oldValue)
  updateValue(newValue)
})

function getAddressRightData(event) {
  var results = null;
  const searchTerm = event.target.value;
  console.log(event.target.value, addressRightSuggestions)
  var $url = `${constants.URLS.ADDRESSRIGHT_API_CALL}${searchTerm}`;

  axios($url).then((data) => {
    if (data.data.length > 0) {
      addressRightSuggestions.value = [];
      data.data.map((el) => {
        addressRightSuggestions.value.push(el);
      });
    }
  });
}
</script>

<script>
import TooltipLabel from '@/components/TooltipLabel.vue'

export default {
  name: 'text-input',
  components: {
    TooltipLabel
  },
  methods: {
    autocompleteFocus() {
      if (this.value && (props.field.type === 'address' || props.field.type === "addressright")) {
        this.value = ''; // Clean address field on focus if it contains any data

        let this_field_name = props.field.name;
        setFields({ [this_field_name]: '' })
        saveFields()
      }
    },
  }
}
</script>

<template>
  <div>
    <tooltip-label :field="field"></tooltip-label>
    <slot v-if="field.sublabel"><span class="sublabel" v-html="field.sublabel"></span></slot>

    <div :data-extra="$v.$anyError
      ? 'is-danger'
      : !$v.value.$invalid && value
        ? 'is-success'
        : ''
      " :key="field.name" :message="validationMessage">
      <div class="pre-label" v-if="field.leftLabel">{{ field.leftLabel }}</div>

      <b-datepicker v-if="field.type === 'date'" :placeholder="field.placeholder" :min-date="dateopts.minYear"
        :max-date="dateopts.maxDate" :focused-date="dateopts.focused" :value="value" :disabled="disabled"
        icon="calendar-today" :mobile-native="false" @input.native="input($event.target.value)"
        @input="onchange($event)" />
      <b-autocomplete v-else-if="field.type === 'autocomplete'" v-model="value" :data="filteredData" :disabled="disabled"
        :placeholder="field.placeholder" :this_field="this_field" @select="(option) => onchange(option)">
        <template slot="empty" v-if="field.notFound">{{
          field.notFound
        }}</template>
      </b-autocomplete>

      <v-autocomplete v-else-if="field.type === 'addressright'"
        :class="{ 'autocomplete_input': true, 'is-danger': $v.$anyError }" keep-first select-on-click-outside=true
        v-model="fieldValue" field="label" ref="autocomplete" max-height="172" :this_field="this_field"
        v-on:input="getAddressRightData" :items="addressRightSuggestions" :placeholder="field.placeholder"
        @click.native="cleanAddressRight" @blur="blurAddressRight" @focus="autocompleteFocus()"
        @select="option => addressRightValue = option" :disabled="disabled" :data-test-id="field.name">
        <!-- <template slot-scope="props">
          <div class="option">
            {{ props.option.label }}
          </div>
        </template> -->
      </v-autocomplete>

      <div class="control" v-else-if="field.type === 'address'">
        <vue-google-autocomplete id="map" class="input" :class="$v.$anyError
          ? 'is-danger'
          : !$v.value.$invalid && value
            ? 'is-success'
            : ''
          " :placeholder="field.placeholder" :value="value" :disabled="disabled" :this_field="this_field" country="nz"
          key="address" ref="address" :types="field.settings && field.settings.regions ? '(regions)' : ''"
          @placechanged="setAddressData" @saveaddressslash="reworkAddress" @change.native="clearRaw($event.target.value)"
          @focus="autocompleteFocus()" :data-test-id="field.name" />
      </div>
      <div v-else-if="field.type === 'label'">{{ value }}</div>
      <div v-else-if="field.type === 'currency'" class="control" :class="commonClassesObject" v-cleave="masks.numeral">
        <input class="input" :class="{
          'is-danger': (isAmountField && this.wrongAmountField) || $v.$anyError,
        }" v-model="value" :placeholder="field.placeholder" :disabled="disabled"
          :type="field.type === 'textarea' ? 'textarea' : 'text'" :inputmode="field.type === 'currency' ? 'numeric' : ''"
          maxlength="13" :data-field="field.name" v-on:blur="onchange(value)" ref="input" :data-test-id="field.name" />
      </div>

      <div v-else class="control" :class="commonClassesObject">
        <textarea v-if="field.type === 'textarea'" class="input input_textarea" :class="{ 'is-danger': $v.$anyError }"
          v-model="value" :placeholder="field.placeholder" :disabled="disabled" v-on:blur="onchange(value)" ref="input"
          cols="30" rows="5" :data-test-id="field.name" />
        <input v-else class="input" :class="{ 'is-danger': $v.$anyError }" v-model="value"
          :placeholder="field.placeholder" :disabled="disabled" :type="field.type === 'email' ? 'email' : 'text'"
          :inputmode="field.type === 'tel' ? 'numeric' : ''" v-on:keyup="keypressed" v-on:blur="onchange(value)"
          ref="input" :data-test-id="field.name" />

        <p v-if="suffix" class="suffix_part">
          {{ suffix }}
        </p>

      </div>
      <p v-if="this.wrongAmountField" class="help is-danger" v-text="wrongAmountField === 'high'
        ? 'Max loan amount $4,000,000'
        : 'Min loan amount $100,000'
        " />
      <p v-if="$v.$anyError && this.wrongAddressRightSelection" class="help is-danger">Please select address from the
        dropdown</p>
    </div>
    Text {{ props.field.name }}
  </div>
</template>