<template>
  <div class="vwi__incidents">
    <div class="vwi__loading" v-if="loading">
      <slot name="loading">
        <h1>Loading...</h1>
        <p><font-awesome-icon icon="spinner" size="2x" /></p>
      </slot>
    </div>
    <VueIncidentAlerts
      :incidents="alertedIncidents"
      @unalertIncident="unalertIncident"
    />
    <ul class="vwi__incidents_list">
      <li
        class="vwi__incident"
        v-for="incident in cleanIncidents"
        :key="incident.id"
        @click="alertIncident(incident.id)"
      >
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
          <span class="vwi__call_type"> {{ incident.problem }} </span>
        </div>
        <div class="vwi__address">
          {{ incident.address }}
          <span class="vwi__apt"> {{ incident.apartment }} </span>
          <span class="vwi__city"> {{ incident.county }} </span>
        </div>
        <div class="vwi__call_info">
          <span class="vwi__radio_channel">
            <font-awesome-icon icon="bolt" />
            {{ incident.primaryTacChannel }}
          </span>
          <span class="vwi__call_time float-right">
            {{ formatTime(incident.incidentStartDateTime) }}
          </span>
        </div>
      </li>
    </ul>
  </div>
</template>

<script src="./script.js"></script>

<style scoped src="./style.css"></style>
