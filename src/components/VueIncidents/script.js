import Utils from "./utils";
import VueIncidentAlerts from "@/components/VueIncidentAlerts";

export default {
  name: "VueIncidents",

  components: {
    // FontAwesomeIcon,
    VueIncidentAlerts,
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
      units: null,
      error: null,
      showAlert: false,
    };
  },

  mounted() {
    this.loadIncidents();
    // this.$incidentHub.$on('other-added', this.onOtherAdded);
    // this.$incidentHub.$on('incident-added', this.onIncidentAdded);
    this.$dashboardHub.$on("incident-added", this.onIncidentAdded);
    this.$dashboardHub.$on("incident-updated", this.onIncidentUpdated);
    this.$dashboardHub.$on("incident-unit-updated", this.onIncidentUnitUpdated);
    this.$dashboardHub.$on(
      "incident-comment-added",
      this.onIncidentCommentAdded
    );
    this.$dashboardHub.$on("unit-status-change", this.onUnitStatusChange);
  },

  destroyed() {
    // clearTimeout(this.timeout);
  },

  methods: {
    alertAll: function (msg) {
      alert(msg);
    },
    loadIncidents() {
      return Utils.fetchIncidents({
        url: this.url,
      }).then((data) => {
        this.$set(this, "incidents", data.slice().reverse());
        // this.incidents.forEach((idx) => this.$incidentHub.incidentOpened(idx.id));
        this.incidents.forEach((idx) => {
          // this.$dashboardHub.incidentOpened(idx.id);
          console.log(`Incident ${idx.id} opened:`, idx);
        });
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
    // Handle incoming messages
    onIncidentAdded(incident) {
      let thisIncident = this.incidents.filter((inc) => incident.id === inc.id);
      if (thisIncident > 0) {
        thisIncident = incident;
      } else {
        this.incidents.unshift(incident);
      }

      // this.incidents.forEach((idx) =>
      //   // this.$dashboardHub.incidentOpened(idx.id)
      // );
    },
    onIncidentUpdated(update) {
      this.incidents.forEach((incident) => {
        if (incident.id == update.incidentId) {
          incident[update.field] = update.value;
        }
      });
    },
    onIncidentUnitUpdated(update) {
      console.log("Incident unit update:", update);
      this.incidents.forEach((incident) => {
        // console.log(`  *** |${typeOf(incident.id)}| - |${typeOf(msg.incidentId)}|`)
        if (incident.id == update.incidentId) {
          if (incident.unitsAssigned == null) {
            incident.unitsAssigned = [update.unit];
          } else {
            let newUnit = true;
            incident.unitsAssigned.forEach((unit) => {
              if (unit.radioName == update.unit.radioName) {
                unit.statusId = update.unit.statusId;
                newUnit = false;
              }
            });
            if (newUnit) {
              incident.unitsAssigned.push({
                radioName: update.unit.radioName,
                statusId: update.unit.statusId,
              });
            }
          }
        }
      });
    },
    onIncidentCommentAdded(comment) {
      console.log(
        `Incident comment added to incident ${comment.incidentId}: `,
        comment
      );
      this.incidents.forEach((incident) => {
        if (incident.id == comment.incidentId) {
          if (incident.comments == null) {
            incident.comments = [];
          }
          incident.comments.push(comment.comment);
        }
      });
    },
  },
};
