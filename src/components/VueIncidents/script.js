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
      incidents: [],
      units: [],
      unitsToAlert: [],
      error: null,
      alertedIncidents: [],
      alertCounters: {},
      reconnectTimout: null,
      alertingTimeout: null,
    };
  },

  created() {
    document.title = this.alertForAllIncidents
      ? `${this.station}-ALL`
      : `${this.station}`;
  },

  mounted() {
    this.initHubConnection();
    this.$on("unalertIncident", this.unalertIncident);
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
    clearTimeout(this.alertingTimeout);
    clearTimeout(this.reconnectTimout);
  },

  computed: {
    cleanIncidents() {
      return this.incidents.filter(
        (inc) =>
          inc.masterIncidentNumber !== null && inc.unitsAssigned.length !== 0
      );
    },
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
        this.reconnectTimout = setTimeout(() => {
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
      this.alertingTimeout = setTimeout(() => {
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
     * @params {Number} incidentId number representing an incident
     */
    alertIncident(incidentId) {
      const idx = this.getIndexOfIncident(incidentId);
      if (idx === -1) {
        console.error(`Alert requested for unknown incident #${incidentId}.`);
      } else {
        console.info(
          "***************************************\n",
          `**** Alert Requested for Incident `,
          `${this.incidents[idx].masterIncidentNumber} `,
          this.incidents[idx],
          "\n***************************************\n"
        );
        const alertedAlready = this.alertedIncidents.includes(
          this.incidents[idx]
        );
        if (!alertedAlready) {
          this.alertedIncidents.push(this.incidents[idx]);
        } else {
          console.info(
            `\t${this.incidents[idx].masterIncidentNumber} already alerts`
          );
        }
      }
    },

    /**
     * Alerts on the provided incident and starts timeout timer
     *
     * @params {Number} incidentId number representing an incident
     */
    dispatchUnit(incidentId) {
      this.alertIncident(incidentId);
      this.alertCounters[incidentId.toString()] = 0;
    },

    /**
     * Removed incident from alerts
     *
     * @params {Number} incidentId number representing an incident
     */
    unalertIncident(incidentId) {
      incidentId = Number(incidentId);
      const idx = this.alertedIncidents.findIndex(
        (inc) => incidentId === inc.id
      );
      if (idx !== -1) {
        this.alertedIncidents.splice(idx, 1);
        console.info(`\tIncident ${incidentId} unalerted.`);
      } else {
        console.warn(
          `Unable to unalert incident ${incidentId}, no such incident found.`
        );
      }
      delete this.alertCounters[incidentId.toString()];
    },

    /**
     * Gets incident index from incident id
     *
     * @params {Number} incidentId unique id for an incident
     * @returns {Number} index for the incident with with ID incident in
     *                   this.incidents or -1 if not found
     */
    getIndexOfIncident(incidentId) {
      return this.incidents.findIndex((inc) => incidentId === inc.id);
    },

    /**
     * Filters the unit list to create a list of radio names for this to
     * alert on
     *
     * @params {Number} incidentId unique id for an incident
     * @returns {Number} index for the incident with with ID incident in
     *                   this.incidents or -1 if not found
     */
    generateUnitsToAlert() {
      this.unitsToAlert = this.units.reduce((udx, unit) => {
        if (unit.currentStation === this.station) {
          udx.push(unit.radioName);
        }
        return udx;
      }, []);
      console.info(
        `${"*".padStart(
          79,
          "*"
        )}\nThis station alerts on\n\t${this.unitsToAlert.join(
          "\n\t"
        )}\n${"*".padStart(79, "*")}`
      );
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
        this.generateUnitsToAlert();
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
      let idx = this.getIndexOfIncident(incident.id);
      if (idx === -1) {
        // We don't have a record of this incidnet, lets create it
        this.incidents.unshift(incident);
        console.info(`\tIncident ${incident.id} opened:`, incident);
        idx = 0;
      } else {
        // We have a record of this incident, lets update it
        console.warn(
          `New incident request received for ${incident.id} but we already have it.`,
          incident
        );
        // Something must have gone wrong, replace the entire incident
        this.incidents.splice(idx, 1, incident);
      }
      if (this.alertOnUnits(incident.unitsAssigned) && incident.isActive) {
        this.dispatchUnit(incident.id);
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
      console.info(`\tRemove incident requested for ${incidentId}`);
      const idx = this.getIndexOfIncident(incidentId);
      if (idx !== -1) {
        this.incidents.splice(idx, 1);
        console.info(`\tIncident ${incidentId} removed`);
      } else {
        console.warn(
          `Unable to remove incident ${incidentId}, no such incident found.`
        );
      }
    },

    /**
     * Gets called by the incidents-removed event, adds or updates an incident
     * in the incidents list, then generats an alert if needed
     *
     * @param {Array} incidentIds array of nunique identifier for the incident
     *                to beremoved
     */
    onIncidentsRemoved(incidentIds) {
      console.info(
        `\tRemoval of incidents ${incidentIds.join(", ")} has been requested`
      );
      incidentIds.forEach((incidentId) => {
        this.onIncidentRemoved(incidentId);
      });
      console.info("\t**********************");
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
        `\tIncident field change for ${update.incidentId} received: `,
        update
      );
      const idx = this.getIndexOfIncident(update.incidentId);
      if (idx !== -1) {
        // const inc = this.incidents[idx][update] = update.value;
        this.incidents.splice(idx, 1, {
          ...this.incidents[idx],
          [update.field]: update.value,
        });
      } else {
        console.error(
          `Unable to find incident ${update.incidentId} during incident update.`,
          update
        );
      }
    },

    /**
     * Gets called by the incident-unit-updated event, adds or updates an unit
     * attached to a specific incident also updates the unit record
     *
     * @param {Object} update Object representing changes to a unit
     */
    onIncidentUnitUpdated(update) {
      console.info(
        `\tIncident unit update for incident id# ${update.incidentId} received: `,
        update
      );
      const idx = this.getIndexOfIncident(update.incidentId);

      if (idx !== -1) {
        // We have a valid index so we must have the incident
        // Get the assigned unit's index
        const udx = this.incidents[idx].unitsAssigned.findIndex(
          (unit) => unit.radioName === update.unit.radioName
        );
        if (udx === -1) {
          // We don't have the unit assigned to this call, let us assign it
          this.incidents[idx].unitsAssigned.push(update.unit);
          // this.incidents.splice(idx, 1, unt);
          console.info(
            `\tAdding ${update.unit.radioName} to ${this.incidents[idx].masterIncidentNumber}.`
          );
          if (this.alertOnUnits([update.unit])) {
            this.dispatchUnit(update.incidentId);
          }
        } else {
          // Unit is on call, lets change its status
          this.incidents[idx].unitsAssigned.splice(udx, 1, {
            ...this.incidents[idx].unitsAssigned[udx],
            ...update.unit,
          });
        }
      }
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
      const idx = this.getIndexOfIncident(comment.incidentId);
      if (idx !== -1) {
        // We have a valid index so we must have the incident
        if (this.incidents[idx].comments === null) {
          this.incidents[idx].comments = [];
        }

        // Check for dupliace comments
        const cdx = this.incidents[idx].comments.findIndex(
          (cmnt) => comment.comment.id === cmnt.id
        );
        if (cdx === -1) {
          this.incidents[idx].comments.push(comment.comment);
        } else {
          this.incidents[idx].comments.splice(cdx, 1, comment.comment);
          console.warn(
            `Duplicate comments found on incident ${comment.incidentId}`,
            comment.comment
          );
        }
      }
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
      const udx = this.units.findIndex(
        (udx) => udx.radioName == update.radioName
      );
      if (udx !== -1) {
        // Update unit if we found it
        this.units.splice(udx, 1, {
          ...this.units[udx],
          [update.field]: update.value,
        });
      } else {
        // Add data to new unit if we could not find it
        console.info(`${update.radioName} not found, adding it.`);
        this.units.push({
          radioName: update.radioName,
          [update.field]: update.values,
        });
      }

      // Handle updates to alerting
      if (update.field === "currentStation") {
        this.generateUnitsToAlert();
      }
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
