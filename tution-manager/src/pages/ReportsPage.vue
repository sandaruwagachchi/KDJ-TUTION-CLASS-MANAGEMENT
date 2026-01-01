<template>
  <q-page class="bg-black text-white q-pa-md">
    <div class="container">
      <div class="row items-center q-mb-lg">
        <div class="col">
          <h1 class="text-h4 text-weight-bold q-my-none">Reports</h1>
          <div class="text-grey-5">Financial and class performance analytics</div>
        </div>
        <div class="col-auto">
             <q-btn icon="refresh" flat round color="white" @click="fetchData" :loading="loading" />
        </div>
      </div>

      <!-- Summary Cards -->
      <div class="row q-col-gutter-md q-mb-lg">
        <div class="col-12 col-md-3">
          <q-card class="text-white shadow-10 card-border h-100 relative-position overflow-hidden bg-gradient-1">
            <q-card-section>
              <div class="text-subtitle2 text-grey-3">Total Income</div>
              <div class="text-h4 text-weight-bold q-mt-sm">{{ formatCurrency(totalIncome) }}</div>
            </q-card-section>
            <q-icon name="payments" size="80px" class="absolute-bottom-right icon-watermark" />
          </q-card>
        </div>
        <div class="col-12 col-md-3">
          <q-card class="text-white shadow-10 card-border h-100 relative-position overflow-hidden bg-gradient-2">
            <q-card-section>
              <div class="text-subtitle2 text-grey-3">Pending Payments</div>
              <div class="text-h4 text-weight-bold q-mt-sm">{{ pendingPaymentsCount }}</div>
              <div class="text-caption text-grey-2">{{ formatCurrency(pendingAmount) }} outstanding</div>
            </q-card-section>
            <q-icon name="assignment_late" size="80px" class="absolute-bottom-right icon-watermark" />
          </q-card>
        </div>
        <div class="col-12 col-md-3">
          <q-card class="text-white shadow-10 card-border h-100 relative-position overflow-hidden bg-gradient-3">
             <q-card-section>
              <div class="text-subtitle2 text-grey-3">This Month</div>
              <div class="text-h4 text-weight-bold q-mt-sm">{{ formatCurrency(thisMonthIncome) }}</div>
            </q-card-section>
            <q-icon name="trending_up" size="80px" class="absolute-bottom-right icon-watermark" />
          </q-card>
        </div>
         <div class="col-12 col-md-3">
          <q-card class="text-white shadow-10 card-border h-100 relative-position overflow-hidden bg-gradient-4">
             <q-card-section>
              <div class="text-subtitle2 text-grey-3">Total Students</div>
              <div class="text-h4 text-weight-bold q-mt-sm">{{ totalStudents }}</div>
            </q-card-section>
            <q-icon name="groups" size="80px" class="absolute-bottom-right icon-watermark" />
          </q-card>
        </div>
      </div>

      <!-- Charts Section -->
      <div class="row q-col-gutter-lg q-mb-lg">
        <!-- Revenue by Class -->
        <div class="col-12 col-md-8">
           <q-card class="bg-grey-10 text-white shadow-5 card-border q-pa-md">
              <div class="text-h6 q-mb-md">Revenue by Class</div>
              <div v-if="!loading">
                 <apexchart type="bar" height="350" :options="barOptions" :series="barSeries"></apexchart>
              </div>
              <div v-else class="row justify-center items-center" style="height: 350px">
                  <q-spinner color="white" size="3em" />
              </div>
           </q-card>
        </div>

        <!-- Payment Status -->
        <div class="col-12 col-md-4">
           <q-card class="bg-grey-10 text-white shadow-5 card-border q-pa-md h-100 column">
              <div class="text-h6 q-mb-md">Payment Status</div>
               <div v-if="!loading" class="col row justify-center items-center">
                 <apexchart type="donut" width="320" :options="donutOptions" :series="donutSeries"></apexchart>
              </div>
               <div v-else class="col row justify-center items-center">
                  <q-spinner color="white" size="3em" />
              </div>
           </q-card>
        </div>
      </div>

    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { supabase } from 'boot/supabase'
