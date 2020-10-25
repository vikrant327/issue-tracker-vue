import Vue from 'vue'
import App from './App.vue';
import VueRouter from "vue-router";
import './style.css';
//Vue.config.productionTip = false;



var router = new VueRouter({
  mode: 'history',
  routes: [{
    path: '/',
    component: App,
    meta: {
      title: 'Home Page - Issue Tracker',
      metaTags: [
        {
          name: 'description',
          content: 'The home page of our example app.'
        },
        {
          property: 'og:description',
          content: 'The home page of our example app.'
        }
      ]
    }
  }]
});

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')