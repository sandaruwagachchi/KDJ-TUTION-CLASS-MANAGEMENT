<template>
  <q-page class="flex flex-center bg-black text-white">
    <div class="auth-card-wrapper relative-position z-top">
      <div class="glow-effect absolute-center"></div>
      
      <q-card class="auth-card glass-card q-pa-xl relative-position">
        <q-card-section class="text-center">
           <div class="text-h4 text-weight-bold q-mb-sm text-gradient">Welcome Back</div>
           <div class="text-grey-5">Sign in to access your dashboard</div>
        </q-card-section>

        <q-card-section>
          <q-form @submit="handleLogin" class="q-gutter-md">
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
              :rules="[val => !!val || 'Password is required']"
            >
               <template v-slot:prepend>
                  <q-icon name="lock" color="grey-5" />
               </template>
            </q-input>

            <div class="row justify-between items-center q-mt-sm">
               <q-checkbox v-model="rememberMe" label="Remember me" dark color="grey-5" size="sm" dense />
               <a href="#" class="text-grey-5 text-caption no-decoration hover-underline">Forgot Password?</a>
            </div>

            <div class="q-mt-lg">
              <q-btn
                label="Sign In"
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
              Don't have an account? 
              <router-link to="/register" class="text-white text-weight-bold no-decoration hover-underline">Sign Up</router-link>
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
const email = ref('')
const password = ref('')
const rememberMe = ref(false)
const loading = ref(false)

const handleLogin = async () => {
  loading.value = true
  
  const { error } = await supabase.auth.signInWithPassword({
    email: email.value,
    password: password.value,
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
      message: 'Logged in successfully!',
      position: 'top'
    })
    router.push('/dashboard') // Redirect to dashboard or home
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
