import Utils from "./utils";

export default {
  name: "VueIncidents",

  components: {
    // FontAwesomeIcon,
  },

  props: {
    url: {
      type: String,
    },

    station: {
      type: String,
      required: true,
    },
  },

  data() {
    return {
      loading: true,
      incidents: null,
      error: null,
    };
  },

  mounted() {
    this.loadIncidents();
    // Incident actions
    this.$dashboardHub.$on("incident-added", this.onIncidentAdded);
    // this.$dashboardHub.$on(
    //   "incident-field-changed",
    //   this.onIncidentFieldChanged
    // );
    // this.$dashboardHub.$on(
    //   "incident-unit-status-changed",
    //   this.onIncidentUnitStatusChanged
    // );
    // this.$dashboardHub.$on(
    //   "incident-comment-added",
    //   this.onIncidentCommentAdded
    // );
    this.$dashboardHub.$on(
      "incident-field-changed",
      this.onIncidentUpdated
    );
    this.$dashboardHub.$on(
      "incident-unit-status-changed",
      this.onIncidentUpdated
    );
    this.$dashboardHub.$on("incident-comment-added", this.onIncidentUpdated);
    this.$dashboardHub.$on("incident-updated", this.onIncidentUpdated);
    this.$dashboardHub.$on("incident-unit-updated", this.onIncidentUnitUpdated);
    // Unit Actions
    this.$dashboardHub.$on("unit-status-changed", this.onUnitStatusChanged);
    this.$dashboardHub.$on("unit-home-changed", this.onUnitHomeChanged);
  },

  destroyed() {
    // clearTimeout(this.timeout);
  },

  methods: {
    loadIncidents() {
      return Utils.fetchIncidents({
        url: this.url,
      }).then((data) => {
        this.$set(this, "incidents", data.slice().reverse());
        // this.incidents.forEach((idx) => this.$incidentHub.incidentOpened(idx.id));
        this.incidents.forEach((idx) =>
          this.$dashboardHub.incidentOpened(idx.id)
        );
        // this.$incidentHub.incidentOpened
        console.log("Incident: ", data);
      });
    },
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
    onIncidentAdded(incident) {
      this.incidents.unshift(incident);
      this.incidents.forEach((idx) =>
        this.$dashboardHub.incidentOpened(idx.id)
      );
    },
    onIncidentUpdated(update) {
      this.incidents.forEach((incident) => {
        if (incident.id == update.incidentId) {
          incident[update.field] = update.value;
        }
      });
    },
    onIncidentUnitUpdated(update) {
      this.incidents.forEach((incident) => {
        // console.log(`  *** |${typeOf(incident.id)}| - |${typeOf(msg.incidentId)}|`)
        if (incident.id == update.incidentId) {
          let newUnit = true;
          incident.units.forEach((unit) => {
            if (unit.radioName == update.unit.radioName) {
              unit.statusId = update.unit.statusId;
              newUnit = false;
            }
          });
          if (newUnit) {
            incident.units.push({
              radioName: update.unit.radioName,
              statusId: update.unit.statusId,
            });
          }
        }
      });
    },
  },
};
