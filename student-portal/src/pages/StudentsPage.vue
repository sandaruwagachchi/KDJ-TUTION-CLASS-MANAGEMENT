<template>
  <q-page class="bg-black text-white q-pa-md">
    <div class="container">
       <div class="row items-center q-mb-lg">
          <div class="col">
             <h1 class="text-h4 text-weight-bold q-my-none">Students</h1>
             <div class="text-grey-5">Manage your student records</div>
          </div>
          <div class="col-auto">
             <q-btn color="white" text-color="black" icon="add" label="Add Student" @click="openDialog()" class="text-weight-bold" />
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
                placeholder="Search by name or email..."
                debounce="300"
             >
                <template v-slot:prepend>
                   <q-icon name="search" color="grey-6" />
                </template>
             </q-input>
          </q-card-section>
       </q-card>

       <!-- Students Table -->
       <q-card class="bg-grey-10 text-white shadow-10 card-border">
          <q-table
             :rows="filteredStudents"
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
                         <q-item v-for="col in props.cols.filter(c => c.name !== 'actions')" :key="col.name">
                            <q-item-section>
                               <q-item-label caption class="text-grey-5">{{ col.label }}</q-item-label>
                               <q-item-label>{{ col.value }}</q-item-label>
                            </q-item-section>
                         </q-item>
                         <q-separator dark />
                         <q-item>
                            <q-item-section class="row justify-end">
                               <div class="row q-gutter-sm justify-end">
                                  <q-btn flat round dense color="grey-5" icon="edit" @click="openDialog(props.row)" />
                                  <q-btn flat round dense color="negative" icon="delete" @click="confirmDelete(props.row)" />
                               </div>
                            </q-item-section>
                         </q-item>
                      </q-list>
                   </q-card>
                </div>
             </template>

             <template v-slot:body-cell-actions="props">
                <q-td :props="props" class="q-gutter-sm">
                   <q-btn flat round dense color="grey-5" icon="edit" @click="openDialog(props.row)" />
                   <q-btn flat round dense color="negative" icon="delete" @click="confirmDelete(props.row)" />
                </q-td>
             </template>
             
             <template v-slot:loading>
                <q-inner-loading showing color="white" />
             </template>
          </q-table>
       </q-card>

       <!-- Add/Edit Dialog -->
       <q-dialog v-model="dialog" persistent>
          <q-card class="bg-grey-9 text-white" style="min-width: 400px">
             <q-card-section>
                <div class="text-h6">{{ isEdit ? 'Edit Student' : 'Add New Student' }}</div>
             </q-card-section>

             <q-card-section class="q-pt-none">
                <q-form @submit="saveStudent" class="q-gutter-md">
                   <q-input filled dark v-model="form.full_name" label="Full Name" :rules="[val => !!val || 'Name is required']" />
                   <q-input filled dark v-model="form.email" label="Email" type="email" />
                   <q-input filled dark v-model="form.phone" label="Phone" mask="###-#######" hint="Format: 07X-XXXXXXX" />
                   <q-input filled dark v-model="form.address" label="Address" type="textarea" rows="3" />
                   
                   <div class="row justify-end q-mt-lg">
                      <q-btn flat label="Cancel" color="grey" v-close-popup />
                      <q-btn :label="isEdit ? 'Update' : 'Save'" color="white" text-color="black" type="submit" :loading="saving" />
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
                <span class="q-ml-sm">Are you sure you want to delete this student?</span>
             </q-card-section>

             <q-card-actions align="right">
                <q-btn flat label="Cancel" color="grey" v-close-popup />
                <q-btn flat label="Delete" color="negative" @click="deleteStudent" :loading="deleting" />
             </q-card-actions>
          </q-card>
       </q-dialog>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { supabase } from 'boot/supabase'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const students = ref([])
const loading = ref(true)
const search = ref('')

// Dialog State
const dialog = ref(false)
const deleteDialog = ref(false)
const saving = ref(false)
const deleting = ref(false)
const isEdit = ref(false)
const selectedStudent = ref(null)

const form = ref({
    full_name: '',
    email: '',
    phone: '',
    address: ''
})

const columns = [
    { name: 'full_name', align: 'left', label: 'Name', field: 'full_name', sortable: true },
    { name: 'email', align: 'left', label: 'Email', field: 'email', sortable: true },
    { name: 'phone', align: 'left', label: 'Phone', field: 'phone' },
    { name: 'address', align: 'left', label: 'Address', field: 'address' },
    { name: 'created_at', align: 'left', label: 'Joined', field: 'created_at', format: val => new Date(val).toLocaleDateString(), sortable: true },
    { name: 'actions', align: 'right', label: 'Actions' }
]

const filteredStudents = computed(() => {
    if (!search.value) return students.value
    const term = search.value.toLowerCase()
    return students.value.filter(s => 
        (s.full_name && s.full_name.toLowerCase().includes(term)) ||
        (s.email && s.email.toLowerCase().includes(term))
    )
})

onMounted(() => {
    fetchStudents()
})

const fetchStudents = async () => {
    loading.value = true
    try {
        const { data, error } = await supabase
            .from('students')
            .select('*')
            .order('created_at', { ascending: false })
        
        if (error) throw error
        students.value = data
    } catch (error) {
        $q.notify({ type: 'negative', message: 'Failed to fetch students' })
        console.error(error)
    } finally {
        loading.value = false
    }
}

const openDialog = (student = null) => {
    if (student) {
        isEdit.value = true
        selectedStudent.value = student
        form.value = { ...student }
    } else {
        isEdit.value = false
        selectedStudent.value = null
        form.value = { full_name: '', email: '', phone: '', address: '' }
    }
    dialog.value = true
}

const saveStudent = async () => {
    saving.value = true
    try {
        if (isEdit.value) {
            const { error } = await supabase
                .from('students')
                .update(form.value)
                .eq('id', selectedStudent.value.id)
            if (error) throw error
            $q.notify({ type: 'positive', message: 'Student updated successfully' })
        } else {
            const { error } = await supabase
                .from('students')
                .insert([form.value])
            if (error) throw error
            $q.notify({ type: 'positive', message: 'Student added successfully' })
        }
        dialog.value = false
        fetchStudents()
    } catch (error) {
        $q.notify({ type: 'negative', message: 'Operation failed' })
        console.error(error)
    } finally {
        saving.value = false
    }
}

const confirmDelete = (student) => {
    selectedStudent.value = student
    deleteDialog.value = true
}

const deleteStudent = async () => {
    deleting.value = true
    try {
        const { error } = await supabase
            .from('students')
            .delete()
            .eq('id', selectedStudent.value.id)
        
        if (error) throw error
        $q.notify({ type: 'positive', message: 'Student deleted' })
        deleteDialog.value = false
        fetchStudents()
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
