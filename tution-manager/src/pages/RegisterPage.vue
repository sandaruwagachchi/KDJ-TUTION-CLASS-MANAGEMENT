<template>
  <q-page class="flex flex-center bg-black text-white">
    <div class="auth-card-wrapper relative-position z-top">
      <div class="glow-effect absolute-center"></div>
      
      <q-card class="auth-card glass-card q-pa-xl relative-position">
        <q-card-section class="text-center">
           <div class="text-h4 text-weight-bold q-mb-sm text-gradient">Create Account</div>
           <div class="text-grey-5">Join the future of education</div>
        </q-card-section>

        <q-card-section>
          <q-form @submit="handleRegister" class="q-gutter-md">
             <q-input
              filled
              v-model="name"
              label="Institute Name"
              dark
              color="white"
              class="auth-input"
              :rules="[val => !!val || 'Name is required']"
            >
               <template v-slot:prepend>
                  <q-icon name="business" color="grey-5" />
               </template>
            </q-input>

            <q-input
              filled
              v-model="email"
              label="Email"
              dark
              color="white"
              class="auth-input"
               :rules="[val => !!val || 'Email is required', val => /.+@.+\..+/.test(val) || 'Valid email required']"
            >
               <template v-slot:prepend>
                  <q-icon name="email" color="grey-5" />
               </template>
            </q-input>

            <q-input
              filled
              v-model="password"
              label="Password"
              type="password"
              dark
              color="white"
              class="auth-input"
              :rules="[val => !!val || 'Password is required', val => val.length >= 6 || 'Min 6 characters']"
            >
               <template v-slot:prepend>
                  <q-icon name="lock" color="grey-5" />
               </template>
            </q-input>

            <div class="q-mt-lg">
              <q-btn
                label="Sign Up"
                type="submit"
                color="white"
                text-color="black"
                class="full-width q-py-sm text-weight-bold rounded-borders shadow-10 btn-glow"
                unelevated
                :loading="loading"
              />
            </div>
          </q-form>
        </q-card-section>

        <q-card-section class="text-center q-mt-md">
           <div class="text-grey-5">
              Already have an account? 
              <router-link to="/login" class="text-white text-weight-bold no-decoration hover-underline">Sign In</router-link>
           </div>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from 'boot/supabase'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const router = useRouter()
const name = ref('')
const email = ref('')
const password = ref('')
const loading = ref(false)

const handleRegister = async () => {
  loading.value = true
  
  const { error } = await supabase.auth.signUp({
    email: email.value,
    password: password.value,
    options: {
      data: {
        institute_name: name.value,
      },
    },
  })

  if (error) {
    $q.notify({
      type: 'negative',
      message: error.message,
      position: 'top'
    })
  } else {
    $q.notify({
      type: 'positive',
      message: 'Registration successful! Check your email.',
      position: 'top'
    })
    router.push('/login')
  }
  
  loading.value = false
}
</script>

<style scoped>
.glass-card {
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 24px;
  width: 100%;
  max-width: 450px;
}

.auth-card-wrapper {
  width: 100%;
  display: flex;
  justify-content: center;
}

.glow-effect {
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
  filter: blur(80px);
}

.text-gradient {
  background: linear-gradient(90deg, #ffffff 0%, #888888 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.auth-input :deep(.q-field__control) {
  background: rgba(255, 255, 255, 0.05) !important;
  border-radius: 12px;
}

.auth-input :deep(.q-field__label) {
  color: rgba(255, 255, 255, 0.5);
}

.hover-underline:hover {
  text-decoration: underline;
}

.btn-glow {
    transition: all 0.3s ease;
}
.btn-glow:hover {
    box-shadow: 0 0 20px rgba(255, 255, 255, 0.3);
    transform: translateY(-1px);
}
</style>