const loading = ref(true)
const payments = ref([])
const classes = ref([])

const totalIncome = ref(0)
const pendingPaymentsCount = ref(0)
const pendingAmount = ref(0)
const thisMonthIncome = ref(0)
const totalStudents = ref(0)

const barSeries = ref([])
const donutSeries = ref([])

const barOptions = computed(() => ({
  chart: { type: 'bar', toolbar: { show: false }, background: 'transparent' },
  colors: ['#ffffff'],
  plotOptions: { bar: { borderRadius: 4, horizontal: false, columnWidth: '40%' } },
  dataLabels: { enabled: false },
  xaxis: {
    categories: classes.value.map(c => c.subject),
    labels: { style: { colors: '#9e9e9e' } }
  },
  yaxis: { labels: { style: { colors: '#9e9e9e' }, formatter: (val) => `Rs. ${val}` } },
  tooltip: { theme: 'dark' },
  grid: { borderColor: '#333' }
}))

const donutOptions = computed(() => ({
  chart: { type: 'donut', background: 'transparent' },
  labels: ['Paid', 'Pending'],
  colors: ['#21BA45', '#F2C037'], // Green, Orange
  legend: { position: 'bottom', labels: { colors: '#fff' } },
  plotOptions: { pie: { donut: { labels: { show: true, total: { show: true, label: 'Total', color: '#fff' }, value: { color: '#fff' } } } } },
  dataLabels: { enabled: false },
  stroke: { show: false }
}))

onMounted(() => {
    fetchData()
})

const fetchData = async () => {
    loading.value = true
    try {
        const [pRes, sRes, cRes] = await Promise.all([
            supabase.from('payments').select('*'),
            supabase.from('students').select('id', { count: 'exact' }),
            supabase.from('classes').select('id, subject')
        ])

        if (pRes.error) throw pRes.error
        if (sRes.error) throw sRes.error
        if (cRes.error) throw cRes.error

        payments.value = pRes.data
        totalStudents.value = sRes.count
        classes.value = cRes.data

        calculateMetrics()
        prepareCharts()
    } catch (e) {
        console.error(e)
    } finally {
        loading.value = false
    }
}

const calculateMetrics = () => {
    const currentMonth = new Date().toLocaleString('default', { month: 'long' })
    const currentYear = new Date().getFullYear()

    totalIncome.value = payments.value.reduce((sum, p) => p.status === 'Paid' ? sum + p.amount : sum, 0)
    
    const pending = payments.value.filter(p => p.status === 'Pending')
    pendingPaymentsCount.value = pending.length
    pendingAmount.value = pending.reduce((sum, p) => sum + p.amount, 0)

    thisMonthIncome.value = payments.value
        .filter(p => p.month === currentMonth && p.year == currentYear && p.status === 'Paid')
        .reduce((sum, p) => sum + p.amount, 0)
}

const prepareCharts = () => {
    // Bar Chart: Revenue by Class
    const classRevenue = {}
    classes.value.forEach(c => classRevenue[c.id] = 0)
    
    payments.value.forEach(p => {
        if (p.status === 'Paid' && classRevenue[p.class_id] !== undefined) {
             classRevenue[p.class_id] += p.amount
        }
    })

    barSeries.value = [{
        name: 'Revenue',
        data: classes.value.map(c => classRevenue[c.id])
    }]

    // Donut Chart: Status
    const paidCount = payments.value.filter(p => p.status === 'Paid').length
    const pendingCount = payments.value.filter(p => p.status === 'Pending').length
    donutSeries.value = [paidCount, pendingCount]
}

const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR' }).format(val)
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
.bg-gradient-4 {
    background: linear-gradient(135deg, #8E2DE2 0%, #4A00E0 100%);
}
.h-100 {
    height: 100%;
}
</style>
