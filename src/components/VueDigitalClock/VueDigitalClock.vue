<template>
  <div class="vwdc_clock">
    <div v-if="showDate" class="vwdc_date">{{ date }}</div>
    <div v-if="showTime" class="vwdc_time">
      {{ time }}
      <div v-if="showBackground" class="vwdc_background">
        {{ backgroundString }}
      </div>
    </div>
  </div>
</template>

<script src="./script.js"></script>
<style src="./style.css" scoped></style>
