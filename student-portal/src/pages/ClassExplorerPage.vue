<template>
  <q-page class="q-pa-md bg-black text-white">
    <div class="container">
      <div class="row items-center q-mb-lg">
        <div class="col">
          <h1 class="text-h4 text-weight-bold q-my-none">Class Explorer</h1>
          <div class="text-grey-5">Discover and join new tuition classes</div>
        </div>
         <div class="col-auto">
             <q-btn icon="refresh" flat round color="white" @click="fetchData" :loading="loading" />
         </div>
      </div>

      <!-- Search -->
       <q-input 
          v-model="search" 
          dark 
          outlined 
          dense 
          class="q-mb-lg bg-grey-10" 
          placeholder="Search by subject or teacher..."
          debounce="300"
       >
          <template v-slot:prepend>
             <q-icon name="search" color="grey-6" />
          </template>
       </q-input>

      <div v-if="loading" class="row justify-center q-pt-xl">
          <q-spinner color="primary" size="3em" />
      </div>

      <div v-else class="row q-col-gutter-lg">
        <div v-for="cls in filteredClasses" :key="cls.id" class="col-12 col-sm-6 col-md-4">
          <q-card class="bg-grey-10 text-white shadow-3 card-border column h-100">
             <!-- Image Section -->
             <q-img 
              :src="cls.image_url" 
              :ratio="16/9"
              class="col-auto"
            >
              <template v-slot:error>
                <div class="absolute-full flex flex-center bg-grey-9 text-grey-7">
                  <q-icon name="image_not_supported" size="50px" />
                </div>
              </template>
              <div class="absolute-bottom text-subtitle1 text-weight-bold">
                {{ cls.subject }}
              </div>
            </q-img>

            <q-card-section class="col">
                <div class="row items-center q-mb-sm">
                   <q-icon name="schedule" size="sm" color="grey-5" class="q-mr-sm" />
                   <div class="text-caption text-grey-4">{{ cls.day_of_week }} at {{ cls.start_time }} - {{ cls.end_time }}</div>
                </div>
                 <div class="row items-center">
                   <q-icon name="payments" size="sm" color="positive" class="q-mr-sm" />
                   <div class="text-subtitle2 text-positive">Rs. {{ cls.fee }} / month</div>
                </div>
            </q-card-section>
            
            <q-separator dark />

             <q-card-actions align="right" class="q-pa-md">
               <q-btn flat color="grey-5" label="View" icon="visibility" :to="'/classes/' + cls.id" />
               
               <q-btn 
                v-if="isEnrolled(cls.id)"
                flat 
                color="positive" 
                icon="check_circle" 
                label="Enrolled" 
                disable
               />
               <q-btn 
                v-else
                unelevated
                color="white" 
                text-color="black"
                label="Enroll Now" 
                @click="openPaymentDialog(cls)"
               />
             </q-card-actions>
          </q-card>
        </div>
      </div>
       
       <div v-if="!loading && filteredClasses.length === 0" class="text-center text-grey-5 q-mt-xl">
          <q-icon name="search_off" size="4em" />
          <div class="text-h6 q-mt-sm">No classes found</div>
       </div>

       <!-- Payment Dialog -->
       <q-dialog v-model="paymentDialog" persistent>
          <q-card class="bg-grey-9 text-white" style="width: 100%; max-width: 500px">
              <q-card-section>
                  <div class="text-h6">Enroll & Pay</div>
                  <div class="text-subtitle2">{{ selectedClass?.subject }}</div>
              </q-card-section>

              <q-card-section class="q-pt-none">
                  <div class="q-mb-md rounded-borders bg-black q-pa-md border-grey">
                      <div class="text-grey-5 text-caption">Total Amount</div>
                      <div class="text-h4 text-positive">Rs. {{ selectedClass?.fee }}</div>
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
                          <q-btn outline label="Pay Later" color="warning" :loading="enrolling" @click="processPayment('Pending')" />
                          <q-btn unelevated label="Pay & Enroll" color="primary" type="submit" :loading="enrolling" />
                      </div>
                  </q-form>
              </q-card-section>
          </q-card>
       </q-dialog>

    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { supabase } from 'boot/supabase'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const loading = ref(true)
const enrolling = ref(false)
const classes = ref([])
const enrolledClassIds = ref(new Set())
const search = ref('')
const studentId = ref(null)

