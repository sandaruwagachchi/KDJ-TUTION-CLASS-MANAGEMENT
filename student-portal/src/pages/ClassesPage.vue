<template>
  <q-page class="bg-black text-white q-pa-md">
    <div class="container">
      <div class="row items-center q-mb-lg">
        <div class="col">
          <h1 class="text-h4 text-weight-bold q-my-none">Classes</h1>
          <div class="text-grey-5">Manage your class schedule and subjects</div>
        </div>
        <div class="col-auto">
          <q-btn color="white" text-color="black" icon="add" label="Add Class" @click="openDialog()" class="text-weight-bold" />
        </div>
      </div>

      <!-- Classes Grid -->
      <div v-if="loading" class="row q-col-gutter-lg">
         <div class="col-12 col-sm-6 col-md-4" v-for="n in 3" :key="n">
            <q-skeleton height="250px" class="bg-grey-9 rounded-borders" />
         </div>
      </div>

      <div v-else class="row q-col-gutter-lg">
        <div class="col-12 col-sm-6 col-md-4" v-for="cls in classes" :key="cls.id">
          <q-card class="bg-grey-10 text-white shadow-10 card-hover rounded-borders overflow-hidden relative-position h-100">
             <q-img 
                :src="cls.image_url" 
                @error="cls.image_url = 'https://source.unsplash.com/random/400x300?education'"
                :ratio="16/9" 
                class="class-img"
             >
                 <div class="absolute-top-right text-subtitle2 q-pa-xs">
                     <q-chip color="black" text-color="white" icon="payments" size="sm" class="glass-chip">{{ cls.fee }} LKR</q-chip>
                 </div>
                 <div class="absolute-bottom text-subtitle2 q-pa-md glass-panel">
                    <div class="text-h6 text-weight-bold">{{ cls.subject }}</div>
                    <div class="text-caption text-grey-3">{{ cls.grade }}</div>
                 </div>
             </q-img>
             
             <q-card-section class="q-pt-md">
                <div class="row items-center q-gutter-x-md text-grey-4 q-mb-sm">
                   <q-icon name="schedule" size="xs" />
                   <span class="text-caption">{{ cls.day_of_week }} | {{ cls.start_time }} - {{ cls.end_time }}</span>
                </div>
             </q-card-section>

             <q-card-actions align="right" class="q-pt-none q-pb-md q-px-md">
                <q-btn flat round dense color="grey-5" icon="edit" @click="openDialog(cls)" />
                <q-btn flat round dense color="negative" icon="delete" @click="confirmDelete(cls)" />
             </q-card-actions>
          </q-card>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="!loading && classes.length === 0" class="text-center text-grey-6 q-pa-xl">
         <q-icon name="school" size="100px" style="opacity: 0.2" />
         <div class="text-h6 q-mt-md">No classes found</div>
         <p>Create your first class to get started</p>
      </div>

      <!-- Add/Edit Dialog -->
      <q-dialog v-model="dialog" persistent>
        <q-card class="bg-grey-9 text-white" style="min-width: 400px">
          <q-card-section>
            <div class="text-h6">{{ isEdit ? 'Edit Class' : 'Add New Class' }}</div>
          </q-card-section>

          <q-card-section class="q-pt-none">
            <q-form @submit="saveClass" class="q-gutter-md">
              <q-input filled dark v-model="form.subject" label="Subject" :rules="[val => !!val || 'Subject is required']" />
              <q-input filled dark v-model="form.grade" label="Grade" :rules="[val => !!val || 'Grade is required']" />
              
              <div class="row q-col-gutter-sm">
                 <div class="col-6">
                    <q-select filled dark v-model="form.day_of_week" :options="days" label="Day" />
                 </div>
                 <div class="col-6">
                    <q-input filled dark v-model="form.fee" label="Fee (LKR)" type="number" />
                 </div>
              </div>

              <div class="row q-col-gutter-sm">
                  <div class="col-6">
                      <q-input filled dark v-model="form.start_time" label="Start Time" mask="time" :rules="['time']">
                        <template v-slot:append>
                          <q-icon name="access_time" class="cursor-pointer">
                            <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                              <q-time v-model="form.start_time" dark />
                            </q-popup-proxy>
                          </q-icon>
                        </template>
                      </q-input>
                  </div>
                  <div class="col-6">
                      <q-input filled dark v-model="form.end_time" label="End Time" mask="time" :rules="['time']">
                        <template v-slot:append>
                          <q-icon name="access_time" class="cursor-pointer">
                            <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                              <q-time v-model="form.end_time" dark />
                            </q-popup-proxy>
                          </q-icon>
                        </template>
                      </q-input>
                  </div>
              </div>

               <q-input filled dark v-model="form.image_url" label="Cover Image URL (Optional)" hint="Leave empty for random image" />

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
            <span class="q-ml-sm">Are you sure you want to delete this class?</span>
          </q-card-section>

          <q-card-actions align="right">
            <q-btn flat label="Cancel" color="grey" v-close-popup />
            <q-btn flat label="Delete" color="negative" @click="deleteClass" :loading="deleting" />
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
const classes = ref([])
const loading = ref(true)

