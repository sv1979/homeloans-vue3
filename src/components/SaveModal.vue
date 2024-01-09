<script setup>
import { ref, computed, onMounted, toRaw } from 'vue'
import field from '@/components/controls/field.vue'
import Dialog from 'primevue/dialog';
import Button from 'primevue/button';
import { useApplicationStore } from '@/stores/application'
const { getFields } = useApplicationStore()
const emit = defineEmits(['close'])
const isEmailValid = ref(true)

const props = defineProps({
    isOpen: {
        type: Boolean,
        default: false
    }
})

function handleClose() {
    emit('close')
}

const getEmail = computed(() => { return toRaw(getFields['EmailAddress'].value) })

function save() {
    console.log(111, getEmail.value)
    // const validate = Object.values(this.$refs).map((c) => {
    //     const v = this.get(c, '$refs.email1.$v');
    //     if (v) {
    //         v.$touch();
    //         return v;
    //     } else return false;
    // });
    // if (!validate.some((v) => v.$invalid)) {
    //     this.close();
    //     this.$store.dispatch('saveExit');
    // }
}

</script>

<script>

</script>

<template>
    <Dialog :visible.sync="props.isOpen" @update:visible="handleClose" modal header="Save and exit"
        :style="{ width: '30rem' }" :breakpoints="{ '1199px': '75vw', '575px': '90vw' }">
        <div class="card-content content">
            <p>
                Please confirm your email so we can send you a link which you can
                use to resume your application.
            </p>
            <field fieldName="EmailAddress" class="w-100" @change="save"/>
            <div class="buttons mt-4 expanded flex">
                <Button class="button is-mobile" outlined rounded @click="handleClose" label="Return to application" />
                <Button class="is-primary button is-mobile" rounded @click="save" label="Send email" />
            </div>
        </div>
    </Dialog>
</template>