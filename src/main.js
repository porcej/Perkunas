import Vue from "vue";
import axios from "axios";
import App from "./App.vue";
import router from "./router";
// import IncidentHub from './incident-hub';
import DashboardHub from "./dashboard-hub";
import { BootstrapVue, IconsPlugin } from "bootstrap-vue";

// Import Bootstrap an BootstrapVue CSS files (order is important)
import "bootstrap/dist/css/bootstrap.css";
import "bootstrap-vue/dist/bootstrap-vue.css";

// Make BootstrapVue available throughout your project
Vue.use(BootstrapVue);
// Optionally install the BootstrapVue icon components plugin
Vue.use(IconsPlugin);

Vue.config.productionTip = false;

// same as the Url the server listens to
axios.defaults.baseURL = "http://sfireweb2.alexgov.net/CADWebRelay/";
// axios.defaults.withCredentials = true

// Setup axios as the Vue default $http library
Vue.prototype.$http = axios;

// Vue.use(IncidentHub);
Vue.use(DashboardHub);
Vue.prototype.startSignalR();
Vue.prototype.$dashboardHub.JoinDashboard();
// Vue.prototype.$incidentHub.subscribe('Incidents');
// Vue.prototype.$incidentHub.subscribe('Units');

new Vue({
  router,
  render: (h) => h(App),
}).$mount("#app");
