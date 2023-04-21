/**
 * Incident Alerting Model
 * @VueIncidentAlerts
 * @author joe@kt3i.com
 * @version 0.0.1
 * @license MIT
 */
import Utils from "./utils";
import { icon, latLng } from "leaflet";
import { LMap, LTileLayer, LMarker, LPopup, LTooltip } from "vue2-leaflet";
import { library } from "@fortawesome/fontawesome-svg-core";
import { faBolt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";

library.add(faBolt);

export default {
  name: "VueIncidentAlerts",

  components: {
    FontAwesomeIcon,
    LMap,
    LTileLayer,
    LMarker,
    LPopup,
    LTooltip,
  },

  props: {
    // List of incident objects
    incidents: {
      type: Array,
      default: () => [],
    },

    // Mapping zoom level
    zoom: {
      type: Number,
      default: 18,
    },

    // Tile Server URL
    url: {
      type: String,
      default: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    },

    // Flag, if true displays map
    showMap: {
      type: Boolean,
      default: true,
    },
  },

  destroyed() {
    // clearTimeout(this.timeout);
  },

  methods: {
    /**
     * Takes an incident type and returns an Icon representing that incidnet
     *
     * @TODO Use fetch request to backend to generate map marker
     * @params {String} incidentType
     * @returns {Object} Leaflet JS Icon for incidentType
     */
    generateIcon(incidentType = "") {
      let iconString = Utils.getIncidentIcon(incidentType);

      if (iconString) {
        console.log(iconString);
      }

      return icon({
        iconUrl: require("./icons/fire.png"),
        iconSize: [30, 30],
      });
    },

    /**
     * Takes a lat lon pair and produces a Leaflet's object for ccentering
     * a map.
     *
     * @params {Number} Lat - latitude
     * @params {Number} Lng - Longitude
     * @returns {Object} LatLng object representing the point lat,lng
     */
    mapMe(lat, lng) {
      return latLng(lat, lng);
    },

    /**
     * Trigger an event to remove an incident
     *
     * @params {String} Incident - object containing incident infromation
     */
    unalert(incident) {
      this.$emit("unalertIncident", incident);
    },

    /**
     * Reformats timeStr in the form of hh:mm
     *
     * @params {String} timeStr - String representing a time
     * @returns {String} timeStr reformated to hh:mm
     */
    formatTime(timeStr) {
      let dt = new Date(timeStr);
      return `${this.padTime(dt.getHours())}:${this.padTime(dt.getMinutes())}`;
    },

    /**
     * Takes a string and returns a string of most 2 chars, padded left padded
     * by zeros
     *
     * @params {String} time - string to pad
     * @returns {String} 2 chars long string padded by zeros
     */
    padTime(time) {
      return time.toString().padStart(2, 0);
    },

    /**
     * Takes a string and returns a string of most 2 chars, padded left padded
     * by zeros
     *
     * @params {String} statusId - Status Id
     * @returns {String} CSS class name representing the unit status
     */
    colorUnit(statusId) {
      return `vwia__unit_status_${Utils.getUnitIncidentStatus(statusId)}`;
    },

    /**
     * Closes all alerts in the case where the modal window is forced to
     * close we will clear all incidents
     *
     */
    closeAlerts() {
      this.incidents.forEach((incident) =>
        this.$emit("unalertIncident", incident.id)
      );
    },

    /**
     * Force screen to resize when loading alerts.  This forces Leaflet
     * to resize the map and request the appropriate source data
     *
     */
    openAlerts() {
      setTimeout(() => {
        window.dispatchEvent(new Event("resize"));
      }, 100);
    },
  },

  computed: {
    /**
     * Number of alerted incidents
     */
    numAlertedIncidents() {
      return this.incidents.length;
    },

    /**
     * showAlert is true iff there are incidents to alert
     */
    showAlert() {
      return this.incidents.length > 0;
    },
  },
};
