<template>
  <q-page class="bg-black text-white">
    <!-- Banner Section -->
    <div class="profile-banner relative-position">
      <div class="absolute-bottom-left q-pa-md row items-end q-col-gutter-md container full-width" :class="{'justify-center text-center': $q.screen.lt.sm}">
        <div class="col-12 col-sm-auto relative-position flex flex-center">
          <q-avatar size="100px" class="shadow-10 profile-avatar bg-grey-9 text-white font-weight-bold cursor-pointer" fontSize="40px" @click="triggerFilePicker">
            <img v-if="avatarUrl" :src="avatarUrl" style="object-fit: cover" />
            <span v-else>{{ initials }}</span>
            
            <div class="absolute-full flex flex-center bg-black-opacity text-white opacity-0 hover-opacity-100 transition-opacity rounded-borders">
                <q-icon name="camera_alt" size="24px" />
            </div>
          </q-avatar>
          <input type="file" ref="fileInput" class="hidden" accept="image/*" @change="uploadAvatar" />
        </div>
        <div class="col-12 col-sm">
          <div class="text-h4 text-weight-bold text-shadow q-mb-xs" :class="{'text-h5': $q.screen.lt.sm}">{{ fullName || 'User' }}</div>
          <div class="text-subtitle1 text-grey-5 text-shadow">{{ email }}</div>
        </div>
      </div>
    </div>

    <!-- Content Section -->
    <div class="container q-pa-md q-mt-md">
      <div class="row q-col-gutter-lg">
        <!-- Personal Info Card -->
        <div class="col-12 col-md-8">
          <q-card class="bg-grey-10 text-white shadow-10 card-border">
            <q-card-section>
              <div class="text-h6 text-white q-mb-md">Personal Information</div>
              <q-form @submit="updateProfile" class="q-gutter-md">
                <div class="row q-col-gutter-md">
                  <div class="col-12 col-md-6">
                     <q-input
                      filled
                      dark
                      v-model="fullName"
                      label="Full Name"
                      color="white"
                    >
                      <template v-slot:prepend>
                        <q-icon name="person" color="grey-6" />
                      </template>
                    </q-input>
                  </div>
                  <div class="col-12 col-md-6">
                    <q-input
                      filled
                      dark
                      v-model="phone"
                      label="Phone Number"
                      color="white"
                      mask="###-#######"
                    >
                      <template v-slot:prepend>
                        <q-icon name="phone" color="grey-6" />
                      </template>
                    </q-input>
                  </div>
                   <div class="col-12">
                    <q-input
                      filled
                      dark
                      v-model="address"
                      label="Address"
                      type="textarea"
                      rows="3"
                      color="white"
                    >
                      <template v-slot:prepend>
                        <q-icon name="home" color="grey-6" />
                      </template>
                    </q-input>
                  </div>
                </div>

                <div class="row justify-end q-mt-lg">
                   <q-btn 
                    label="Save Changes" 
                    type="submit" 
                    color="white" 
                    text-color="black"
                    unelevated 
                    class="q-px-lg text-weight-bold"
                    :loading="saving"
                    icon="save"
                   />
                </div>
              </q-form>
            </q-card-section>
          </q-card>
        </div>

        <!-- Sidebar / Role Info -->
        <div class="col-12 col-md-4">
           <q-card class="bg-grey-10 text-white shadow-10 card-border q-mb-md">
            <q-card-section>
               <div class="text-h6 text-grey-4 q-mb-sm">Account Type</div>
               <q-chip color="grey-8" text-color="white" icon="verified_user" class="q-ma-none text-uppercase text-weight-bold">
                  {{ role }}
               </q-chip>
               <div class="text-caption text-grey-6 q-mt-md">
                  Your account has {{ role }} privileges. Contact administrator to change your role.
               </div>
            </q-card-section>
          </q-card>

          <q-card class="bg-grey-10 text-white shadow-10 card-border">
            <q-card-section>
               <div class="text-h6 text-grey-4 q-mb-sm">Security</div>
               <q-item clickable v-ripple class="q-pa-none q-my-sm" @click="passwordDialog = true">
                  <q-item-section avatar>
                     <q-icon name="lock" color="grey-5" />
                  </q-item-section>
                  <q-item-section>
                     <q-item-label>Change Password</q-item-label>
                     <q-item-label caption class="text-grey-6">Update your login credentials</q-item-label>
                  </q-item-section>
                  <q-item-section side>
                     <q-btn round flat icon="chevron_right" dense color="grey-6" />
                  </q-item-section>
               </q-item>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>
    <!-- Password Change Dialog -->
    <q-dialog v-model="passwordDialog">
      <q-card class="bg-grey-9 text-white" style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">Change Password</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-form @submit="updatePassword" class="q-gutter-md">
            <q-input
              filled
              dark
              v-model="newPassword"
              label="New Password"
              type="password"
              color="white"
              :rules="[val => val.length >= 6 || 'Min 6 characters']"
            />
            <q-input
              filled
              dark
              v-model="confirmPassword"
              label="Confirm Password"
              type="password"
              color="white"
              :rules="[val => val === newPassword || 'Passwords do not match']"
            />
            <div class="row justify-end q-mt-md">
              <q-btn flat label="Cancel" color="grey" v-close-popup />
              <q-btn label="Update" color="white" text-color="black" type="submit" :loading="updatingPassword" />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { supabase } from 'boot/supabase'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const loading = ref(true)
