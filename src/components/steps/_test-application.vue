<template>
    <div>
      <div class="buttons">
        <button class="button" @click="unsubmit">Unsubmit</button>
        <button class="button is-danger" @click="clear">Clear All</button>
        <button class="button is-primary" @click="newApp">New Application</button>
      </div>
      <!-- <field
        :propField="{
          label: 'Guid',
          type: 'text',
          value: guid,
        }"
        @change="getAppByGuid"
      />
      <field name="Id" :disabled="true" />
      <b-tabs v-model="activeTab" class="off-bg test_app__nav">
        <b-tab-item label="Applicant 1">
          <field name="CCRScore" />
          <field name="Inteflow_Result_XML" />
        </b-tab-item>
        <b-tab-item label="Applicant 2">
          <field name="CCRScore_CoApp" />
          <field name="Inteflow_Result_XML_CoApp" />
        </b-tab-item>
      </b-tabs> -->
    </div>
  </template>
  
  <script>
//   import field from '../controls/field';
  
  export default {
    name: 'test-application',
    // components: { field },
    // computed: {
    //   guid() {
    //     return this.$store.state.guid;
    //   },
    // },
    // data() {
    //   return {
    //     activeTab: 0,
    //   };
    // },
    // methods: {
    //   unsubmit() {
    //     this.$store.commit('setFields', {
    //       ['Application_Status']: '',
    //       ['Outcome']: '',
    //       ['Submitted']: '',
    //       ['Accepted_Single_Joint_Applicant_Consent']: '',
    //     });
    //     this.$store.dispatch('saveFieldsArr', [
    //       'Application_Status',
    //       'Outcome',
    //       'Submitted',
    //       'Accepted_Single_Joint_Applicant_Consent',
    //     ]);
    //     setTimeout(() => {
    //       this.$bus.$emit('validate', {
    //         steps: this.$store.state.steps.map((s) => s.slug),
    //       });
    //     }, 100);
    //   },
    //   clear() {
    //     this.$store.dispatch('saveAll', true);
    //     this.$store.state.steps.forEach((step) => {
    //       this.$store.commit('updateStepValid', {
    //         slug: step.slug,
    //         valid: false,
    //         inError: false,
    //       });
    //     });
    //   },
    //   newApp() {
    //     this.$store.dispatch('createApp', { newApp: true });
    //   },
    //   getAppByGuid(val) {
    //     this.$store.dispatch('getData', { guid: val.value });
    //   },
    // },
  };
  </script>
  