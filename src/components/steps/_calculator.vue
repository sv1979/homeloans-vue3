<script setup>
import { ref, onMounted, computed, isProxy, toRaw, watch } from 'vue'
import { useApplicationStore } from '@/stores/application'
import constants from '../../helpers/constants'
const { repaymentsCalculator, getFields, setFields, saveFields } = useApplicationStore()

const privacyOpen = ref(false);

function callRepaymentsCalculator(event) {
  console.log(333, 'RC', event)
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

watch(useAddressRight, (newValue, oldValue) => {
  console.log(200, 'AR', newValue, oldValue)
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
  <div class="grid">
    <div class="col-7 mb-0">
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
          @change="repaymentsCalculator" />
        <field fieldName="Loan_topup" :alwaysSave="true" :disabled="preProcessed || processed || submitted"
          @change="repaymentsCalculator" />
      </template>

      <template v-else>
        <field fieldName="Purchase_Price" :skipSave="true" :disabled="preProcessed || processed || submitted"
          @change="callRepaymentsCalculator" />
        <field fieldName="Deposit" :skipSave="true" :disabled="preProcessed || processed || submitted"
          @change="repaymentsCalculator" />
      </template>

      <field fieldName="Loan_Interest_Rate" :skipSave="true" :disabled="preProcessed || processed || submitted"
        @change="repaymentsCalculator" />

      <field fieldName="Loan_Term" :skipSave="true" :disabled="preProcessed || processed || submitted"
        @change="repaymentsCalculator" />

      <field fieldName="Repayments_Frequency" :skipSave="true" :disabled="preProcessed || processed || submitted"
        @change="repaymentsCalculator" />

      <field fieldName="Has_RVC" :labelOverride="hasRvcLabel" :skipSave="true"
        :disabled="preProcessed || processed || submitted" @change="repaymentsCalculator" />

      <field v-if="hasRvc" fieldName="Desired_RVC_Limit" :skipSave="true"
        :disabled="preProcessed || processed || submitted" @change="repaymentsCalculator" />

      <field fieldName="Has_Required_RVC_Limit" v-if="hasRvc" :labelOverride="hasRequiredRvcLabel" :skipSave="true"
        :disabled="preProcessed || processed || submitted" @change="repaymentsCalculator" />

      <field v-if="hasRvc && hasRequiredRvc" fieldName="Required_RVC_Limit" :skipSave="true"
        :disabled="preProcessed || processed || submitted" @change="repaymentsCalculator"
        :maxValueOverride="desiredRvc.toString()" />

    </div>
    <div class="col-12 mb-3" v-if="loanPurpose === 'refinance'" >
      <field input-classes="" fieldName="Had_Defaults"
        :disabled="preProcessed || processed || submitted" />

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

    <privacy-modal :isOpen="privacyOpen" v-on:close="privacyOpen = false"/>

    <!--<div class="columns mb-2">
            <div class="column is-5 is-offset-1 is-relative" v-if="TotalInterest">
                <div class="card calculator-card">
                    <div class="card-content content for_calc">
                        <TooltipLabel :field="loanLabel"></TooltipLabel>
                        <p :class="{ 'is-red': loanAmount > 4000000 || loanAmount < 100000 }">
                            {{ (termLoanAmount > 0 ? termLoanAmount : 0) | currency }}
                            <br />
                            <span class="sm" v-if="loanAmount > 4000000">Max loan amount $4,000,000</span>
                            <span class="sm" v-if="loanAmount < 100000">Min loan amount $100,000</span>
                        </p>
                        <TooltipLabel :field="{ label: 'Total term loan interest:' }"></TooltipLabel>

                        <p>{{ (TotalInterest > 0 ? TotalInterest : 0) | currency }}</p>
                        <b>Total term loan cost:</b>
                        <br />
                        <p>{{ (TotalCostOfLoan > 0 ? TotalCostOfLoan : 0) | currency }}</p>
                        <b>{{ PaymentType }} term loan repayments:</b>
                        <br />
                        <p>{{ (PaymentAmount > 0 ? PaymentAmount : 0) | currency }}</p>
                        <span>
                            <b>{{ lvrLabel }}</b>
                            <br />
                            <p :class="{ 'is-red': lvrPercentage < 0 }">{{ lvrMessage }}</p>
                        </span>
                    </div>
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
        </div> -->
  </div>
</template>