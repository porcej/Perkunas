import Utils from "./utils";

export default {
  name: "VueIncidentAlerts",

  components: {
    // FontAwesomeIcon,
  },

  props: ["incidents", "showAlert"],
  // props: {
  //   // incidents: {
  //   //   type: Object,
  //   //   showModal: 
  //   // },
  //   []
  // },

  destroyed() {
    // clearTimeout(this.timeout);
  },

  methods: {
    formatTime(timeStr) {
      let dt = new Date(timeStr);
      return `${this.padTime(dt.getHours())}:${this.padTime(dt.getMinutes())}`;
    },
    padTime(time) {
      return time.toString().padStart(2, 0);
    },
    colorUnit(id) {
      return `vwi__unit_status_${Utils.getUnitIncidentStatus(id)}`;
    },
    closeAlert() {
      this.$emit("close");
    },
  },
};
