<template>
  <q-layout view="lHh Lpr lFf">
    <q-header class="bg-black text-white" elevated>
      <q-toolbar class="container">
        <q-btn flat dense round icon="menu" aria-label="Menu" @click="toggleLeftDrawer" class="q-mr-sm" />

        <q-toolbar-title class="text-weight-bold">
          <q-icon name="school" class="q-mr-md" />
          ClassMaster
        </q-toolbar-title>

        <q-tabs v-if="$q.screen.gt.sm" shrink stretch>
          <q-route-tab label="Home" to="/" />
          <q-route-tab label="Features" to="/#features" />
          <q-route-tab label="About" to="/#about" />
        </q-tabs>
         <div v-else>
            v{{ $q.version }}
         </div>
         
         <div v-if="user">
            <q-btn flat round dense class="q-ml-md">
              <q-avatar size="32px" color="primary" text-color="white">
                <img v-if="avatarUrl" :src="avatarUrl" style="object-fit: cover" />
                <span v-else>{{ userInitials }}</span>
              </q-avatar>
              <q-menu>
                <q-list style="min-width: 150px">
                  <q-item clickable v-close-popup to="/profile">
                    <q-item-section avatar>
                      <q-icon name="person" />
                    </q-item-section>
                    <q-item-section>Profile</q-item-section>
                  </q-item>
                  <q-separator />
                  <q-item clickable v-close-popup @click="handleLogout">
                    <q-item-section avatar>
                      <q-icon name="logout" color="negative"/>
                    </q-item-section>
                    <q-item-section class="text-negative">Logout</q-item-section>
                  </q-item>
                </q-list>
              </q-menu>
            </q-btn>
         </div>
         <q-btn v-if="!user && $q.screen.gt.xs" to="/login" flat label="Login" class="q-ml-md" />
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" show-if-above bordered class="bg-grey-10 text-white">
      <q-list>
        <q-item-label header class="text-grey-5"> Navigation </q-item-label>

        <EssentialLink v-for="link in linksList" :key="link.title" v-bind="link" />
      </q-list>
    </q-drawer>

    <q-page-container class="bg-black">
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { supabase } from 'boot/supabase'
import EssentialLink from 'components/EssentialLink.vue'

const $q = useQuasar()
const router = useRouter()
const user = ref(null)
const avatarUrl = ref('')

const userInitials = computed(() => {
  if (!user.value || !user.value.email) return 'U'
  return user.value.email.substring(0, 2).toUpperCase()
})

onMounted(async () => {
  const { data: { session } } = await supabase.auth.getSession()
  user.value = session?.user || null
  if (user.value) fetchProfile()

  supabase.auth.onAuthStateChange((_event, session) => {
    user.value = session?.user || null
    if (user.value) fetchProfile()
  })
})

const fetchProfile = async () => {
    try {
        const { data } = await supabase
            .from('profiles')
            .select('avatar_url')
            .eq('id', user.value.id)
            .single()
        
        if (data) {
            avatarUrl.value = data.avatar_url
        }
    } catch (e) {
        console.error('Error fetching avatar', e)
    }
}

const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    $q.notify({
        type: 'positive',
        message: 'Logged out successfully'
    })
}

const linksList = [
  {
    title: 'Dashboard',
    caption: 'Overview',
    icon: 'dashboard',
    link: '/dashboard'
  },
  {
    title: 'My Classes',
    caption: 'Enrolled Subjects',
    icon: 'school',
    link: '/my-classes'
  },
  {
    title: 'Class Explorer',
    caption: 'Join New Classes',
    icon: 'search',
    link: '/classes'
  },
  {
    title: 'My Payments',
    caption: 'Payment History',
    icon: 'payments',
    link: '/payments'
  },
  {
    title: 'Profile',
    caption: 'My Account',
    icon: 'person',
    link: '/profile'
  }
]

const leftDrawerOpen = ref(false)

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value
}
</script>
