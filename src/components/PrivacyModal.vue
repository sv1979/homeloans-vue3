<script setup>
import { ref, computed } from 'vue'
import field from '@/components/controls/field.vue'
import Dialog from 'primevue/dialog';
import Button from 'primevue/button';
const emit = defineEmits(['close'])

const modalOpen = ref(props.isOpen);

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

<template>
    <Dialog 
        :visible.sync="props.isOpen" 
        @update:visible="handleClose" 
        modal 
        maximizable 
        header="Privacy Declaration" 
        :style="{ width: '50rem' }"
        :breakpoints="{ '1199px': '75vw', '575px': '90vw' }">
        <div class="card-content content">
            <p>In this declaration, “Heartland”, “we” or “us” means Heartland Bank Limited, and its related entities,
                successors, assigns, agents and associates, and “you” means the person completing this application, each
                person named in this application, each guarantor of any loan made to you and any authorised person or
                beneficial owner of the borrower or any guarantor of any loan made to you (as applicable).</p>
            <p>Heartland is collecting information about you in accordance with the Privacy Act 2020 and our Privacy
                Statement, and we may not be able to provide you with products or services if you do not provide that
                information. </p>
            <p>
                <b>That information may be used by us:</b>
            <ul>
                <li>to consider this application for an account or service, including to establish and verify your identity
                    and to assess your creditworthiness and financial position from time to time</li>
                <li>to consider any future application for products or services which involves you.</li>
            </ul>
            </p>
            <p>
                <b>We can also use it:</b>
            <ul>
                <li>to administer and monitor products or services provided to you</li>
                <li>to comply with legal and regulatory requirements (including identity verification requirements)</li>
                <li>to provide you with information about other products or services, including those of selected third
                    parties</li>
                <li>generally, to develop and run our business; and</li>
                <li>as otherwise described in our Privacy Statement.</li>
            </ul>
            </p>
            <p>You agree that - for those purposes – we can provide information about you to, and obtain information about
                you from, other organisations or people we consider appropriate. Those organisations might include our
                service providers, other financial and insurance institutions, government departments, our regulators and
                registered dispute resolution scheme, your employer or accountant, third parties for the purposes of fraud
                prevention, identity verification, and any other purposes relevant to those purposes (those third parties
                may retain information and use it for identity verification and fraud detection purposes), and other
                appropriate persons.</p>
            <p>We may also exchange information about you (including default information) with credit reporting agencies on
                an ongoing basis. Those agencies may retain that information and provide it to other customers who use their
                credit reporting services.</p>
            <p>You have rights to access and request correction of your personal information under the Privacy Act 2020. You
                can do so by contacting us using the details provided on heartland.co.nz/contact-us</p>

            <p>
                <b>By proceeding, you confirm that:
                </b>
            </p>    
            <p>
                <ul>
                    <li>each person named in this application form has read and agrees to the terms above and our Privacy
                        Statement;</li>
                    <li>all information provided to us is correct, complete and not misleading; and</li>
                    <li>none of those people is an un-discharged bankrupt.</li>
                </ul>
            </p>

            <field fieldName="Accepted_Marketing_Communication" class="mt-4" />  
            <div class="buttons mt-4 expanded">
                <Button class="is-primary mb-4" rounded @click="handleClose" label="Close" />
            </div>
        </div>
    </Dialog>
</template>