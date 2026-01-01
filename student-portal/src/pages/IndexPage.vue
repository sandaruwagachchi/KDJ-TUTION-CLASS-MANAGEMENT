<template>
  <q-page class="landing-page text-white overflow-hidden">
    <!-- Hero Carousel Section -->
    <section class="hero-section relative-position">
      <q-carousel
        animated
        v-model="slide"
        arrows
        navigation
        infinite
        autoplay
        transition-prev="slide-right"
        transition-next="slide-left"
        height="100vh"
        class="bg-black text-white"
      >
        <q-carousel-slide name="first" class="q-pa-none">
          <div class="hero-slide-content relative-position full-height flex flex-center">
            <div class="hero-overlay absolute-full"></div>
            <div class="container relative-position q-pa-md z-top text-center">
               <div class="chip-badge q-mb-md inline-block text-uppercase text-weight-bold fade-in-up">
                  Next Gen Platform
               </div>
               <h1 class="text-weight-bold q-mb-md hero-title fade-in-up delay-100" :class="$q.screen.lt.sm ? 'text-h3' : 'text-h1'">
                  Start Your <span class="text-gradient">Learning Journey</span>
               </h1>
               <p class="q-mb-xl hero-subtitle text-grey-5 fade-in-up delay-200" :class="$q.screen.lt.sm ? 'text-body1' : 'text-h5'">
                  The ultimate solution for modern education management.
               </p>
               <div class="q-gutter-md fade-in-up delay-300">
                  <q-btn to="/register" color="white" text-color="black" :size="$q.screen.lt.sm ? 'md' : 'lg'" label="Get Started" no-caps class="action-btn" :class="$q.screen.lt.sm ? 'q-px-lg' : 'q-px-xl'" />
               </div>
            </div>
            <img src="~assets/hero-modern.png" class="absolute-full hero-bg-img" />
          </div>
        </q-carousel-slide>

        <q-carousel-slide name="second" class="q-pa-none">
           <div class="hero-slide-content relative-position full-height flex flex-center">
            <div class="hero-overlay absolute-full"></div>
            <div class="container relative-position q-pa-md z-top text-center">
               <h1 class="text-weight-bold q-mb-md hero-title" :class="$q.screen.lt.sm ? 'text-h3' : 'text-h1'">
                  Student <span class="text-gradient">Portal</span>
               </h1>
               <p class="q-mb-xl text-white" :class="$q.screen.lt.sm ? 'text-h5' : 'text-h4'">Manage your classes & payments</p>
                <q-btn outline color="white" :size="$q.screen.lt.sm ? 'md' : 'lg'" label="Learn More" no-caps class="action-btn" :class="$q.screen.lt.sm ? 'q-px-lg' : 'q-px-xl'" />
            </div>
            <!-- Reusing hero image due to quota, styled differently -->
            <img src="~assets/hero-modern.png" class="absolute-full hero-bg-img flip-img" />
          </div>
        </q-carousel-slide>
      </q-carousel>
    </section>

    <!-- Features Section -->
    <section class="features-section q-py-xl relative-position bg-black">
      <div class="container q-mx-auto q-px-md">
        <div class="text-center q-mb-xl">
          <h2 class="text-h3 text-weight-bold q-mb-sm">Core Capabilities</h2>
          <p class="text-grey-5 text-h6">Engineered for excellence and reliability</p>
        </div>

        <div class="row q-col-gutter-lg">
          <div class="col-12 col-md-4" v-for="(feature, index) in features" :key="index">
            <q-card class="feature-card glass-card h-100 column flex-center text-center q-pa-lg" flat>
                 <div class="feature-icon-wrapper q-mb-lg relative-position">
                   <div class="glow-small absolute-center"></div>
                   <img :src="feature.image" class="feature-icon relative-position" />
                 </div>
                 <div class="text-h5 text-weight-bold q-mb-md">{{ feature.title }}</div>
                 <div class="text-grey-5">{{ feature.description }}</div>
            </q-card>
          </div>
        </div>
      </div>
    </section>

    <!-- Digital Infrastructure Section (Renamed from Gallery) -->
    <section class="gallery-section q-py-xl bg-black">
       <div class="container q-mx-auto q-px-md">
          <h2 class="text-h3 text-weight-bold q-mb-xl text-center">Digital Infrastructure</h2>
          <div class="row q-col-gutter-md stretch-row">
             <!-- Main Feature -->
             <div class="col-12 col-md-8">
                <q-img src="~assets/hero-modern.png" class="gallery-img rounded-borders full-height relative-position shadow-up-10">
                   <div class="absolute-bottom text-h5 text-weight-bold text-center gallery-caption">
                      Smart Classrooms
                   </div>
                </q-img>
             </div>
             <!-- Secondary Features -->
             <div class="col-12 col-md-4">
                 <div class="column q-gutter-md full-height">
                    <q-img src="~assets/feature-student.png" class="col gallery-img rounded-borders bg-dark-glass relative-position" img-class="contain-img">
                         <div class="absolute-bottom text-subtitle1 text-weight-bold text-center gallery-caption">
                            Student Analytics
                         </div>
                    </q-img>
                    <q-img src="~assets/feature-attendance.png" class="col gallery-img rounded-borders bg-dark-glass relative-position" img-class="contain-img">
                         <div class="absolute-bottom text-subtitle1 text-weight-bold text-center gallery-caption">
                            Automated Tracking
                         </div>
                    </q-img>
                 </div>
             </div>
          </div>
       </div>
    </section>

    <!-- Stats Section -->
    <section class="stats-section q-py-xl text-white bg-black">
      <div class="container q-mx-auto q-px-md">
        <div class="glass-strip q-pa-lg rounded-borders">
          <div class="row q-col-gutter-lg text-center items-center">
            <div class="col-12 col-md-4 border-right-light">
              <div class="text-h2 text-weight-bolder text-gradient">500+</div>
              <div class="text-uppercase text-caption text-weight-bold tracking-wide">
                Active Institutes
              </div>
            </div>
            <div class="col-12 col-md-4 border-right-light">
              <div class="text-weight-bolder text-gradient" :class="$q.screen.lt.sm ? 'text-h4' : 'text-h2'">10k+</div>
              <div class="text-uppercase text-caption text-weight-bold tracking-wide">
                Daily Users
              </div>
            </div>
            <div class="col-12 col-md-4">
              <div class="text-weight-bolder text-gradient" :class="$q.screen.lt.sm ? 'text-h4' : 'text-h2'">99.9%</div>
              <div class="text-uppercase text-caption text-weight-bold tracking-wide">
                Uptime
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

     <!-- CTA Section -->
     <section class="cta-section q-py-xl text-center relative-position bg-black">
       <div class="glow-effect-bottom absolute-bottom"></div>
       <div class="container q-mx-auto q-px-md q-py-xl z-top relative-position">
         <h2 class="text-weight-bold q-mb-lg" :class="$q.screen.lt.sm ? 'text-h4' : 'text-h3'">Ready to Modernize?</h2>
         <p class="text-grey-5 q-mb-xl max-width-md mx-auto" :class="$q.screen.lt.sm ? 'text-body1' : 'text-h6'">
           Join the elite network of educators using the most advanced management system.
         </p>
         <q-btn
           to="/register"
           color="white"
           text-color="black"
           :size="$q.screen.lt.sm ? 'lg' : 'xl'"
           label="Create Account"
           no-caps
           class="rounded-borders shadow-20 glow-btn"
           :class="$q.screen.lt.sm ? 'q-px-lg' : 'q-px-xl'"
         />
       </div>
     </section>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import featureStudentImg from 'assets/feature-student.png'
