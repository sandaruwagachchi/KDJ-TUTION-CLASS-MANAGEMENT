<template>
  <q-page class="bg-black text-white q-pa-md">
    <div class="container">
      <div class="row items-center q-mb-lg">
        <div class="col">
          <h1 class="text-h4 text-weight-bold q-my-none">Payments</h1>
          <div class="text-grey-5">Track student tuition fees</div>
        </div>
        <div class="col-auto">
          <q-btn color="white" text-color="black" icon="add" label="Record Payment" @click="openDialog()" class="text-weight-bold" />
        </div>
      </div>

       <!-- Search & Filter -->
       <q-card class="bg-grey-10 text-white shadow-5 card-border q-mb-md">
          <q-card-section>
             <q-input 
                v-model="search" 
                dark 
                borderless 
                dense 
                placeholder="Search by student or class..."
                debounce="300"
             >
                <template v-slot:prepend>
                   <q-icon name="search" color="grey-6" />
                </template>
             </q-input>
          </q-card-section>
       </q-card>

      <!-- Payments Table -->
      <q-card class="bg-grey-10 text-white shadow-10 card-border">
        <q-table
          :rows="filteredPayments"
          :columns="columns"
          row-key="id"
          dark
          class="bg-transparent no-shadow"
          :loading="loading"
          flat
          :pagination="{ rowsPerPage: 10 }"
          :grid="$q.screen.xs"
        >
          <template v-slot:item="props">
            <div class="q-pa-xs col-xs-12 col-sm-6 col-md-4">
              <q-card class="bg-grey-9 text-white shadow-3 card-border">
                <q-list dense>
                  <q-item>
                    <q-item-section>
                      <q-item-label caption class="text-grey-5">Student</q-item-label>
                      <q-item-label>{{ props.row.students?.full_name }}</q-item-label>
                    </q-item-section>
                  </q-item>
                   <q-item>
                    <q-item-section>
                      <q-item-label caption class="text-grey-5">Class</q-item-label>
                      <q-item-label>{{ props.row.classes?.subject }}</q-item-label>
                    </q-item-section>
                  </q-item>
                  <q-item>
                    <q-item-section>
                        <q-item-label caption class="text-grey-5">Amount</q-item-label>
                        <q-item-label>Rs. {{ props.row.amount }}</q-item-label>
                    </q-item-section>
                     <q-item-section side>
                        <q-chip 
                        :color="props.row.status === 'Paid' ? 'positive' : 'warning'" 
                        text-color="white" 
                        size="sm"
                        class="text-weight-bold"
                      >
                        {{ props.row.status }}
                      </q-chip>
                     </q-item-section>
                  </q-item>
                  <q-separator dark />
                  <q-item>
                    <q-item-section class="row justify-end">
                      <div class="row q-gutter-sm justify-end">
                        <q-btn flat round dense color="negative" icon="delete" @click="confirmDelete(props.row)" />
                      </div>
                    </q-item-section>
                  </q-item>
                </q-list>
              </q-card>
            </div>
          </template>

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

           <template v-slot:body-cell-actions="props">
                <q-td :props="props" class="q-gutter-sm">
                   <q-btn flat round dense color="negative" icon="delete" @click="confirmDelete(props.row)" />
                </q-td>
             </template>
        </q-table>
      </q-card>

      <!-- Add/Edit Dialog -->
      <q-dialog v-model="dialog" persistent>
        <q-card class="bg-grey-9 text-white" style="width: 100%; max-width: 500px">
          <q-card-section>
            <div class="text-h6">Record New Payment</div>
          </q-card-section>

          <q-card-section class="q-pt-none">
            <q-form @submit="savePayment" class="q-gutter-md">
              
              <q-select
                filled
                dark
                v-model="selectedStudent"
                :options="studentOptions"
                label="Student"
                option-label="full_name"
                option-value="id"
                use-input
                input-debounce="0"
                @filter="filterStudents"
                :rules="[val => !!val || 'Student is required']"
              >
                <template v-slot:option="scope">
                  <q-item v-bind="scope.itemProps">
                    <q-item-section>
                      <q-item-label>{{ scope.opt.full_name }}</q-item-label>
                      <q-item-label caption>{{ scope.opt.email }}</q-item-label>
                    </q-item-section>
                  </q-item>
                </template>
              </q-select>

              <q-select
                filled
                dark
                v-model="selectedClass"
                :options="classes"
                label="Class"
                option-label="subject"
                option-value="id"
                @update:model-value="updateAmount"
                :rules="[val => !!val || 'Class is required']"
              />

              <div class="row q-col-gutter-sm">
                 <div class="col-6">
                    <q-select filled dark v-model="form.month" :options="months" label="Month" />
                 </div>
                 <div class="col-6">
                    <q-input filled dark v-model="form.year" label="Year" type="number" />
                 </div>
              </div>

               <q-input filled dark v-model="form.amount" label="Amount (LKR)" type="number" :rules="[val => !!val || 'Amount is required']" />

               <q-select filled dark v-model="form.status" :options="['Paid', 'Pending']" label="Status" />

              <div class="row justify-end q-mt-lg">
                <q-btn flat label="Cancel" color="grey" v-close-popup />
                <q-btn label="Save Payment" color="white" text-color="black" type="submit" :loading="saving" />
              </div>
            </q-form>
          </q-card-section>
        </q-card>
      </q-dialog>

       <!-- Delete Confirmation -->
      <q-dialog v-model="deleteDialog">
        <q-card class="bg-grey-9 text-white">
          <q-card-section class="row items-center">
            <q-avatar icon="warning" color="negative" text-color="white" />
            <span class="q-ml-sm">Are you sure you want to delete this payment record?</span>
          </q-card-section>

          <q-card-actions align="right">
            <q-btn flat label="Cancel" color="grey" v-close-popup />
            <q-btn flat label="Delete" color="negative" @click="deletePayment" :loading="deleting" />
          </q-card-actions>
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
const payments = ref([])
const students = ref([])
const classes = ref([])
const studentOptions = ref([])
const loading = ref(true)
const search = ref('')

