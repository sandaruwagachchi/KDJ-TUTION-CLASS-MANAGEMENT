<template>
  <q-page class="bg-black text-white q-pa-md">
    <div class="container" v-if="classDetails">
      <!-- Back Button -->
      <q-btn flat icon="arrow_back" label="Back to Classes" color="grey-5" @click="$router.push('/classes')" class="q-mb-md" />

      <div class="row q-col-gutter-lg">
        <!-- Main Image -->
        <div class="col-12 col-md-8">
           <q-card class="bg-grey-10 shadow-10 card-border overflow-hidden">
               <q-img :src="classDetails.image_url" :ratio="16/9" class="rounded-borders">
                   <div class="absolute-bottom text-h5 text-weight-bold q-pa-md">
                       {{ classDetails.subject }}
                   </div>
               </q-img>
               <q-card-section>
                   <div class="row items-center q-mb-md">
                       <q-chip color="primary" text-color="white" icon="star">
                           {{ classDetails.grade }}
                       </q-chip>
                       <q-chip color="grey-8" text-color="white" icon="schedule">
                           {{ classDetails.day_of_week }} | {{ classDetails.start_time }} - {{ classDetails.end_time }}
                       </q-chip>
                   </div>
                   
                   <div class="text-h6 q-mb-sm text-grey-3">About this Class</div>
                   <div class="text-body1 text-grey-5" style="white-space: pre-line;">
                       {{ classDetails.description || 'No description available for this class.' }}
                   </div>
               </q-card-section>
           </q-card>
        </div>

        <!-- Sidebar / Actions -->
        <div class="col-12 col-md-4">
            <q-card class="bg-grey-10 text-white shadow-10 card-border q-mb-md sticky-sidebar">
                <q-card-section>
                    <div class="text-subtitle1 text-grey-5">Monthly Fee</div>
                    <div class="text-h3 text-primary text-weight-bold q-mb-md">
                        Rs. {{ classDetails.fee }}
                    </div>
                    
                    <q-separator dark class="q-mb-md" />

                    <div v-if="isEnrolled" class="full-width">
                        <q-btn 
                            label="Enrolled" 
                            color="positive" 
                            icon="check_circle" 
                            unelevated 
                            class="full-width q-py-sm" 
                            disable
                        />
                         <div class="text-center q-mt-sm text-caption text-grey-5">
                            You are already a student of this class.
                        </div>
                    </div>
                    
                    <div v-else class="q-gutter-y-sm">
                        <q-btn 
                            label="Enroll & Pay Now" 
                            color="primary" 
                            unelevated 
                            class="full-width q-py-sm text-weight-bold" 
                            icon="payments"
                            @click="openPaymentDialog('Paid')"
                        />
                        <q-btn 
                            label="Enroll & Pay Later" 
                            color="warning" 
                            outline 
                            class="full-width q-py-sm text-weight-bold" 
                            icon="history"
                            @click="openPaymentDialog('Pending')"
                        />
                    </div>
                </q-card-section>
            </q-card>
        </div>
      </div>

       <!-- Payment Dialog (Reused Logic) -->
       <q-dialog v-model="paymentDialog" persistent>
          <q-card class="bg-grey-9 text-white" style="width: 100%; max-width: 500px">
              <q-card-section>
                  <div class="text-h6">Enrollment</div>
                  <div class="text-subtitle2">{{ classDetails.subject }}</div>
              </q-card-section>

              <q-card-section class="q-pt-none">
                  <div class="q-mb-md rounded-borders bg-black q-pa-md border-grey">
                      <div class="text-grey-5 text-caption">Total Amount</div>
                      <div class="text-h4 text-positive">Rs. {{ classDetails.fee }}</div>
                      <div class="text-caption text-warning" v-if="detailsPaymentStatus === 'Pending'">
                          * Payment will be marked as Pending
                      </div>
                  </div>

                  <q-form @submit="processPayment">
                      <div v-if="detailsPaymentStatus === 'Paid'">
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
                                  <q-input v-model="paymentForm.expiry" label="Valid Thru" dark outlined dense mask="##/##" placeholder="MM/YY" :rules="[val => !!val || 'Required']" />
                              </div>
                              <div class="col-6">
                                  <q-input v-model="paymentForm.cvc" label="CVC" dark outlined dense mask="###" placeholder="123" :rules="[val => !!val || 'Required']" />
                              </div>
                          </div>
                      </div>
                      
                      <div class="q-mt-lg row justify-end q-gutter-sm">
                          <q-btn flat label="Cancel" color="grey" v-close-popup />
                          <q-btn 
                            unelevated 
                            :label="detailsPaymentStatus === 'Paid' ? 'Pay & Enroll' : 'Confirm Enrollment'" 
                            :color="detailsPaymentStatus === 'Paid' ? 'primary' : 'warning'" 
                            type="submit" 
                            :loading="enrolling" 
                          />
                      </div>
                  </q-form>
              </q-card-section>
          </q-card>
       </q-dialog>

    </div>
    
    <div v-else-if="loading" class="flex flex-center" style="height: 50vh">
        <q-spinner color="primary" size="3em" />
    </div>
    
    <div v-else class="text-center q-pa-xl">
        <div class="text-h5 text-grey-5">Class not found</div>
        <q-btn flat color="primary" label="Go Back" to="/classes" />
    </div>

  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { supabase } from 'boot/supabase'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const route = useRoute()

