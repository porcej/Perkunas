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
    reconnectTicker: {
      type: Number,
      default: 5000,
    },
    alertForAllIncidents: {
      type: Boolean,
      default: false,
    },
    alertTimeOut: {
      type: Number,
      default: 120,
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
      alertCounters: {},
    };
  },

  created() {
    document.title = this.alertForAllIncidents
      ? `${this.station}-ALL`
      : `${this.station}`;
  },

  mounted() {
    this.initHubConnection();
    this.$dashboardHub.$on("disconnected", this.onDisconnect);
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
    /**
     * Checks if we are connected to a SignalR hub and if we are joins calls
     * the JoinDashboard hook on the hub then loads units and incidents,
     * otherwise waits reconnectTicker ms to attempt a reconnect
     *
     */
    initHubConnection() {
      if (this.$dashboardHub.state() === "Connected") {
        console.info("Connected to hub.");
        this.$dashboardHub.JoinDashboard();
        this.loadIncidents();
        this.loadUnits();
        this.alertTimer();
      } else {
        console.info("Connecting...");
        setTimeout(() => {
          this.initHubConnection();
        }, this.reconnectTicker);
      }
    },

    /**
     * Handles a SignalR disconect event by attempting to reconnect
     *
     */
    onDisconnect() {
      console.warn("Disconnected from hub.");
      this.initHubConnection();
    },

    /**
     * Ticks alert timeout by 1
     *
     */
    alertTimer() {
      setTimeout(() => {
        Object.keys(this.alertCounters).forEach((cdx) => {
          if (this.alertCounters[cdx] > this.alertTimeOut) {
            this.unalertIncident(cdx);
          } else {
            this.alertCounters[cdx]++;
          }
        });
        this.alertTimer();
      }, 1000);
    },

    /**
     * Adds an incident to the alerts modal window
     *
     * @params {Object} incident Object representing incident to be alerted
     */
    alertIncident(incident) {
      console.info(
        "***************************************\n",
        `**** Alert Requested for Incident ${incident.masterIncidentNumber} `,
        incident,
        "\n***************************************\n"
      );
      const alertedAlready = this.alertedIncidents.includes(incident);
      if (!alertedAlready) {
        this.alertedIncidents.push(incident);
        this.showAlert = true;
      }
    },

    /**
     * Alerts on the provided incident and starts timeout timer
     *
     * @params {Object} incident Object representing incident to be alerted
     */
    dispatchUnit(incident) {
      this.alertIncident(incident);
      this.alertCounters[incident.id] = 0;
    },

    /**
     * Removed incident from alerts
     *
     * @params {Object} incident Object representing incident to be alerted
     */
    unalertIncident(incident) {
      const idx = this.alertedIncidents.indexOf(incident);
      if (idx !== -1) {
        this.alertedIncidents.splice(idx, 1);
      }
      delete this.alertCounters[incident.id];
    },

    /**
     * Fetches incidents from API
     *
     */
    loadIncidents() {
      return Utils.fetchIncidents({
        url: this.incidentsUrl,
      }).then((data) => {
        this.$set(this, "incidents", data.slice().reverse());
        this.incidents.forEach((idx) => {
          console.info(
            `Incident ${idx.masterIncidentNumber} with ${idx.id} opened:`,
            idx
          );
        });
      });
    },

    /**
     * Fetches units from API
     *
     */
    loadUnits() {
      return Utils.fetchUnits({
        url: this.unitsUrl,
      }).then((data) => {
        this.$set(this, "units", data);
        this.unitsToAlert = this.units
          .filter((udx) => udx.currentStation === this.station)
          .map((udx) => udx.radioName);
      });
    },

    /**
     * Checks to see if we should alert for any of the units units can be
     * strings of objects so long as any objects have a radioName field
     * that is a string
     *
     * @param {Array} units array representing units
     * @returns {Boolean} true if and only if we should alert
     */
    alertOnUnits(units) {
      const alertedUnits =
        typeof units !== "string"
          ? units.filter((udx) => this.unitsToAlert.includes(udx.radioName))
          : units.filter((udx) => this.unitsToAlert.includes(udx));

      return this.alertForAllIncidents || alertedUnits.length > 0;
    },

    /**
     * Gets called by the incident-added event, adds or updates an incident in
     * the incidents list, then generats an alert if needed
     *
     * @param {Object} incident object representing new incident information
     */
    onIncidentAdded(incident) {
      console.info("\tIncidented Added: ", incident);
      const thisIncidentIndex = this.incidents.findIndex(
        (inc) => incident.id === inc.id
      );
      if (thisIncidentIndex === -1) {
        // We don't have a record of this incidnet, lets create it
        this.incidents.unshift(incident);
        console.info(`\tIncident ${incident.id} opened:`, incident);
      } else {
        // We have a record of this incident, lets update it
        console.info(`\t*** Incident ${incident.id} reopened:`, incident);
        this.incidents[thisIncidentIndex] = incident;
      }
      if (this.alertOnUnits(incident.unitsAssigned)) {
        this.dispatchUnit(this.incident[thisIncidentIndex]);
      }
    },

    /**
     * Gets called by the incident-removed event, adds or updates an incident in
     * the incidents list, then generats an alert if needed
     *
     * @param {Number} incidentId unique identifier for the incident to be
     *                 removed
     */
    onIncidentRemoved(incidentId) {
      console.info("\tIncident Removed: ", incidentId);
    },

    /**
     * Gets called by the incidents-removed event, adds or updates an incident
     * in the incidents list, then generats an alert if needed
     *
     * @param {Array} incidentIds array of nunique identifier for the incident
     *                to beremoved
     */
    onIncidentsRemoved(incidentIds) {
      console.info("\tIncidents removed: ", incidentIds);
    },

    /**
     * Gets called by the incident-removed event, adds or updates an incident
     * in the incidents list, then generats an alert if needed
     *
     * @param {Array} incidentIds array of nunique identifier for the incident
     *                to beremoved
     */
    onIncidentUpdated(update) {
      console.info(
        `\tIncident field change for ${update.indentId} received: `,
        update
      );
    },

    /**
     * Gets called by the incident-unit-updated event, adds or updates an unit
     * attached to a specific incident also updates the unit record
     *
     * @param {Object} update Object representing changes to a unit
     */
    onIncidentUnitUpdated(update) {
      console.info(
        `\tIncident unit update for incident id# ${update.indentId} received: `,
        update
      );
    },

    /**
     * Gets called by the incident-comment-added event, adds or updates an
     * incident comment
     *
     * @param {Object} comment Object representing a complet or partial
     *                 incident comment
     */
    onIncidentCommentAdded(comment) {
      console.info(
        `\tIncident comment added to incident ${comment.incidentId}: `,
        comment
      );
    },

    /**
     * Gets called by the unit-updated, updates a unit.  if the unit is not
     * known then a new unit is created that includes the update
     *
     * @param {Object} update object representing a change to a unit
     */
    onUnitUpdated(update) {
      console.info(
        `\tUnit: ${update.radioName} updated ${update.field}: ${update.value} `
      );
    },

    /**
     * Formats timestamp for dashboard display
     *
     * @param {String} timeStr String representing date time
     * @returns {String} Formated string
     */
    formatTime(timeStr) {
      let dt = new Date(timeStr);
      return `${this.padTime(dt.getHours())}:${this.padTime(dt.getMinutes())}`;
    },

    /**
     * Returns time
     *
     * @param {Object} time object representing a date and time
     * @returns {String} Zero padded time string
     */
    padTime(time) {
      return time.toString().padStart(2, 0);
    },

    /**
     * Returns a string representing a CSS class corrisponding to the units
     * status code
     *
     * @param {Number} time object representing a date and time
     * @returns {String} CSS class selector corrisponding to the
     *                   Unit's Stats code
     */
    colorUnit(id) {
      return `vwi__unit_status_${Utils.getUnitIncidentStatus(id)}`;
    },
  },
};
