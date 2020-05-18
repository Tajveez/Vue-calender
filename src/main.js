import Vue from 'vue'
import App from './App.vue'
import vuetify from './plugins/vuetify';
import VueTextareaAutosize from 'vue-textarea-autosize';
import firebase from 'firebase/app';
import 'firebase/firestore';


Vue.use(VueTextareaAutosize)
Vue.config.productionTip = false

firebase.initializeApp({
  apiKey: "AIzaSyDCFds21XLd8qv_-j9T8sa0MCz-vczEjMY",
  authDomain: "vue-calendar-89ffd.firebaseapp.com",
  databaseURL: "https://vue-calendar-89ffd.firebaseio.com",
  projectId: "vue-calendar-89ffd",
  storageBucket: "vue-calendar-89ffd.appspot.com",
  messagingSenderId: "529939041742",
  appId: "1:529939041742:web:5b9b0894ac0cc6ac8a2f9f"
});

export const db = firebase.firestore();

new Vue({
  vuetify,
  render: h => h(App)
}).$mount('#app')
