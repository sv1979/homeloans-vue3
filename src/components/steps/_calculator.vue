<script setup>
import { ref, onMounted, computed, isProxy, toRaw, watch } from 'vue'
import { useApplicationStore } from '@/stores/application'
import constants from '../../helpers/constants'
const { repaymentsCalculator, getFields, setFields, saveFields } = useApplicationStore()

const privacyOpen = ref(false);

function callRepaymentsCalculator(event) {
  repaymentsCalculator()
}

const loanPurpose = computed(() => {
  return toRaw(getFields['Loan_Purpose'].value)
})

const hasRvc = computed(() => {
  return toRaw(getFields['Has_RVC'].value)
})

const hasRequiredRvc = computed(() => {
  return toRaw(getFields['Has_Required_RVC_Limit'].value)
})

const hasRequiredRvcLabel = computed(() => {
  let loan_purpose = toRaw(getFields['Has_RVC'].value)
  let label = toRaw(getFields['Has_Required_RVC_Limit'].label)
  if (loan_purpose == 'new-home') {
    return `${label} your home purchase?`;
  }
  return `${label} paying off your current mortgage?`;
})

const desiredRvc = computed(() => {
  return toRaw(getFields['Desired_RVC_Limit'].value) ? toRaw(getFields['Desired_RVC_Limit'].value) : 0
})

const showMetRepaymentsQuestion = computed(() => {
  return toRaw(getFields['Had_Defaults'].value)
})

const useAddressRight = computed(() => {
  let eak_value = toRaw(getFields['Exact_Address_Known'].value)
  let useAR = eak_value !== 'false' && eak_value.toString() !== 'false'

  if (preProcessed.value) {
    let nonExactAddressFilledAndPreprocessed =
      toRaw(getFields['Address_Text_Property'].value) &&
      !toRaw(getFields['Addressright_Text_Property'].value)
    return loanPurpose.value === 'refinance' || !nonExactAddressFilledAndPreprocessed
  }

  return loanPurpose.value === 'refinance' || useAR
})

const preProcessed = computed(() => {
  return toRaw(getFields['Application_Status'].value) === 'PreProcessing'
})

const getPaymentInfos = computed(() => {
  return toRaw(getFields['Payment_Infos'].value)
})

const getFreq = computed(() => {
  return toRaw(getFields['Repayments_Frequency'].value)
})

const totalInterest = computed(() => {
  if (getPaymentInfos.value.length > 0) {
    return getPaymentInfos.value[parseInt(getFreq.value)].TotalInterest
  }
  return null
})

const termLoanAmount = computed(() => { return toRaw(getFields['Term_Loan_Amount'].value) })

const loanAmount = computed(() => { return toRaw(getFields['Loan_Amount'].value) })

const totalCostOfLoan = computed(() => {
  if (getPaymentInfos.value.length > 0) {
    return getPaymentInfos.value[parseInt(getFreq.value)].TotalCostOfLoan
  }
  return 0
})

const paymentType = computed(() => {
  if (getPaymentInfos.value.length > 0) {
    return getPaymentInfos.value[parseInt(getFreq.value)].PaymentType
  }
  return 0
})

const paymentAmount = computed(() => {
  if (getPaymentInfos.value.length > 0) {
    return getPaymentInfos.value[parseInt(getFreq.value)].PaymentAmount
  }
  return 0
})

const lvrPercentage = computed(() => { return toRaw(getFields['Lvr_Percentage'].value) })

const lvrMessage = computed(() => {
  if (lvrPercentage.value >= 0) {
    return `${lvrPercentage.value}%`
  }
  if (loanPurpose.value === 'refinance') {
    return `Your revolving credit limit cannot be greater than your equity.`;
  }
  return `Your revolving credit limit cannot be greater than your deposit.`;
})

watch(useAddressRight, (newValue, oldValue) => {
  if (newValue | oldValue) {
    setFields({ ['Addressright_Text_Property']: '' })
    setFields({ ['Address_Text_Property']: '' })
    saveFields()
  }
})
</script>
<script>
import field from '../controls/field.vue'
import privacyModal from '@/components/PrivacyModal.vue'
import Button from 'primevue/button';

export default {
  name: 'calculator',
  components: {
    field,
    privacyModal,
    Button
  }
}
</script>

