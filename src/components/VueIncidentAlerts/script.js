import Utils from "./utils";
// import L from 'leaflet';
// import { LMap, LTileLayer, LMarker } from 'vue2-leaflet';
import { latLng } from "leaflet";
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
    incidents: {
      type: Array,
      default: () => [],
    },
    zoom: {
      type: Number,
      default: 18,
    },
    url: {
      type: String,
      default: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    },
    showMap: {
      type: Boolean,
      default: true,
    },
  },

  destroyed() {
    // clearTimeout(this.timeout);
  },

  methods: {
    mapMe(lat, lng) {
      return latLng(lat, lng);
    },
    unalert(incident) {
      this.$emit("unalertIncident", incident);
    },
    formatTime(timeStr) {
      let dt = new Date(timeStr);
      return `${this.padTime(dt.getHours())}:${this.padTime(dt.getMinutes())}`;
    },
    padTime(time) {
      return time.toString().padStart(2, 0);
    },
    colorUnit(id) {
      return `vwia__unit_status_${Utils.getUnitIncidentStatus(id)}`;
    },
    closeAlerts() {
      // In the case where the modal window is forced close we will clear all incidents
      this.incidents.forEach((incident) =>
        this.$emit("unalertIncident", incident.id)
      );
    },
    openAlerts() {
      setTimeout(() => {
        window.dispatchEvent(new Event("resize"));
      }, 100);
    },
  },
  computed: {
    numAlertedIncidents() {
      return this.incidents.length;
    },
    showAlert() {
      return this.incidents.length > 0;
    },
  },
};
