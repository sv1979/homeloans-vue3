<script setup>
import { ref, onMounted, computed } from 'vue'
import { RouterLink, RouterView, useRouter, useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useApplicationStore } from '../stores/application'
import commonMixin from '../helpers/commonMixin'
import constants from '../helpers/constants'
import Inlinesvg from '@/components/Inlinesvg.vue';
import TestApplication from './steps/_test-application.vue'

const router = useRouter()
const route = useRoute()
const { parseQuery, getLookup, loadToken, runInitialLoad } = useApplicationStore()
const { guid, initialLoad, fields, processing, history, steps, activeIndex, decisionGateAfterExpensesAlreadyCalled, decisionGateAfterExpensesDeclined } = storeToRefs(useApplicationStore())

const mobileOpen = ref(false)
const hideSaveAndExitButton = ref(false)

async function init() {
  await parseQuery(router, route)
  getLookup()
  // TODO: setCoappVerification / setPrimVerification

  if (guid.value && typeof guid.value === 'string' && guid.value.length === 36) {
    loadToken()
    // not clear why it is separated in the v2 ?
    // TODO: getBiometrics status
    // TODO: load app by guid 
  } else {
    loadToken({ setGuid: true })
    runInitialLoad()
  }
}

init()

const saveAndExitShown = computed(() => {
  if (decisionGateAfterExpensesAlreadyCalled.value && decisionGateAfterExpensesDeclined.value) {
    return false
  }
  return true
})

const nextButtonText = computed(() => {
  if (activeIndex.value === 5) return "Submit"
  return "Next"
})

const backLink = computed(() => {
  if (window.location.href.indexOf('localhost') > -1 | window.location.href.indexOf('staging') > -1) {
    return constants.URLS.STAGING_HOME
  } else {
    return constants.URLS.PROD_HOME
  }
})

const loaded = computed(() => {
  return (
    (initialLoad || guid) &&
    fields.value.Loan_Interest_Rate.options?.length > 0 &&
    document.cookie.indexOf('newappcreated=true') < 0
  );
})

const mobileMenuShown = computed(() => {
  return (
    mobileOpen && status !== 'Processing' && status !== 'Submitted'
  );
})

const status = computed(() => {
  return fields.value.Application_Status.value
})

const activeStep = computed(() => {
  return steps.value[activeIndex.value]
})

const isNonProd = computed(() => {
  return import.meta.env.MODE !== 'production'
})

const hasNextStep = computed(() => {
  if (steps.value.length <= activeIndex.value + 1) return false;

  let canShowNext =
    !steps.value[activeIndex.value + 1].unlockStatus ||
    steps.value[activeIndex.value + 1].unlockStatus === status.value ||
    (status.value === '' &&
      steps.value[activeIndex.value + 1].unlockStatus === 'PreProcessing');

  return canShowNext;
})

const notFirstStep = computed(() => {
  return stepSlug.value !== 'calculator';
})

const stepSlug = computed(() => {
  return route.path.replace("/", "")
})

function checkIfLocked(step) {
  return step.unlockStatus !== status.value || status.value === 'Submitted';
}

function checkIf(step) {
  const conditions = step.if.map((cond = { name: '', value: '' }) => {
    return (
      (fields[cond.name] &&
        cond.value === '!null' &&
        fields[cond.name].value) ||
      (fields[cond.name] &&
        fields[cond.name].value === cond.value)
    );
  });

  return (
    (step.showStatus && step.showStatus === status) ||
    (conditions.length && !conditions.some((r) => !r)) ||
    (!conditions.length && !step.showStatus) ||
    (!conditions.length && status === 'Submitted')
  );
}

function isRouteActive(slug) {
  return route.path.includes(slug)
}

function toggleSaveAndExitButton(hide) {
  hideSaveAndExitButton.value = hide
}

onMounted(() => {
  router.push(`/${steps.value[0].slug}`);
})

</script>

<script>
import Calculator from './steps/_calculator.vue'

