<template>
  <q-page class="q-pa-md bg-black text-white">
    <div class="container">
      <div class="row items-center q-mb-lg">
        <div class="col">
          <h1 class="text-h4 text-weight-bold q-my-none">My Classes</h1>
          <div class="text-grey-5">Manage your enrolled subjects</div>
        </div>
         <div class="col-auto">
             <q-btn icon="refresh" flat round color="white" @click="fetchData" :loading="loading" />
         </div>
      </div>

       <div v-if="loading" class="row justify-center q-pt-xl">
          <q-spinner color="primary" size="3em" />
      </div>

      <div v-else class="row q-col-gutter-lg">
        <div v-for="item in enrollments" :key="item.id" class="col-12 col-sm-6 col-md-4">
          <q-card class="bg-grey-10 text-white shadow-3 card-border column h-100">
             <!-- Image Section -->
             <q-img 
              :src="item.classes?.image_url" 
              :ratio="16/9"
              class="col-auto"
            >
              <template v-slot:error>
                <div class="absolute-full flex flex-center bg-grey-9 text-grey-7">
                  <q-icon name="image_not_supported" size="50px" />
                </div>
              </template>
              <div class="absolute-bottom text-subtitle1 text-weight-bold">
                {{ item.classes?.subject }}
              </div>
            </q-img>

            <q-card-section class="col">
                <div class="row items-center q-mb-sm">
                   <q-icon name="schedule" size="sm" color="grey-5" class="q-mr-sm" />
                   <div class="text-caption text-grey-4">{{ item.classes?.day_of_week }} at {{ item.classes?.start_time }} - {{ item.classes?.end_time }}</div>
                </div>
                 <div class="text-caption text-grey-6 q-mt-md">
                    Enrolled on {{ new Date(item.enrolled_at).toLocaleDateString() }}
                 </div>
            </q-card-section>
            
            <q-separator dark />

            <q-card-actions align="right" class="q-pa-md">
                <q-btn 
                flat
                color="negative" 
                icon="logout"
                label="Unenroll" 
                @click="confirmUnenroll(item)"
               />
               <q-btn 
                unelevated
                color="white" 
                text-color="black"
                label="View Details" 
                :to="'/classes/' + item.classes?.id"
               />
            </q-card-actions>
          </q-card>
        </div>
      </div>
       
       <div v-if="!loading && enrollments.length === 0" class="text-center text-grey-5 q-mt-xl">
          <div class="column flex-center">
             <q-icon name="school" size="4em" class="q-mb-md opacity-50" />
             <div class="text-h6">You haven't enrolled in any classes yet.</div>
             <q-btn to="/classes" label="Explore Classes" color="primary" flat class="q-mt-sm" />
          </div>
       </div>

       <!-- Unenroll Dialog -->
       <q-dialog v-model="unenrollDialog" persistent>
         <q-card class="bg-grey-9 text-white">
           <q-card-section class="row items-center">
             <q-avatar icon="warning" color="negative" text-color="white" />
             <span class="q-ml-sm">Are you sure you want to unenroll from {{ selectedEnrollment?.classes?.subject }}?</span>
           </q-card-section>
           <q-card-actions align="right">
             <q-btn flat label="Cancel" color="grey" v-close-popup />
             <q-btn flat label="Unenroll" color="negative" @click="unenroll" :loading="unenrolling" />
           </q-card-actions>
         </q-card>
       </q-dialog>

    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from 'boot/supabase'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const loading = ref(true)
const enrollments = ref([])
const unenrollDialog = ref(false)
const selectedEnrollment = ref(null)
const unenrolling = ref(false)

onMounted(() => {
    fetchData()
})

const fetchData = async () => {
    loading.value = true
    try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('Not authenticated')

        // Fetch enrollments with class details
        // We join enrollments -> classes and filter by student email indirectly 
        // OR better: first get student ID then fetch enrollments
        
        const { data: student } = await supabase
            .from('students')
            .select('id')
            .eq('email', user.email)
            .maybeSingle()
        
        if (student) {
            const { data, error } = await supabase
            .from('enrollments')
            .select(`
                id,
                enrolled_at,
                classes (
                    id,
                    subject,
                    day_of_week,
                    start_time,
                    end_time,
                    image_url,
                    fee
                )
            `)
            .eq('student_id', student.id)
            .order('enrolled_at', { ascending: false })

            if (error) throw error
            enrollments.value = data
        }

    } catch (error) {
        console.error(error)
        $q.notify({ type: 'negative', message: 'Failed to load your classes' })
    } finally {
        loading.value = false
    }
}

const confirmUnenroll = (item) => {
    selectedEnrollment.value = item
    unenrollDialog.value = true
}

const unenroll = async () => {
    if (!selectedEnrollment.value) return
    unenrolling.value = true
    try {
        const { error } = await supabase
            .from('enrollments')
            .delete()
            .eq('id', selectedEnrollment.value.id) // This relies on RLS allowing delete of own enrollment OR we need a policy
        
        if (error) throw error

        $q.notify({ type: 'positive', message: 'Unenrolled successfully' })
        unenrollDialog.value = false
        fetchData()
    } catch (error) {
        console.error(error)
        $q.notify({ type: 'negative', message: 'Failed to unenroll' })
    } finally {
        unenrolling.value = false
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
.opacity-50 {
    opacity: 0.5;
}
</style>
