<template>
  <div class="vwm__messages">
    <div class="vwm__contents align-self-center">
      <div class="vwm__loading" v-if="loading">
        <slot name="loading">
          <p><span class="vwm__title">Loading...</span></p>
          <p><font-awesome-icon icon="spinner" size="2x" /></p>
        </slot>
      </div>
      <div class="vwm__error">
        <slot name="error">
          <span class="vww__title warn">{{
            error"
          }}</span>
        </slot>
      </div>
      <div v-html="messages[1].content"></div>
    </div>
  </div>
</template>

<script src="./script.js"></script>
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style src="./style.css" scoped></style>
