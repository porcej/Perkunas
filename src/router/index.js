import Vue from "vue";
import VueRouter from "vue-router";
import Home from "../views/Home.vue";

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    name: "Home",
    component: Home,
    // name: "Dashboard",
    // component: () => import("../views/Dash.vue"),
  },
  {
    path: "/station/:stationId",
    name: "Dashboard",
    component: () => import("../views/Dash.vue"),
  },
  {
    path: "/station/:stationId/all",
    name: "Dashboard - Alert for All",
    component: () => import("../views/Dash.vue"),
    props: { alertForAllIncidents: true },
  },
  {
    path: "/about",
    name: "About",
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () =>
      import(/* webpackChunkName: "about" */ "../views/About.vue"),
  },
  {
    path: "/dash",
    name: "Dash",
    component: () => import("../views/Dash.vue"),
  },
];

const router = new VueRouter({
  routes,
});

export default router;
