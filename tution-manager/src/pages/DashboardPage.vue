<template>
  <q-page class="q-pa-md bg-grey-10">
    <div class="row q-col-gutter-lg">
      <!-- Stats Cards -->
      <div class="col-12 col-sm-6 col-md-4">
        <q-card class="text-white shadow-10 card-border h-100 relative-position overflow-hidden bg-gradient-1">
          <q-card-section>
            <div class="text-subtitle2 text-grey-3">Total Students</div>
            <div class="text-h3 text-weight-bold q-mt-sm">{{ studentsCount }}</div>
            <div class="text-subtitle2 text-grey-2">Active enrollments</div>
          </q-card-section>
          <q-icon name="people" class="absolute-bottom-right icon-watermark" size="80px" />
        </q-card>
      </div>

      <div class="col-12 col-sm-6 col-md-4">
        <q-card class="text-white shadow-10 card-border h-100 relative-position overflow-hidden bg-gradient-2">
          <q-card-section>
            <div class="text-subtitle2 text-grey-3">Active Classes</div>
            <div class="text-h3 text-weight-bold q-mt-sm">{{ classesCount }}</div>
            <div class="text-subtitle2 text-grey-2">Scheduled sessions</div>
          </q-card-section>
          <q-icon name="class" class="absolute-bottom-right icon-watermark" size="80px" />
        </q-card>
      </div>

      <div class="col-12 col-sm-6 col-md-4">
        <q-card class="text-white shadow-10 card-border h-100 relative-position overflow-hidden bg-gradient-3">
          <q-card-section>
            <div class="text-subtitle2 text-grey-3">Total Income</div>
            <div class="text-h3 text-weight-bold q-mt-sm">{{ formatCurrency(totalIncome) }}</div>
            <div class="text-subtitle2 text-grey-2">Lifetime earnings</div>
          </q-card-section>
           <q-icon name="payments" class="absolute-bottom-right icon-watermark" size="80px" />
        </q-card>
      </div>

      <!-- Recent Students -->
      <div class="col-12 col-md-8">
        <q-card class="bg-grey-9 text-white shadow-10 full-height card-border">
          <q-card-section>
            <div class="text-h6">Recent Students</div>
            <div class="text-caption text-grey-5">Latest student registrations</div>
          </q-card-section>
          <q-card-section class="q-pa-none">
            <q-list separator dark class="rounded-borders">
               <q-item v-for="student in recentStudents" :key="student.id" v-ripple class="item-hover">
                 <q-item-section avatar>
                   <q-avatar color="primary" text-color="white">{{ student.full_name.charAt(0).toUpperCase() }}</q-avatar>
                 </q-item-section>
                 <q-item-section>
                   <q-item-label>{{ student.full_name }}</q-item-label>
                   <q-item-label caption class="text-grey-5">{{ student.email }}</q-item-label>
                 </q-item-section>
                 <q-item-section side>
                   <div class="row items-center">
                       <q-badge color="grey-8">{{ new Date(student.created_at).toLocaleDateString() }}</q-badge>
                   </div>
                 </q-item-section>
               </q-item>
               
               <div v-if="recentStudents.length === 0" class="text-center q-pa-md text-grey">
                   No recent students found
               </div>
            </q-list>
          </q-card-section>
        </q-card>
      </div>

      <!-- Quick Actions -->
      <div class="col-12 col-md-4">
        <q-card class="bg-grey-9 text-white shadow-10 full-height card-border">
          <q-card-section>
             <div class="text-h6">Quick Actions</div>
             <div class="text-caption text-grey-5">Common management tasks</div>
          </q-card-section>
          <q-separator dark />
          <q-card-section class="q-gutter-y-md">
            <q-btn to="/students" color="primary" icon="add" label="Add New Student" class="full-width text-left" align="left" size="lg" outline padding="md" />
            <q-btn to="/classes" color="secondary" icon="school" label="Create Class" class="full-width text-left" align="left" size="lg" outline padding="md" />
            <q-btn to="/payments" color="positive" icon="attach_money" label="Record Payment" class="full-width text-left" align="left" size="lg" outline padding="md" />
             <q-btn to="/reports" color="info" icon="analytics" label="View Reports" class="full-width text-left" align="left" size="lg" outline padding="md" />
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from 'boot/supabase'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const studentsCount = ref(0)
const classesCount = ref(0)
const totalIncome = ref(0)
const recentStudents = ref([])

onMounted(async () => {
  await fetchDashboardData()
})

const fetchDashboardData = async () => {
    try {
        // Fetch Students Count
        const { count: sCount } = await supabase.from('students').select('*', { count: 'exact', head: true })
        studentsCount.value = sCount || 0

        // Fetch Classes Count
        const { count: cCount } = await supabase.from('classes').select('*', { count: 'exact', head: true })
        classesCount.value = cCount || 0

        // Fetch Payments (Total Income)
        const { data: payments } = await supabase.from('payments').select('amount, status')
        if (payments) {
            totalIncome.value = payments.reduce((sum, p) => p.status === 'Paid' ? sum + p.amount : sum, 0)
        }

        // Fetch Recent Students
        const { data: rStudents } = await supabase
            .from('students')
            .select('id, full_name, email, created_at')
            .order('created_at', { ascending: false })
            .limit(5)
        
        recentStudents.value = rStudents || []
        
    } catch (error) {
        console.error('Error fetching dashboard data:', error)
        $q.notify({ type: 'negative', message: 'Failed to load dashboard data' })
    }
}

const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR', maximumFractionDigits: 0 }).format(val)
}
</script>

<style scoped>
.card-border {
    border: 1px solid rgba(255,255,255,0.1);
}

.item-hover:hover {
    background: rgba(255,255,255,0.05);
}

.icon-watermark {
    opacity: 0.15;
    transform: translate(20%, 20%);
}

.bg-gradient-1 {
    background: linear-gradient(135deg, #1A2980 0%, #26D0CE 100%);
}
.bg-gradient-2 {
    background: linear-gradient(135deg, #e52d27 0%, #b31217 100%);
}
.bg-gradient-3 {
    background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
}

.h-100 {
    height: 100%;
}
</style>
