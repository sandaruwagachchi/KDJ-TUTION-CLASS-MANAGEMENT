<template>
  <q-page class="q-pa-md bg-black text-white">
    <div class="container">
      <div class="row items-center q-mb-lg">
        <div class="col">
          <h1 class="text-h4 text-weight-bold q-my-none">Payment History</h1>
          <div class="text-grey-5">Track your fee payments and status</div>
        </div>
        <div class="col-auto">
             <q-btn icon="refresh" flat round color="white" @click="fetchData" :loading="loading" />
        </div>
      </div>

       <div v-if="loading" class="row justify-center q-pt-xl">
          <q-spinner color="primary" size="3em" />
      </div>

      <div v-else>
         <!-- Desktop Table -->
         <q-table
          v-if="!$q.screen.xs"
          :rows="payments"
          :columns="columns"
          row-key="id"
          dark
          class="bg-grey-10 text-white shadow-3 card-border"
          flat
          bordered
          :pagination="{ rowsPerPage: 10 }"
        >
          <template v-slot:body-cell-status="props">
            <q-td :props="props">
                <q-chip 
                  :color="props.row.status === 'Paid' ? 'positive' : 'warning'" 
                  text-color="white" 
                  size="sm"
                  class="text-weight-bold"
                >
                  {{ props.row.status }}
                </q-chip>
            </q-td>
          </template>
           <template v-slot:body-cell-payment_date="props">
             <q-td :props="props">
              {{ formatDate(props.row.payment_date) }}
             </q-td>
           </template>
           <template v-slot:body-cell-actions="props">
             <q-td :props="props" align="left">
               <q-btn 
                v-if="props.row.status === 'Pending'"
                size="sm"
                color="primary"
                label="Pay Now"
                unelevated
                @click="openPaymentDialog(props.row)"
               />
             </q-td>
           </template>
        </q-table>

         <!-- Mobile List View -->
         <div v-else class="row q-col-gutter-md">
            <div v-for="pay in payments" :key="pay.id" class="col-12">
               <q-card class="bg-grey-10 text-white shadow-3 card-border">
                  <q-card-section>
                     <div class="row justify-between items-center q-mb-sm">
                        <div class="text-subtitle1 text-weight-bold">{{ pay.classes?.subject }}</div>
                        <q-chip 
                          :color="pay.status === 'Paid' ? 'positive' : 'warning'" 
                          text-color="white" 
                          size="sm"
                        >
                          {{ pay.status }}
                        </q-chip>
                     </div>
                     <div class="text-grey-5 text-caption q-mb-xs">
                        <q-icon name="event" size="xs" class="q-mr-xs" />
                        {{ formatDate(pay.payment_date) }}
                     </div>
                     <div class="row justify-between items-center q-mt-md">
                        <div class="text-caption text-grey-5">{{ pay.month }}</div>
                        <div class="text-h6 text-primary">Rs. {{ pay.amount }}</div>
                     </div>
                     <div v-if="pay.status === 'Pending'" class="q-mt-md text-right">
                         <q-btn 
                          size="sm"
                          color="primary"
                          label="Pay Now"
                          unelevated
                          @click="openPaymentDialog(pay)"
                         />
                     </div>
                  </q-card-section>
               </q-card>
            </div>
         </div>
         
         <div v-if="!loading && payments.length === 0" class="text-center text-grey-5 q-mt-xl">
            <q-icon name="receipt_long" size="4em" />
            <div class="text-h6 q-mt-sm">No payment records found</div>
         </div>

         <!-- Payment Dialog -->
         <q-dialog v-model="paymentDialog" persistent>
          <q-card class="bg-grey-9 text-white" style="width: 100%; max-width: 500px">
              <q-card-section>
                  <div class="text-h6">Pay Outstanding Fee</div>
                  <div class="text-subtitle2">{{ selectedPayment?.classes?.subject }} - {{ selectedPayment?.month }}</div>
              </q-card-section>

              <q-card-section class="q-pt-none">
                  <div class="q-mb-md rounded-borders bg-black q-pa-md border-grey">
                      <div class="text-grey-5 text-caption">Total Amount</div>
                      <div class="text-h4 text-positive">Rs. {{ selectedPayment?.amount }}</div>
                  </div>

                  <q-form @submit="processPayment">
                      <div class="text-subtitle2 q-mb-sm">Card Details (Mockup)</div>
                      <q-input 
                        v-model="paymentForm.cardNumber" 
                        label="Card Number" 
                        dark 
                        outlined 
                        dense 
                        class="q-mb-md" 
                        mask="#### #### #### ####"
                        placeholder="0000 0000 0000 0000"
                        :rules="[val => !!val || 'Required']"
                      />
                      <div class="row q-col-gutter-md">
                          <div class="col-6">
                              <q-input 
                                v-model="paymentForm.expiry" 
                                label="Valid Thru" 
                                dark 
                                outlined 
                                dense 
                                mask="##/##"
                                placeholder="MM/YY"
                                :rules="[val => !!val || 'Required']"
                              />
                          </div>
                          <div class="col-6">
                              <q-input 
                                v-model="paymentForm.cvc" 
                                label="CVC" 
                                dark 
                                outlined 
                                dense 
                                mask="###"
                                placeholder="123"
                                :rules="[val => !!val || 'Required']"
                              />
                          </div>
                      </div>
                      
                      <div class="q-mt-lg row justify-end q-gutter-sm">
                          <q-btn flat label="Cancel" color="grey" v-close-popup />
                          <q-btn unelevated label="Process Payment" color="primary" type="submit" :loading="paying" />
                      </div>
                  </q-form>
              </q-card-section>
          </q-card>
       </q-dialog>

      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from 'boot/supabase'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const loading = ref(true)
