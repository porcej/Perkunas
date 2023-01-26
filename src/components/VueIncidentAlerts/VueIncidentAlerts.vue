<template>
  <div>
    <b-modal class="vwi__incident_alert" hide-header>
      <div class="vwi__units">
        <span
          :class="[`vwi__unit ${colorUnit(unit.statusId)}`]"
          v-for="unit in incident.unitsAssigned"
          :key="unit.radioName"
        >
          {{ unit.radioName }}
        </span>
      </div>
      <div class="vwi__title">
        <span class="vwi__call_type"> {{ incident.incidentType }} </span>
        <span class="vwi__radio_channel float-right">
          <i class="fa fa-fw fa-bolt" aria-hidden="true"></i>
          {{ incident.primaryTacChannel }}
        </span>
      </div>
      <div class="vwi__address">
        {{ incident.address }}
        <span class="vwi__apt"> {{ incident.apartment }} </span>
        <span class="vwi__city"> {{ incident.county }} </span>
        <span class="vwi__call_time float-right">
          {{ formatTime(incident.incidentStartDateTime) }}
        </span>
      </div>
    </b-modal>
    
  </div>
</template>

<script src="./script.js"></script>

<style scoped src="./style.css"></style>
