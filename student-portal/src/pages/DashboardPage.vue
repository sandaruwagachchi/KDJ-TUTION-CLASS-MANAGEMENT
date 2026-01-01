<template>
  <q-page class="q-pa-md bg-black text-white">
    <div class="container">
       <div class="row items-center q-mb-lg">
        <div class="col">
          <h1 class="text-h4 text-weight-bold q-my-none">Student Dashboard</h1>
          <div class="text-grey-5">Welcome back, {{ userName }}</div>
        </div>
      </div>

      <div class="row q-col-gutter-md q-mb-lg">
         <!-- Stats Cards -->
         <div class="col-12 col-md-4">
             <q-card class="bg-grey-9 text-white shadow-3 card-border h-100 relative-position overflow-hidden">
                <q-card-section>
                   <div class="text-subtitle2 text-grey-5">Enrolled Classes</div>
                   <div v-if="loading" class="q-mt-sm"><q-skeleton type="text" width="50px" /></div>
                   <div v-else class="text-h4 text-weight-bold">{{ enrolledCount }}</div>
                </q-card-section>
                <q-icon name="school" size="80px" class="absolute-bottom-right icon-watermark" />
             </q-card>
         </div>
         <div class="col-12 col-md-4">
             <q-card class="bg-grey-9 text-white shadow-3 card-border h-100 relative-position overflow-hidden">
                <q-card-section>
                   <div class="text-subtitle2 text-grey-5">Pending Payments</div>
                   <div v-if="loading" class="q-mt-sm"><q-skeleton type="text" width="50px" /></div>
                   <div v-else class="text-h4 text-weight-bold" :class="{'text-warning': pendingCount > 0}">{{ pendingCount }}</div>
                </q-card-section>
                <q-icon name="payments" size="80px" class="absolute-bottom-right icon-watermark" />
             </q-card>
         </div>
      </div>

      <!-- Quick Links -->
      <div class="row q-gutter-md">
          <q-btn to="/classes" color="primary" label="Join New Class" icon="add" />
          <q-btn to="/my-classes" outline color="white" label="View My Schedule" icon="schedule" />
      </div>

    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from 'boot/supabase'

const loading = ref(true)
const userName = ref('Student')
const enrolledCount = ref(0)
const pendingCount = ref(0)

onMounted(async () => {
   fetchStats()
})

const fetchStats = async () => {
    loading.value = true
    try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        // Get Student Details
        const { data: student } = await supabase
            .from('students')
            .select('id, full_name')
            .eq('email', user.email)
            .maybeSingle()
        
        if (student) {
            userName.value = student.full_name

            // Count Enrollments
            const { count: eCount } = await supabase
                .from('enrollments')
                .select('*', { count: 'exact', head: true })
                .eq('student_id', student.id)
            enrolledCount.value = eCount || 0

            // Count Pending Payments
            const { count: pCount } = await supabase
                .from('payments')
                .select('*', { count: 'exact', head: true })
                .eq('student_id', student.id)
                .eq('status', 'Pending')
            pendingCount.value = pCount || 0
        } else {
             userName.value = user.user_metadata?.full_name || 'Student'
        }

    } catch (e) {
        console.error(e)
    } finally {
        loading.value = false
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
.icon-watermark {
    opacity: 0.05;
    transform: translate(20%, 20%);
}
.h-100 {
    height: 100%;
}
</style>
