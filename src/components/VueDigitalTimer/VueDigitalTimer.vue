<template>
  <span :class="{vwdt_timer: true, 'text-success': timerOkay, 'text-warning': timerWarn, 'text-danger': timerDanger}">
    {{ time }}
  </span>
</template>

<script src="./script.js"></script>
<style src="./style.css" scoped></style>
