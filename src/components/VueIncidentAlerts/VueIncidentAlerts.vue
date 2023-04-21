<template>
  <div>
    <b-modal
      v-model="showAlert"
      id="vwia__fullScreenAlert"
      class="vwia__incident_alert modal-fullscreen"
      hide-header
      hide-footer
      @hidden="closeAlerts"
      @shown="openAlerts"
    >
      <div class="container-fluid h-100 vwia__alert_wrapper">
        <div class="row h-100" v-for="incident in incidents" :key="incident.id">
          <div class="col-5 h-100 pl-4 pt-1">
            <div class="vwia__units row">
              <span
                :class="[`vwia__unit ${colorUnit(unit.statusId)}`]"
                v-for="unit in incident.unitsAssigned"
                :key="unit.radioName"
              >
                {{ unit.radioName }}
              </span>
            </div>
            <div class="row">
              <h2 class="vwia__title">
                <span class="vwia__problem">{{ incident.problem }} </span>
                <span class="vwia__radio pull-right">
                  <font-awesome-icon icon="bolt" />
                  {{ incident.primaryTacChannel }}
                </span>
              </h2>
            </div>
            <div class="row">
              <h3 class="vwia__address">
                {{ incident.address }}
                <span class="vwia__city"> {{ incident.county }} </span>
              </h3>
            </div>
            <div class="vwia__more_info row">
              <div class="vwia__mapbox col">
                Box:
                <span class="vwia__mapbox_val"> {{ incident.mapInfo }} </span>
              </div>
              <div class="vwia__xstreet col text-right">
                X Streets:
                <span class="vwia__xstreet_val">
                  {{ incident.crossStreet }}
                </span>
              </div>
            </div>
            <p class="vwia__notes">
              <span
                v-for="comment in incident.comments"
                :key="'comment_' + comment.id.toString()"
              >
                {{ comment.text }} <br />
              </span>
            </p>
            <button class="button_close" @click="unalert(incident.id)">
              X
            </button>
          </div>
          <div class="col-7 h-100 px-0">
            <l-map
              v-if="showMap"
              :zoom="zoom"
              :center="mapMe(incident.latitude, incident.longitude)"
              style="width:100%,height:100%"
            >
              <l-tile-layer :url="url" />
              <l-marker
                :icon="generateIcon()"
                :lat-lng="mapMe(incident.latitude, incident.longitude)"
              />
            </l-map>
          </div>
        </div>
      </div>
    </b-modal>
  </div>
</template>

<script src="./script.js"></script>
<style src="./style.css"></style>