import featureAttendanceImg from 'assets/feature-attendance.png'
import featurePaymentImg from 'assets/feature-payment.png'

const slide = ref('first')

const features = [
  {
    title: 'Smart Class Explorer',
    description:
      'Search classes by subject, view detailed descriptions, and enroll instantly.',
    image: featureStudentImg,
  },
  {
    title: 'Flexible Payments',
    description:
      'Pay online securely or choose to pay later. Track your payment history.',
    image: featurePaymentImg,
  },
  {
    title: 'My Learning Hub',
    description:
      'Access your enrolled class schedule and manage your personal profile.',
    image: featureAttendanceImg,
  },
]
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;600;800&display=swap');

.landing-page {
  font-family: 'Plus Jakarta Sans', sans-serif;
  background-color: #050505;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

/* Animations */
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}

.fade-in-up {
  animation: fadeInUp 0.8s ease-out forwards;
}

.delay-100 { animation-delay: 0.1s; }
.delay-200 { animation-delay: 0.2s; }
.delay-300 { animation-delay: 0.3s; }

/* Hero Carousel */
.hero-slide-content {
    background-color: #000;
}

.hero-bg-img {
    object-fit: cover;
    opacity: 0.4;
    filter: grayscale(100%);
}

.flip-img {
    transform: scaleX(-1);
}

