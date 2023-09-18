<template>
  <div class="vww__widget justify-content-center" :style="{ color: textColor }">
    <slot name="header">
      <div
        class="vww__header"
        :style="{ borderColor: barColor }"
        v-if="!hideHeader"
      >
        <slot name="title">
          <span class="vww__title">
            <shift-date format="dddd, MMMM Do YYYY" />
          </span>
        </slot>
      </div>
    </slot>

    <div class="weather_content">
      <div class="vww__loading" v-if="loading">
        <slot name="loading">
          <weather-icons :icon="'day-cloudy'" />
          <span class="vww__title">Loading...</span>
        </slot>
      </div>

      <div
        class="vww__error"
        v-else-if="error || !weather || !currently || !daily"
      >
        <slot name="error">
          <weather-icons :icon="'day-rain'" />
          <span class="vww__title">{{ error || "Something went wrong!" }}</span>
        </slot>
      </div>

      <template v-else>
        <div class="currently">
          <div class="normal medium">
            <span class="wi wi-strong-wind dimmed"></span>
            <span> 10 <sup> SE &nbsp; </sup></span>
            <span class="wi dimmed wi-umbrella low-temp"></span>
            <span> 20% </span>
            <!-- <span class="wi dimmed wi-sunset high-temp"></span> -->
            <!-- <span> 7:53 pm </span> -->
          </div>

           <div class="large light">
            <weather-icons :icon="currently.icon" :fixed="true" class="weathericon" />
            <span class="vww__temp bright" >
              {{ Math.round(currently.temperature) }}&deg;
            </span>
          </div> 
          <div class="normal medium">
          <div class="normal medium feelslike">
            <span class="high-temp"> 91° </span>
            <span> / </span>
            <span class="low-temp"> 54° </span> 
            <span class="wi weathericon wi-humidity low-temp"></span>
            <span> 45% </span>

            <span class="wi weathericon wi-thermometer"></span>
            <span class="dimmed">
                91.3°
            </span>
            <!-- <font-awesome-icon icon="fa-solid fa-flag" class="alert"/> -->
          </div>
<!--           <div class="normal medium alerts">
            <span class="alert"> Snow Squall Warning </span>
          </div> -->



          </div>
<!--           <div class="vww__summary">{{ currently.shortForecast }}</div>
          <div class="vww__wind">
            Wind: {{ currently.windSpeed }} ({{ currently.windDirection }})
          </div> -->
        </div>

<!-- Daily -->
<!--         <div class="vww__daily">
          <div class="vww__day" :key="day.name" v-for="day in daily">
            <span>{{ day.name }}</span>
            <span>
              <weather-icons :icon="day.icon" :fixed="true" />
            </span>
            <div class="vww__day-bar">
              <div :style="{ height: `${day.top}%` }">
                <span>{{ Math.round(day.temperatureMax) }}&deg;</span>
              </div>
              <div
                :style="{
                  borderRadius: '10px',
                  background: barColor,
                  height: `${day.height}%`,
                }"
              >
                &nbsp;
              </div>
              <div
                v-if="day.temperatureMax !== day.temperatureMin"
                :style="{ height: `${day.bottom}%` }"
              >
                <span>{{ Math.round(day.temperatureMin) }}&deg;</span>
              </div>
            </div>
          </div>
        </div> -->
      </template>
    </div>
  </div>
</template>

<script src="./script.js"></script>

<style src="./style.css"></style>