const loading = ref(true)
const enrolling = ref(false)
const classDetails = ref(null)
const isEnrolled = ref(false)
const studentId = ref(null)

// Payment State
const paymentDialog = ref(false)
const detailsPaymentStatus = ref('Paid')
const paymentForm = ref({ cardNumber: '', expiry: '', cvc: '' })

onMounted(async () => {
    await fetchData()
})

const fetchData = async () => {
    loading.value = true
    try {
        const { id } = route.params
        if (!id) throw new Error('No ID provided')

        const { data: { user } } = await supabase.auth.getUser()
        
        // 1. Fetch Class Details
        const { data: cls, error } = await supabase
            .from('classes')
            .select('*')
            .eq('id', id)
            .single()
        
        if (error) throw error
        classDetails.value = cls

        if (user) {
            // 2. Get Student ID
            const { data: student } = await supabase
                .from('students')
                .select('id')
                .eq('email', user.email)
                .maybeSingle()
            
            studentId.value = student?.id

            // 3. Check Enrollment
            if (studentId.value) {
                const { data: enrollment } = await supabase
                    .from('enrollments')
                    .select('id')
                    .eq('student_id', studentId.value)
                    .eq('class_id', id)
                    .maybeSingle()
                
                isEnrolled.value = !!enrollment
            }
        }

    } catch (error) {
        console.error(error)
        $q.notify({ type: 'negative', message: 'Failed to load class details' })
    } finally {
        loading.value = false
    }
}

const openPaymentDialog = (status) => {
    if (!studentId.value) {
         // Auto-create logic could be reused here, but for now warning
         $q.notify({ type: 'warning', message: 'Student profile incomplete. Please contact admin.' })
         return
    }
    detailsPaymentStatus.value = status
    paymentForm.value = { cardNumber: '', expiry: '', cvc: '' }
    paymentDialog.value = true
}

const processPayment = async () => {
    enrolling.value = true
    const status = detailsPaymentStatus.value
    
    try {
        // 1. Create Enrollment
        const { error: enrollError } = await supabase
            .from('enrollments')
            .insert([{
                student_id: studentId.value,
                class_id: classDetails.value.id
            }])
        if (enrollError) throw enrollError

        // 2. Create Payment Record
        const currentMonth = new Date().toLocaleString('default', { month: 'long' })
        const { error: payError } = await supabase
            .from('payments')
            .insert([{
                student_id: studentId.value,
                class_id: classDetails.value.id,
                amount: classDetails.value.fee,
                month: currentMonth,
                payment_date: new Date().toISOString(),
                status: status
            }])
        
        if (payError) {
             console.error(payError)
             $q.notify({ type: 'warning', message: 'Enrolled, but payment record failed.' })
        } else {
             const msg = status === 'Paid' ? `Successfully enrolled and paid!` : `Enrolled successfully. Payment is Pending.`
             $q.notify({ type: status === 'Paid' ? 'positive' : 'warning', message: msg })
        }

        isEnrolled.value = true
        paymentDialog.value = false

    } catch (error) {
        console.error(error)
        $q.notify({ type: 'negative', message: 'Enrollment failed' })
    } finally {
        enrolling.value = false
    }
}
</script>

<style scoped>
.container {
    max-width: 1000px;
    margin: 0 auto;
}
.card-border {
    border: 1px solid rgba(255,255,255,0.1);
}
.sticky-sidebar {
    position: sticky;
    top: 20px;
}
</style>