const dialog = ref(false)
const deleteDialog = ref(false)
const saving = ref(false)
const deleting = ref(false)
const deletingPayment = ref(null)

const selectedStudent = ref(null)
const selectedClass = ref(null)

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

const form = ref({
    month: months[new Date().getMonth()],
    year: new Date().getFullYear(),
    amount: '',
    status: 'Paid'
})

const columns = [
    { name: 'student', align: 'left', label: 'Student', field: row => row.students?.full_name, sortable: true },
    { name: 'class', align: 'left', label: 'Class', field: row => row.classes?.subject, sortable: true },
    { name: 'month', align: 'left', label: 'Month', field: row => `${row.month} ${row.year}` },
    { name: 'amount', align: 'right', label: 'Amount', field: row => `Rs. ${row.amount}`, sortable: true },
    { name: 'date', align: 'left', label: 'Date', field: 'payment_date', format: val => new Date(val).toLocaleDateString() },
    { name: 'status', align: 'center', label: 'Status', field: 'status' },
    { name: 'actions', align: 'right', label: '' }
]

const filteredPayments = computed(() => {
    if (!search.value) return payments.value
    const term = search.value.toLowerCase()
    return payments.value.filter(p => 
        (p.students?.full_name && p.students.full_name.toLowerCase().includes(term)) ||
        (p.classes?.subject && p.classes.subject.toLowerCase().includes(term))
    )
})

onMounted(() => {
    fetchPayments()
    fetchStudentsAndClasses()
})

const fetchPayments = async () => {
    loading.value = true
    try {
        const { data, error } = await supabase
            .from('payments')
            .select(`
                *,
                students (id, full_name),
                classes (id, subject)
            `)
            .order('payment_date', { ascending: false })
        
        if (error) throw error
        payments.value = data
    } catch (error) {
        $q.notify({ type: 'negative', message: 'Failed to fetch payments' })
        console.error(error)
    } finally {
        loading.value = false
    }
}

const fetchStudentsAndClasses = async () => {
    try {
        const { data: sData } = await supabase.from('students').select('id, full_name, email')
        students.value = sData || []
        
        const { data: cData } = await supabase.from('classes').select('id, subject, fee')
        classes.value = cData || []
    } catch (e) { console.error(e) }
}

const filterStudents = (val, update) => {
    if (val === '') {
        update(() => { studentOptions.value = students.value })
        return
    }
    update(() => {
        const needle = val.toLowerCase()
        studentOptions.value = students.value.filter(v => v.full_name.toLowerCase().indexOf(needle) > -1)
    })
}

const updateAmount = (cls) => {
    if (cls && cls.fee) {
        form.value.amount = cls.fee
    }
}

const openDialog = () => {
    selectedStudent.value = null
    selectedClass.value = null
    form.value = {
        month: months[new Date().getMonth()],
        year: new Date().getFullYear(),
        amount: '',
        status: 'Paid'
    }
    dialog.value = true
}

const savePayment = async () => {
    saving.value = true
    try {
        const { error } = await supabase
            .from('payments')
            .insert([{
                student_id: selectedStudent.value.id,
                class_id: selectedClass.value.id,
                ...form.value,
                payment_date: new Date()
            }])
        if (error) throw error
        $q.notify({ type: 'positive', message: 'Payment recorded successfully' })
        dialog.value = false
        fetchPayments()
    } catch (error) {
        $q.notify({ type: 'negative', message: 'Operation failed' })
        console.error(error)
    } finally {
        saving.value = false
    }
}

const confirmDelete = (row) => {
    deletingPayment.value = row
    deleteDialog.value = true
}

const deletePayment = async () => {
    deleting.value = true
    try {
        const { error } = await supabase
            .from('payments')
            .delete()
            .eq('id', deletingPayment.value.id)
        
        if (error) throw error
        $q.notify({ type: 'positive', message: 'Payment deleted' })
        deleteDialog.value = false
        fetchPayments()
    } catch (error) {
        $q.notify({ type: 'negative', message: 'Delete failed' })
        console.error(error)
    } finally {
        deleting.value = false
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
</style>