// Payment State
const paymentDialog = ref(false)
const selectedClass = ref(null)
const paymentForm = ref({
    cardNumber: '',
    expiry: '',
    cvc: ''
})

const filteredClasses = computed(() => {
    if (!search.value) return classes.value
    const term = search.value.toLowerCase()
    return classes.value.filter(c => 
        c.subject.toLowerCase().includes(term)
    )
})

onMounted(() => {
    fetchData()
})

const fetchData = async () => {
    loading.value = true
    try {
        // 1. Get User Email
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('Not authenticated')

        // 2. Get Student ID
        let { data: student } = await supabase
            .from('students')
            .select('id')
            .eq('email', user.email)
            .maybeSingle()
        
        if (!student) {
            console.log('Student record missing, attempting to create...')
            // Auto-create student record from profile or metadata
            const { data: profile } = await supabase
                .from('profiles')
                .select('full_name, phone, address')
                .eq('id', user.id)
                .single()
            
            const newStudent = {
                email: user.email,
                full_name: profile?.full_name || user.user_metadata?.full_name || 'New Student',
                phone: profile?.phone || '',
                address: profile?.address || ''
            }

            const { data: createdStudent, error: createError } = await supabase
                .from('students')
                .insert([newStudent])
                .select()
                .single()
            
            if (createError) {
                console.error('Failed to auto-create student:', createError)
                $q.notify({ type: 'negative', message: 'Could not initialize student profile.' })
                return
            }
            student = createdStudent
            $q.notify({ type: 'positive', message: 'Student profile initialized.' })
        }
        
        studentId.value = student?.id

        // 3. Get All Classes
        const { data: allClasses, error: cError } = await supabase
            .from('classes')
            .select('*')
            .order('subject')
        
        if (cError) throw cError
        classes.value = allClasses

        // 4. Get Enrollments
        if (studentId.value) {
            const { data: enrollments, error: eError } = await supabase
                .from('enrollments')
                .select('class_id')
                .eq('student_id', studentId.value)
            
            if (eError) throw eError
            enrolledClassIds.value = new Set(enrollments.map(e => e.class_id))
        }

    } catch (error) {
        console.error(error)
        $q.notify({ type: 'negative', message: 'Failed to load classes' })
    } finally {
        loading.value = false
    }
}

const isEnrolled = (classId) => {
    return enrolledClassIds.value.has(classId)
}

const openPaymentDialog = (cls) => {
    if (!studentId.value) {
        $q.notify({ type: 'warning', message: 'Student profile not ready. Please contact admin.' })
        return
    }
    selectedClass.value = cls
    paymentForm.value = { cardNumber: '', expiry: '', cvc: '' } // Reset form
    paymentDialog.value = true
}

const processPayment = async (status = 'Paid') => {
    // If called from form submit (event), default to 'Paid'
    if (status instanceof Event) status = 'Paid'
    
    if (!selectedClass.value || !studentId.value) return
    
    enrolling.value = true
    const cls = selectedClass.value
    
    try {
        // 1. Create Enrollment
        const { error: enrollError } = await supabase
            .from('enrollments')
            .insert([{
                student_id: studentId.value,
                class_id: cls.id
            }])
        
        if (enrollError) throw enrollError

        // 2. Create Payment Record (Paid or Pending)
        const currentMonth = new Date().toLocaleString('default', { month: 'long' })
        const { error: payError } = await supabase
            .from('payments')
            .insert([{
                student_id: studentId.value,
                class_id: cls.id,
                amount: cls.fee,
                month: currentMonth,
                payment_date: new Date().toISOString(),
                status: status
            }])
        
        if (payError) {
             console.error('Payment record failed:', payError)
             $q.notify({ type: 'warning', message: 'Enrollment successful, but payment record failed.' })
        } else {
             const msg = status === 'Paid' ? `Successfully enrolled and paid for ${cls.subject}` : `Enrolled in ${cls.subject}. Payment is Pending.`
             $q.notify({ type: status === 'Paid' ? 'positive' : 'warning', message: msg })
        }

        enrolledClassIds.value.add(cls.id)
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
    max-width: 1200px;
    margin: 0 auto;
}
.card-border {
    border: 1px solid rgba(255,255,255,0.1);
}
.h-100 {
    height: 100%;
}
</style>
