<template>
  <div class="vwdc_clock">
    <div class="vwdc_date">{{ date }}</div>
    <div class="vwdc_time">
      {{ time }}
      <div v-if="showBackground" class="vwdc_background">
        {{ backgroundString }}
      </div>
    </div>
  </div>
</template>

<script src="./script.js"></script>
<style src="./style.css" scoped></style>