.hero-overlay {
  background: radial-gradient(circle, transparent 0%, rgba(0,0,0,0.8) 100%);
  z-index: 1;
}

.chip-badge {
  background: rgba(255, 255, 255, 0.1);
  padding: 8px 16px;
  border-radius: 50px;
  font-size: 0.8rem;
  letter-spacing: 2px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(5px);
}

.text-gradient {
  background: linear-gradient(90deg, #ffffff 0%, #888888 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

/* Gallery */
.stretch-row {
    align-items: stretch;
    min-height: 500px;
}

.gallery-img {
    transition: all 0.5s ease;
    overflow: hidden;
    height: 100%;
    border: 1px solid rgba(255, 255, 255, 0.1);
}

.gallery-img:hover {
    transform: translateY(-5px);
    border-color: rgba(255, 255, 255, 0.3);
    box-shadow: 0 10px 30px rgba(0,0,0,0.5);
}

.bg-dark-glass {
    background: linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.01) 100%);
}

.contain-img {
    object-fit: contain !important;
    padding: 30px;
}

.gallery-caption {
    background: linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0) 100%);
    padding: 20px;
    padding-top: 40px;
    letter-spacing: 1px;
    text-transform: uppercase;
    font-size: 0.9rem;
}

/* Features */
.glass-card {
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 24px;
  transition: all 0.3s ease;
}

.glass-card:hover {
  background: rgba(255, 255, 255, 0.08);
  transform: translateY(-5px);
  border-color: rgba(255, 255, 255, 0.2);
}

.feature-icon {
  width: 120px;
  height: 120px;
  object-fit: contain;
  filter: drop-shadow(0 0 10px rgba(255, 255, 255, 0.2));
}

.glow-small {
  width: 80px;
  height: 80px;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.2) 0%, transparent 70%);
  filter: blur(20px);
}

/* Stats */
.glass-strip {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.border-right-light {
  border-right: 1px solid rgba(255, 255, 255, 0.1);
}

@media (max-width: 1023px) {
  .border-right-light {
    border-right: none;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    padding-bottom: 20px;
    margin-bottom: 20px;
  }
}

.tracking-wide {
  letter-spacing: 2px;
  color: #888;
}

/* CTA */
.glow-effect-bottom {
  width: 100%;
  height: 300px;
  background: radial-gradient(ellipse at bottom, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
  filter: blur(80px);
  bottom: -100px;
}

.glow-btn {
  box-shadow: 0 0 20px rgba(255, 255, 255, 0.3);
}

.max-width-md {
  max-width: 600px;
}

.mx-auto {
  margin-left: auto;
  margin-right: auto;
}
</style>
