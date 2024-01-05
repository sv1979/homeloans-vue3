<script setup>
import { ref, computed } from 'vue'
import field from '@/components/controls/field.vue'
import Dialog from 'primevue/dialog';
import Button from 'primevue/button';
const emit = defineEmits(['close'])

const props = defineProps({
    isOpen: {
        type: Boolean,
        default: false
    }
})

function handleClose() {
    emit('close')
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
            <field fieldName="EmailAddress" ref="email1" />
            <div class="buttons mt-4 expanded flex">
                <Button class="button is-mobile" outlined rounded @click="handleClose" label="Return to application" />
                <Button class="is-primary button is-mobile" rounded @click="save" label="Send email" />
            </div>
        </div>
    </Dialog>
</template>