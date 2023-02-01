import Utils from "./utils";
import VueIncidentAlerts from "@/components/VueIncidentAlerts";

export default {
  name: "VueIncidents",

  components: {
    // FontAwesomeIcon,
    VueIncidentAlerts,
  },

  props: {
    incidentsUrl: {
      type: String,
    },
    unitsUrl: {
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
      unitsToAlert: null,
      error: null,
      showAlert: false,
      alertedIncidents: [],
    };
  },

  mounted() {
    this.loadIncidents();
    this.loadUnits();
    this.$dashboardHub.$on("incident-added", this.onIncidentAdded);
    this.$dashboardHub.$on("incident-updated", this.onIncidentUpdated);
    this.$dashboardHub.$on("incident-removed", this.onIncidentRemoved);
    this.$dashboardHub.$on("incidents-removed", this.onIncidentsRemoved);
    this.$dashboardHub.$on("incident-unit-updated", this.onIncidentUnitUpdated);
    this.$dashboardHub.$on(
      "incident-comment-added",
      this.onIncidentCommentAdded
    );
    this.$dashboardHub.$on("unit-updated", this.onUnitUpdated);
  },

  destroyed() {
    // clearTimeout(this.timeout);
  },

  methods: {
    alertIncident: function (incident) {
      this.alertedIncidents.push(incident);
      this.showAlert = true;
    },
    unalertIncident(incident) {
      const idx = this.alertedIncidents.indexOf(incident);
      if (idx !== -1) {
        this.alertedIncidents.splice(idx, 1);
      }
    },
    loadIncidents() {
      return Utils.fetchIncidents({
        url: this.incidentsUrl,
      }).then((data) => {
        this.$set(this, "incidents", data.slice().reverse());
        this.incidents.forEach((idx) => {
          // this.$dashboardHub.incidentOpened(idx.id);
          console.log(`Incident ${idx.id} opened:`, idx);
        });
      });
    },
    loadUnits() {
      return Utils.fetchUnits({
        url: this.unitsUrl,
      }).then((data) => {
        this.$set(this, "units", data);
        this.units.forEach((udx) => {
          console.log(`Tracking ${udx.radioName} unit.`);
        });
        this.unitsToAlert = this.units.filter(udx => udx.currentStation === this.station).map(udx => udx.radioName);
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
    },
    onIncidentRemoved(incidentId) {
      console.log(`Incident ${incidentId} removed`);
      const thisIncident = this.incidents.filter(
        (inc) => incidentId === inc.id
      );
      const idx = this.incidents.indexOf(thisIncident);
      if (idx !== -1) {
        this.incidents.splice(idx, 1);
      }
    },
    onIncidentsRemoved(incidentIds) {
      console.log("Removing incidents...");
      incidentIds.forEach((incidentId) => {
        this.onIncidentRemoved(incidentId);
      });
      console.log("...Incidents removed.");
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
    onUnitUpdated(update) {
      const thisUnit = this.unitsToAlert.filter(
        (udx) => udx.radioName === update.radioName
      );
      console.log(`This unit: ${thisUnit}`, thisUnit);
      // Check if we have to add this to the alerts list
      if (update.field === "currentStation") {
        if (update.value === this.station){
          // Ensure we 
        }
      }

      // console.log("UNIT UPDATED RXED \n UNIT UPDATED RXED", update);
      // 
      // console.log(`=+=+ ${update.radioName}: ${thisUnit}`);
      // // // Handle add/remove alerting unit
      // // if (update.field == 'currentStation') {
      // //   if (value == this.station) {

      // //   }
      // // }
      // // if (this.unitsToAlert == null) {

      // // } else{

      // //   let newUnit = true;
      // //   this.unitsToAlert.forEach((unit) => {
      // //     if (unit.radioName == update.radioName) {
      // //       unit[update.field] = update.value;
      // //       newUnit = false;
      // //     }
      // //   });
      // //   if (newUnit &&  )
      // // }
    },
  },
};