export default {
  name: 'Wrapper',
  components: {
    Calculator
  }
}
</script>

<template>
  <nav class="navbar" role="navigation" aria-label="main navigation">
    <div class="cont">
      <div class="navbar-item" href="/">
        <a :href="backLink" class="brand">
          <Inlinesvg class="" :src="import('@/assets/logo.svg')" />
        </a>
      </div>
      <div class="navbar-end is-hidden-mobile">
        <div class="navbar-item">
          <h2 class="title is-4">Home Loan application</h2>
        </div>
      </div>
    </div>
  </nav>

  <div class="steps-page" :class="{ processing }" v-if="loaded" :data-status="status">
    <aside class="side-nav" :class="{ open: mobileOpen }">
      <div class="mobile-menu-overlay" @click.self="mobileOpen = false"></div>
      <div class="cont">
        <div class="menu-list">
          <div class="smallScreensOnly">
            <div class="mobile-menu history" :class="[mobileOpen ? 'show' : 'hide']">
              <span class="placeholder_space" v-if="!mobileOpen && !notFirstStep" />
              <button v-if="mobileOpen" @click="mobileOpen = !mobileOpen" class="mobile_menu_control side_button"
                data-test-id="mobile-menu-close-button">
                <svg viewBox="0 0 40 50">
                  <path class="svg_path close-x" d="M 15,20 L 25,30 M 25,20 L 15,30" />
                </svg>
              </button>
              <button v-if="!mobileOpen && notFirstStep" @click="goPrevStep" class="mobile_menu_control side_button"
                data-test-id="mobile-menu-previous-button">
                <svg viewBox="0 0 40 50">
                  <path class="svg_path svg-prev" d="M 25,20 L 20,25 M 20,25 L 25,30" />
                </svg>
              </button>
              <button @click="mobileOpen = !mobileOpen" :class="{ currently_open: mobileOpen }"
                class="mobile_menu_control main_button" data-test-id="mobile-menu-open-button">
                {{ activeStep.name }}
              </button>
              <button v-if="hasNextStep" @click="goNextStep" class="mobile_menu_control side_button"
                data-test-id="mobile-menu-next-button" :id="`tracking__hl-app__${stepSlug}-mobile-next`">
                <svg viewBox="0 0 40 50">
                  <path class="svg_path svg-next" d="M 15,20 L 20,25 M 20,25 L 15,30" />
                </svg>
              </button>
              <span class="placeholder_space" v-if="!hasNextStep" />
            </div>
            <div v-if="isNonProd">
              <RouterLink class="menu-list-item" to="/test-application" exact-active-class="is-active">Testing
              </RouterLink>
            </div>
            <Transition v-if="mobileMenuShown">
              <div v-show="mobileOpen" class="openedMenu">
                <Transition>
                  <div v-if="history || status === '' || status === 'PreProcessing'">
                    <div v-for="(item, key) of steps" :key="key" class="item_wrapper">
                      <RouterLink class="menu-list-item" v-if="checkIf(item) && item.showStatus !== 'Processing'
                        " :to="item.slug" exact-active-class="is-active" @click="mobileOpen = false" :class="{
    valid: item.valid,
    invalid: item.inError,
    'is-active': isRouteActive(item.slug),
  }">{{ item.name }}
                      </RouterLink>
                    </div>
                  </div>
                </Transition>

                <div v-if="status === 'Processing' || status === 'Submitted'">
                  <span class="menu-list-item history" :class="[history ? 'hide' : 'show']" @click="trigHistory">{{
                    history ? 'Hide history' : 'View history' }}</span>
                </div>
                <div v-if="(!history && status === 'Processing') ||
                  (!history && status === 'Submitted')
                  ">
                  <div v-for="(item, key) of steps" :key="key" class="item_wrapper">
                    <div v-if="checkIf(item) && item.showStatus === 'Processing'
                      ">
                      <RouterLink class="menu-list-item" v-if="checkIf(item) && item.showStatus === 'Processing'
                        " :to="item.slug" exact-active-class="is-active" :class="{
    valid: item.valid,
    invalid: item.inError,
  }">{{ item.name }}
                      </RouterLink>
                    </div>
                  </div>
                </div>
                <div class="menu-list-item save item_wrapper" v-if="status !== 'Submitted'" @click="
                  saveOpen = true;
                mobileOpen = false;
                ">
                  <span class="link-button" :id="`tracking__hl-app__${stepSlug}_save-exit`">Save and exit
                    application</span>
                </div>
              </div>
            </Transition>
          </div>
          <div class="desktopsOnly">
            <Transition>
              <div v-if="history || status === '' || status === 'PreProcessing' || status === 'CoAppVisit' || status === 'PrimVisit'
                ">
                <div v-for="(item, key) of steps" :key="key">
                  <RouterLink class="menu-list-item" v-if="checkIf(item) && item.showStatus !== 'Processing'"
                    :to="item.slug" exact-active-class="is-active" :class="{
                      valid: item.valid,
                      invalid: item.inError,
                      'is-active': isRouteActive(item.slug),
                    }" :data-test-id="`desktop-menu-${item.slug}`">{{ item.name }}</RouterLink>
                </div>
              </div>
            </Transition>
            <div v-if="status === 'Processing' || status === 'Submitted'">
              <span class="menu-list-item history" :class="[history ? 'hide' : 'show']" @click="trigHistory">{{ history ?
                'Hide history' : 'View history' }}</span>
            </div>
            <Transition>
              <div v-if="(!history && status === 'Processing') ||
                (!history && status === 'Submitted')
                ">
                <div v-for="(item, key) of steps" :key="key">
                  <RouterLink class="menu-list-item" v-if="checkIf(item) && item.showStatus === 'Processing'"
                    :to="item.slug" exact-active-class="is-active" :class="{ valid: item.valid, invalid: item.inError }">
                    {{ item.name }}</RouterLink>
                </div>
              </div>
            </Transition>
          </div>
        </div>
      </div>
    </aside>
    <div class="cont">
      <div class="step-body">
        <div v-if="processing" class="has-text-centered is-deeper">
          <h1 class="title is-2">We're processing your info – please keep this tab open.</h1>
          <div class="max500 ma">
            <p class="mb-4" v-if="!allFinished">
              Thanks for providing us with your information.
              We need a few moments to process what you've told us to see if a Heartland Home Loan could work for you.
            </p>
            <div class="loader ma"></div>
          </div>
        </div>
        <template v-if="!processing">
          <test-application v-if="isNonProd && stepSlug === 'test-application'" key="test-page" />
          <component v-for="step in steps" v-show="stepSlug === step.slug" :is-active="stepSlug === step.slug"
            :is="step.slug" :key="step.slug" :appstatus="status" :locked="checkIfLocked(step)"
            v-on:toggleSaveAndExit="toggleSaveAndExitButton"></component>
          <!-- <calculator />   -->
        </template>
      </div>
      <div class="bottom_links">
        <div>
          <span v-if="status !== 'Submitted' && !hideSaveAndExitButton && saveAndExitShown"
            :id="`tracking__hl-app__${stepSlug}_save-exit`" class="link-button"
            data-test-id="save-and-exit-application-button" @click="
              saveOpen = true;
            mobileOpen = false;
            ">Save and exit application</span>
        </div>
        <button class="next-button bottom_links__button" :disabled="nextButtonDisabled" @click="clickNextButtonHandler"
          :class="{ hide: !activeStep.showNext }" data-test-id="next-button" :id="`tracking__hl-app__${stepSlug}-next`"
          v-if="!processing && !forceHideNextButton">
          {{ nextButtonText }}
        </button>
      </div>
    </div>
    <!-- <save-modal v-model="saveOpen" /> -->
  </div>
  <div v-else class="loading_spinner">
    <div class="sk-plane sk-center" />
  </div>
</template>