<template>
  <div class="grid calc_grid">
    <div class="col-12 lg:col-7 mb-0">
      <field fieldName="Loan_Purpose" :disabled="preProcessed || processed || submitted"
        @change="callRepaymentsCalculator" input-classes="" />
      <field fieldName="Exact_Address_Known" v-if="loanPurpose !== 'refinance'"
        :disabled="preProcessed || processed || submitted" v-on:change="changeExactAddressKnown" />
      <field v-if="useAddressRight" fieldName="Addressright_Text_Property" this_field="Address_Text_Property"
        :disabled="preProcessed || processed || submitted" :labelOverride="addressFieldLabel"
        key="Addressright_Text_Property" />
      <field v-if="useAddressRight" class="hidden" fieldName="Addressright_ID_Text_Property" />
      <field v-if="!useAddressRight" fieldName="Address_Text_Property" this_field="Address_Text_Property"
        :disabled="preProcessed || processed || submitted" :labelOverride="addressFieldLabel" :skipSave="true"
        @placechanged="setProperty" key="Address_Text_Property" />

      <template v-if="loanPurpose === 'refinance'">
        <field fieldName="Estimated_Home_Value" :alwaysSave="true" :disabled="preProcessed || processed || submitted"
          @change="callRepaymentsCalculator" />
        <field fieldName="Mortgage_Balance" :alwaysSave="true" :disabled="preProcessed || processed || submitted"
          @change="callRepaymentsCalculator" />
        <field fieldName="Loan_topup" :alwaysSave="true" :disabled="preProcessed || processed || submitted"
          @change="callRepaymentsCalculator" />
      </template>

      <template v-else>
        <field fieldName="Purchase_Price" :skipSave="true" :disabled="preProcessed || processed || submitted"
          @change="callRepaymentsCalculator" />
        <field fieldName="Deposit" :skipSave="true" :disabled="preProcessed || processed || submitted"
          @change="callRepaymentsCalculator" />
      </template>

      <field fieldName="Loan_Interest_Rate" :skipSave="true" :disabled="preProcessed || processed || submitted"
        @change="callRepaymentsCalculator" />

      <field fieldName="Loan_Term" :skipSave="true" :disabled="preProcessed || processed || submitted"
        @change="callRepaymentsCalculator" />

      <field fieldName="Repayments_Frequency" :skipSave="true" :disabled="preProcessed || processed || submitted"
        @change="callRepaymentsCalculator" />

      <field fieldName="Has_RVC" :labelOverride="hasRvcLabel" :skipSave="true"
        :disabled="preProcessed || processed || submitted" @change="callRepaymentsCalculator" />

      <field v-if="hasRvc" fieldName="Desired_RVC_Limit" :skipSave="true"
        :disabled="preProcessed || processed || submitted" @change="callRepaymentsCalculator" />

      <field fieldName="Has_Required_RVC_Limit" v-if="hasRvc" :labelOverride="hasRequiredRvcLabel" :skipSave="true"
        :disabled="preProcessed || processed || submitted" @change="callRepaymentsCalculator" />

      <field v-if="hasRvc && hasRequiredRvc" fieldName="Required_RVC_Limit" :skipSave="true"
        :disabled="preProcessed || processed || submitted" @change="callRepaymentsCalculator"
        :maxValueOverride="desiredRvc.toString()" />

    </div>

    <div class="col calc_result" v-if="totalInterest">
      <div class="calc_result_data">
        <b>Term loan amount:</b>
        <p :class="{ 'is-red': termLoanAmount > 4000000 || termLoanAmount < 100000 }">
          {{ constants.CURRENCY.format(termLoanAmount > 0 ? termLoanAmount : 0) }}
          <br />
          <span class="sm" v-if="termLoanAmount > 4000000">Max loan amount $4,000,000</span>
          <span class="sm" v-if="termLoanAmount < 100000">Min loan amount $100,000</span>
        </p>

        <b>Total term loan interest:</b>
        <p>{{ constants.CURRENCY.format((totalInterest > 0 ? totalInterest : 0)) }}</p>

        <b>Total term loan cost:</b>
        <p>{{ constants.CURRENCY.format((totalCostOfLoan > 0 ? totalCostOfLoan : 0)) }}</p>

        <b>{{ paymentType }} term loan repayments:</b>
        <p>{{ constants.CURRENCY.format((paymentAmount > 0 ? paymentAmount : 0)) }}</p>

        <b>Equity percentage:</b>
        <p :class="{ 'is-red': lvrPercentage < 0 }">{{ lvrMessage }}</p>
      </div>

      <div class="calculator-disclaimer sm">
        <p>
          Your repayments are calculated at the interest rate and loan term
          selected, and are based on the interest rate being constant for the
          entire loan term. Changes to interest rates and/or the repayment
          amounts will change this.
          <br />
          Other than the equity percentage, the above does not take into
          consideration a revolving credit account.
        </p>
      </div>
    </div>

    <div class="col-12 mb-3" v-if="loanPurpose === 'refinance'">
      <field input-classes="" fieldName="Had_Defaults" :disabled="preProcessed || processed || submitted" />

      <field v-if="showMetRepaymentsQuestion" input-classes="" fieldName="Met_Repayments"
        :disabled="preProcessed || processed || submitted" />
    </div>

    <div class="col-12 pos_relative long-text mb-1">
      <label class="checkbox_wrapper">
        <field fieldName="Accepted_Privacy_Declaration" @change="saveAll" :skipSave="true"
          :disabled="preProcessed || processed || submitted" />
        <div class="check_label sm checkbox-wrap-text">
          I have read and understood the
          <Button class="link" @click="privacyOpen = true">Privacy Declaration.</Button>
          and I agree to my information being collected and dealt with
          accordingly.
        </div>
      </label>
    </div>

    <div class="col-12 pos_relative long-text mb-1">
      <label class="checkbox_wrapper">
        <field fieldName="Accepted_Financial_Statement" :skipSave="true"
          :disabled="preProcessed || processed || submitted" />
        <div class="check_label sm checkbox-wrap-text" v-html="constants.ACCEPTED_FINANCIAL_STATEMENT_LABEL"></div>
      </label>
    </div>

    <privacy-modal :isOpen="privacyOpen" v-on:close="privacyOpen = false" />
  </div>
</template>