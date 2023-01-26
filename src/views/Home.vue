<template>
  <div class="home">
    <img
      alt="Vue logo"
      style="height: 400px; width: auto"
      src="../assets/afd_logo.jpg"
    />
    <HelloDashboard msg="How may I alert you today?" />
  </div>
</template>

<script>
// @ is an alias to /src
import HelloDashboard from "@/components/HelloDashboard.vue";

export default {
  name: "Home",
  components: {
    HelloDashboard,
  },
};
</script>
