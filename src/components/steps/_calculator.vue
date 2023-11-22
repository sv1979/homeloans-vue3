<script setup>
import { ref, onMounted, computed, isProxy, toRaw, watch } from 'vue'
import { useApplicationStore } from '@/stores/application'
const { repaymentsCalculator, getFields, setFields, saveFields } = useApplicationStore()

function callRepaymentsCalculator(event) {
  console.log(333, 'RC')
  repaymentsCalculator()
}

const loanPurpose = computed(() => {
  return toRaw(getFields['Loan_Purpose'].value)
})

const hasRvc = computed(() => {
  return toRaw(getFields['Has_RVC'].value)
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

export default {
  name: 'calculator',
  components: {
    field
  }
}
</script>

<template>
  <div class="grid">
    <div class="col-7 mb-0">
      <field
        fieldName="Loan_Purpose"
        :disabled="preProcessed || processed || submitted"
        @change="callRepaymentsCalculator"
        input-classes="test test3"
      />
      <field
        fieldName="Exact_Address_Known"
        v-if="loanPurpose !== 'refinance'"
        :disabled="preProcessed || processed || submitted"
        v-on:change="changeExactAddressKnown"
      />
      <field
        v-if="useAddressRight"
        fieldName="Addressright_Text_Property"
        this_field="Address_Text_Property"
        :disabled="preProcessed || processed || submitted"
        :labelOverride="addressFieldLabel"
        key="Addressright_Text_Property"
      />
      <field v-if="useAddressRight" class="hidden" fieldName="Addressright_ID_Text_Property" />
      <field
        v-if="!useAddressRight"
        fieldName="Address_Text_Property"
        this_field="Address_Text_Property"
        :disabled="preProcessed || processed || submitted"
        :labelOverride="addressFieldLabel"
        :skipSave="true"
        @placechanged="setProperty"
        key="Address_Text_Property"
      />

      <template v-if="loanPurpose === 'refinance'">
        <field
          fieldName="Estimated_Home_Value"
          :alwaysSave="true"
          :disabled="preProcessed || processed || submitted"
          @change="repaymentsCalculator"
        />
        <field
          fieldName="Mortgage_Balance"
          :alwaysSave="true"
          :disabled="preProcessed || processed || submitted"
          @change="repaymentsCalculator"
        />
        <field
          fieldName="Loan_topup"
          :alwaysSave="true"
          :disabled="preProcessed || processed || submitted"
          @change="repaymentsCalculator"
        />
      </template>

      <template v-else>
        <field
          fieldName="Purchase_Price"
          :skipSave="true"
          :disabled="preProcessed || processed || submitted"
          @change="repaymentsCalculator"
        />
        <field
          fieldName="Deposit"
          :skipSave="true"
          :disabled="preProcessed || processed || submitted"
          @change="repaymentsCalculator"
        />
      </template>

      <field
        fieldName="Loan_Interest_Rate"
        :skipSave="true"
        :disabled="preProcessed || processed || submitted"
        @change="repaymentsCalculator"
      />

      <field
        fieldName="Loan_Term"
        :skipSave="true"
        :disabled="preProcessed || processed || submitted"
        @change="repaymentsCalculator"
      />

      <field
        fieldName="Repayments_Frequency"
        :skipSave="true"
        :disabled="preProcessed || processed || submitted"
        @change="repaymentsCalculator"
      />

      <field
        fieldName="Has_RVC"
        :labelOverride="hasRvcLabel"
        :skipSave="true"
        :disabled="preProcessed || processed || submitted"
        @change="repaymentsCalculator"
      />

      <field
        v-if="hasRvc"
        fieldName="Desired_RVC_Limit"
        :skipSave="true"
        :disabled="preProcessed || processed || submitted"
        @change="repaymentsCalculator"
      />
    </div>
    <!--<div class="columns mb-2">
            <div class="column is-6 pt-0">
                <field v-if="hasRvc" name="Desired_RVC_Limit" :skipSave="true"
                    :disabled="preProcessed || processed || submitted" @change="repaymentsCalculator" />
                <field name="Has_Required_RVC_Limit" v-if="hasRvc" :labelOverride="hasRequiredRvcLabel" :skipSave="true"
                    :disabled="preProcessed || processed || submitted" @change="repaymentsCalculator" />
                <field v-if="hasRvc && hasRequiredRvc" name="Required_RVC_Limit" :skipSave="true"
                    :disabled="preProcessed || processed || submitted" @change="repaymentsCalculator"
                    :maxValueOverride="desiredRvc.toString()" />
            </div>
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
        </div>
        <div class="mb-3" v-if="loanPurpose === 'refinance'">
            <field input-classes="desktop_160 mb-3" name="Had_Defaults"
                :disabled="preProcessed || processed || submitted" />
            <field v-if="showMetRepaymentsQuestion" input-classes="desktop_160 mb-3" name="Met_Repayments"
                :disabled="preProcessed || processed || submitted" />
        </div>
        <div class="checkbox-wrap pos_relative long-text mb-3">
            <field name="Accepted_Privacy_Declaration" @change="saveAll" :skipSave="true"
                :disabled="preProcessed || processed || submitted" />
            <div class="sm">
                I have read and understood the
                <span class="link" @click="privacyOpen = true">Privacy Declaration.</span>
                and I agree to my information being collected and dealt with
                accordingly.
            </div>
        </div>
        <div class="checkbox-wrap pos_relative extra-long-text">
            <field name="Accepted_Financial_Statement" :skipSave="true"
                :disabled="preProcessed || processed || submitted" />
            <div class="sm">
                I have read and understood the following statement regarding financial
                advice:<br />
                You are protected by responsible lending laws. Because of these
                protections, the recommendations given to you about Heartland loans are
                not regulated financial advice. This means that duties and requirements
                imposed on people who give financial advice do not apply to these
                recommendations. This includes a duty to comply with a code of conduct
                and a requirement to be licensed.
            </div>
        </div> -->

    <privacy-modal v-model="privacyOpen" />
  </div>
</template>