const dialog = ref(false)
const deleteDialog = ref(false)
const saving = ref(false)
const deleting = ref(false)
const isEdit = ref(false)
const selectedClass = ref(null)

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

const form = ref({
    subject: '',
    grade: '',
    day_of_week: 'Monday',
    start_time: '08:00',
    end_time: '10:00',
    fee: '',
    image_url: ''
})

onMounted(() => {
    fetchClasses()
})

const fetchClasses = async () => {
    loading.value = true
    try {
        const { data, error } = await supabase
            .from('classes')
            .select('*')
            .order('created_at', { ascending: false })
        
        if (error) throw error
        classes.value = data
    } catch (error) {
        $q.notify({ type: 'negative', message: 'Failed to fetch classes' })
        console.error(error)
    } finally {
        loading.value = false
    }
}

const openDialog = (cls = null) => {
    if (cls) {
        isEdit.value = true
        selectedClass.value = cls
        form.value = { ...cls }
    } else {
        isEdit.value = false
        selectedClass.value = null
        form.value = { subject: '', grade: '', day_of_week: 'Monday', start_time: '08:00', end_time: '10:00', fee: '', image_url: '' }
    }
    dialog.value = true
}

const saveClass = async () => {
    saving.value = true
    try {
        // Assign random image if empty
        if (!form.value.image_url) {
            const topics = ['education', 'technology', 'book', 'school', 'science']
            const randomTopic = topics[Math.floor(Math.random() * topics.length)]
            form.value.image_url = `https://source.unsplash.com/random/400x300?${randomTopic}&sig=${Math.random()}`
        }

        if (isEdit.value) {
            const { error } = await supabase
                .from('classes')
                .update(form.value)
                .eq('id', selectedClass.value.id)
            if (error) throw error
            $q.notify({ type: 'positive', message: 'Class updated successfully' })
        } else {
            const { error } = await supabase
                .from('classes')
                .insert([form.value])
            if (error) throw error
            $q.notify({ type: 'positive', message: 'Class added successfully' })
        }
        dialog.value = false
        fetchClasses()
    } catch (error) {
        $q.notify({ type: 'negative', message: 'Operation failed' })
        console.error(error)
    } finally {
        saving.value = false
    }
}

const confirmDelete = (cls) => {
    selectedClass.value = cls
    deleteDialog.value = true
}

const deleteClass = async () => {
    deleting.value = true
    try {
        const { error } = await supabase
            .from('classes')
            .delete()
            .eq('id', selectedClass.value.id)
        
        if (error) throw error
        $q.notify({ type: 'positive', message: 'Class deleted' })
        deleteDialog.value = false
        fetchClasses()
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

.class-img {
    transition: transform 0.3s ease;
}

.card-hover:hover .class-img {
    transform: scale(1.05);
}

.glass-panel {
    background: linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0) 100%);
}

.glass-chip {
    backdrop-filter: blur(5px);
    background: rgba(255,255,255,0.2) !important;
}
</style>