const saving = ref(false)

const user = ref(null)
const email = ref('')
const fullName = ref('')
const phone = ref('')
const address = ref('')
const role = ref('student')
const avatarUrl = ref('')

// File Upload
const fileInput = ref(null)

// Password Change State
const passwordDialog = ref(false)
const newPassword = ref('')
const confirmPassword = ref('')
const updatingPassword = ref(false)

const initials = computed(() => {
  if (!fullName.value) return 'U'
  return fullName.value.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
})

onMounted(async () => {
  await fetchProfile()
})

const fetchProfile = async () => {
  loading.value = true
  try {
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()
    if (authError) throw authError
    
    user.value = authUser
    email.value = authUser.email

    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single()

    if (profileError && profileError.code !== 'PGRST116') {
       throw profileError
    }

    if (profile) {
        fullName.value = profile.full_name || ''
        role.value = profile.role || 'student'
        phone.value = profile.phone || ''
        address.value = profile.address || ''
        avatarUrl.value = profile.avatar_url || ''
    }

  } catch (error) {
    console.error('Error fetching profile:', error)
    $q.notify({ type: 'negative', message: 'Failed to load profile' })
  } finally {
    loading.value = false
  }
}

const triggerFilePicker = () => {
    fileInput.value.click()
}

const uploadAvatar = async (event) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    const file = files[0]
    const fileExt = file.name.split('.').pop()
    const fileName = `${user.value.id}-${Math.random()}.${fileExt}`
    const filePath = `${fileName}`

    try {
        $q.loading.show()
        
        // Upload to Supabase Storage
        const { error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(filePath, file)

        if (uploadError) throw uploadError

        // Get Public URL
        const { data: { publicUrl } } = supabase.storage
            .from('avatars')
            .getPublicUrl(filePath)
            
        avatarUrl.value = publicUrl
        
        // Auto-save the new avatar URL to profile
        await updateProfile(true) // Pass silent flag if needed, or just let it notify
        
    } catch (error) {
        console.error('Error uploading avatar:', error)
        $q.notify({ type: 'negative', message: 'Failed to upload avatar' })
    } finally {
        $q.loading.hide()
    }
}

const updateProfile = async (silent = false) => {
    // If called from template event, silent is an Event object.
    const isSilent = typeof silent === 'boolean' ? silent : false
    
    if (!isSilent) saving.value = true
    try {
        const updates = {
            id: user.value.id,
            full_name: fullName.value,
            phone: phone.value,
            address: address.value,
            avatar_url: avatarUrl.value,
            updated_at: new Date(),
        }

        const { error } = await supabase.from('profiles').upsert(updates)
        if (error) throw error

        if (role.value === 'student') {
            await supabase.from('students').update({
                full_name: fullName.value,
                phone: phone.value,
                address: address.value
            }).eq('email', email.value)
        }
        
        if (!isSilent) $q.notify({ type: 'positive', message: 'Profile updated successfully' })
    } catch (error) {
        console.error('Error updating profile:', error)
        if (!isSilent) $q.notify({ type: 'negative', message: 'Failed to update profile' })
    } finally {
        if (!isSilent) saving.value = false
    }
}

const updatePassword = async () => {
    updatingPassword.value = true
    try {
        const { error } = await supabase.auth.updateUser({
            password: newPassword.value
        })

        if (error) throw error

        $q.notify({ type: 'positive', message: 'Password updated successfully' })
        passwordDialog.value = false
        newPassword.value = ''
        confirmPassword.value = ''
    } catch (error) {
         $q.notify({ type: 'negative', message: error.message || 'Failed to update password' })
    } finally {
        updatingPassword.value = false
    }
}
</script>

<style scoped>
.profile-banner {
  height: 250px;
  /* Monochrome gradient */
  background: linear-gradient(135deg, #1a1a1a 0%, #000000 100%);
  border-bottom: 1px solid rgba(255,255,255,0.05);
}

.bg-black-opacity {
    background: rgba(0,0,0,0.6);
}

.opacity-0 {
    opacity: 0;
}

.hover-opacity-100:hover {
    opacity: 1;
}

.transition-opacity {
    transition: opacity 0.3s ease;
}

.container {
    max-width: 1200px;
    margin: 0 auto;
}

.profile-avatar {
    border: 4px solid #121212; 
}

.text-shadow {
    text-shadow: 0 2px 4px rgba(0,0,0,0.8);
}

.card-border {
    border: 1px solid rgba(255,255,255,0.08);
}
</style>
