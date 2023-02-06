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

// Include Leaflet CSS
import { Icon } from "leaflet";
import "leaflet/dist/leaflet.css";

// Import our configuration
import config from "./config";

delete Icon.Default.prototype._getIconUrl;
Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

Vue.prototype.$appConfig = config;

// Make BootstrapVue available throughout your project
Vue.use(BootstrapVue);
// Optionally install the BootstrapVue icon components plugin
Vue.use(IconsPlugin);

Vue.config.productionTip = false;

// same as the Url the server listens to
axios.defaults.baseURL = config.cad_url_base;

// axios.defaults.withCredentials = true

// Setup axios as the Vue default $http library
Vue.prototype.$http = axios;

// Vue.use(IncidentHub);
Vue.use(DashboardHub, Vue.prototype.$appConfig.dashboard_hub_url);
Vue.prototype.startSignalR();
// Vue.prototype.$dashboardHub.JoinDashboard();
// Vue.prototype.$incidentHub.subscribe("Incidents");
// Vue.prototype.$incidentHub.subscribe('Units');

new Vue({
  router,
  render: (h) => h(App),
}).$mount("#app");