const paying = ref(false)
const payments = ref([])

// Payment State
const paymentDialog = ref(false)
const selectedPayment = ref(null)
const paymentForm = ref({
    cardNumber: '',
    expiry: '',
    cvc: ''
})

const columns = [
  { name: 'subject', label: 'Class / Subject', align: 'left', field: row => row.classes?.subject },
  { name: 'month', label: 'Month', align: 'left', field: 'month' },
  { name: 'amount', label: 'Amount (Rs)', align: 'right', field: 'amount' },
  { name: 'payment_date', label: 'Date', align: 'left', field: 'payment_date' },
  { name: 'status', label: 'Status', align: 'center', field: 'status' },
  { name: 'actions', label: '', align: 'left' }
]

onMounted(() => {
    fetchData()
})

const fetchData = async () => {
    loading.value = true
    try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('Not authenticated')

        // Fetch Student ID
        const { data: student } = await supabase
            .from('students')
            .select('id')
            .eq('email', user.email)
            .maybeSingle()
        
        if (student) {
             const { data, error } = await supabase
            .from('payments')
            .select(`
                id,
                amount,
                payment_date,
                status,
                month,
                classes (
                    subject
                )
            `)
            .eq('student_id', student.id)
            .order('payment_date', { ascending: false })

            if (error) throw error
            payments.value = data
        }

    } catch (error) {
        console.error(error)
        $q.notify({ type: 'negative', message: 'Failed to load payments' })
    } finally {
        loading.value = false
    }
}

const openPaymentDialog = (payment) => {
    selectedPayment.value = payment
    paymentForm.value = { cardNumber: '', expiry: '', cvc: '' }
    paymentDialog.value = true
}

const processPayment = async () => {
    if (!selectedPayment.value) return
    paying.value = true

    try {
        const { error } = await supabase
            .from('payments')
            .update({
                status: 'Paid',
                payment_date: new Date().toISOString()
            })
            .eq('id', selectedPayment.value.id)
        
        if (error) throw error

        $q.notify({ type: 'positive', message: 'Payment successful!' })
        // Update local state
        const index = payments.value.findIndex(p => p.id === selectedPayment.value.id)
        if (index !== -1) {
            payments.value[index].status = 'Paid'
            payments.value[index].payment_date = new Date().toISOString()
        }
        paymentDialog.value = false

    } catch (error) {
        console.error(error)
        $q.notify({ type: 'negative', message: 'Payment failed' })
    } finally {
        paying.value = false
    }
}

const formatDate = (dateStr) => {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleDateString()
}
</script>

<style scoped>
.container {
    max-width: 1200px;
    margin: 0 auto;
}
.card-border {
    border: 1px solid rgba(255,255,255,0.1);
}
</style>
