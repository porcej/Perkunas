<template>
  <div class="vwi__incidents">
    <VueIncidentAlerts
      :incidents="alertedIncidents"
      @unalertIncident="unalertIncident"
    />
    <ul class="vwi__incidents_list">
      <li
        class="vwi__incident"
        v-for="incident in incidents"
        :key="incident.id"
        @click="alertIncident(incident)"
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
      </li>
    </ul>
  </div>
</template>

<script src="./script.js"></script>

<style scoped src="./style.css"></style>
