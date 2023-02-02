<template>
  <div class="hello">
    <h1>{{ msg }}</h1>
    <h3>Station Dashboards</h3>
    <ul>
      <li>
        <router-link to="/station/201" target="_blank">201</router-link>
      </li>
      <li>
        <router-link to="/station/202" target="_blank">202</router-link>
      </li>
      <li>
        <router-link to="/station/203" target="_blank">203</router-link>
      </li>
      <li>
        <router-link to="/station/204" target="_blank">204</router-link>
      </li>
      <li>
        <router-link to="/station/205" target="_blank">205</router-link>
      </li>
      <li>
        <router-link to="/station/206" target="_blank">206</router-link>
      </li>
      <li>
        <router-link to="/station/207" target="_blank">207</router-link>
      </li>
      <li>
        <router-link to="/station/208" target="_blank">208</router-link>
      </li>
      <li>
        <router-link to="/station/209" target="_blank">209</router-link>
      </li>
      <li>
        <router-link to="/station/210" target="_blank">210</router-link>
      </li>
    </ul>
    <h3>Essential Links</h3>
    <ul>
      <li v-for="(item, key) in $appConfig" :key="key">
        <a :href="item" target="_blank" rel="noopener">{{ key }}</a>
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  name: "DashboardIndex",
  props: {
    msg: String,
  },
  created() {
    document.title = "Station Index";
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
  margin: 40px 0 0;
  color: #5c4f7f;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
