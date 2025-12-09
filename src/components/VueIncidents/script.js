import Utils from "./utils";
import VueIncidentAlerts from "@/components/VueIncidentAlerts";
import logger from "@/utils/logger";

import { library } from "@fortawesome/fontawesome-svg-core";
import { faBolt, faSpinner } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";

library.add(faBolt, faSpinner);

export default {
  name: "VueIncidents",

  components: {
    FontAwesomeIcon,
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
      reconnectTimeout: null,
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
    clearTimeout(this.reconnectTimeout);
    this.alertCounters = {};
    // Clean up event listeners
    this.$off("unalertIncident", this.unalertIncident);
    this.$dashboardHub.$off("disconnected", this.onDisconnect);
    this.$dashboardHub.$off("incident-added", this.onIncidentAdded);
    this.$dashboardHub.$off("incident-updated", this.onIncidentUpdated);
    this.$dashboardHub.$off("incident-removed", this.onIncidentRemoved);
    this.$dashboardHub.$off("incidents-removed", this.onIncidentsRemoved);
    this.$dashboardHub.$off("incident-unit-updated", this.onIncidentUnitUpdated);
    this.$dashboardHub.$off("incident-comment-added", this.onIncidentCommentAdded);
    this.$dashboardHub.$off("unit-updated", this.onUnitUpdated);
  },

  computed: {
    /**
     * Generates filtered list of incidents. specifically incidents without
     * units assigned or without a master incident number are reemoved
     *
     * @returns {Array} array of filtered incidents
     */
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
        logger.info("Connected to hub.");
        this.$dashboardHub.JoinDashboard();
        this.loadIncidents();
        this.loadUnits();
        this.alertTimer();
        this.loading = false;
      } else {
        logger.info("Connecting...");
        this.reconnectTimeout = setTimeout(() => {
          this.initHubConnection();
        }, this.reconnectTicker);
      }
    },

    /**
     * Handles a SignalR disconect event by attempting to reconnect
     *
     */
    onDisconnect() {
      logger.warn("Disconnected from hub.");
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
     * @returns {Boolean} true iff the alert is initiated, false otherwise
     */
    alertIncident(incidentId) {
      const idx = this.getIndexOfIncident(incidentId);
      if (idx === -1) {
        logger.error(`Alert requested for unknown incident #${incidentId}.`);
        return false;
      } else {
        logger.info(
          "***************************************\n",
          `**** Alert Requested for Incident `,
          `${this.incidents[idx].masterIncidentNumber} `,
          this.incidents[idx],
          "\n***************************************\n"
        );

        // now we check if we have already alerted on this incident
        if (
          this.alertedIncidents.findIndex((inc) => incidentId === inc.id) >= 0
        ) {
          logger.info(
            `\tAlert canceled for ${this.incidents[idx].masterIncidentNumber} already alerted.`
          );
          return false;
        }
        this.alertedIncidents.push(this.incidents[idx]);
        return true;
      }
    },

    /**
     * Checks to see if we need to alert for incident id
     *
     * @params {Number} incidentId number representing an incident
     * @params {Boolean} alert flag to set timeout counter on true
     * @returns {Boolean} true iff incident is alerted
     */
    dispatchIncident(incidentId, alert = false) {
      logger.debug(`Dispatching incident ${incidentId}.`);
      const idx = this.getIndexOfIncident(incidentId);

      if (idx === -1) {
        logger.error(`Alert requested for unknown incident #${incidentId}.`);
        return false;
      }

      // Incident is not active
      if (!this.incidents[idx].isActive) {
        logger.info(
          `Alert for incident#${incidentId} cancled, incident is not active.`
        );
        return false;
      }

      // Filter the incident units, to those on the call, without an endtime
      // and no alerting window expiration
      const incidentUnits = this.incidents[idx].unitsAssigned.filter(
        (udx) =>
          this.checkUnitTimeout(udx.startDateTime) &&
          udx.endDateTime === null &&
          (this.alertForAllIncidents ||
            this.unitsToAlert.includes(udx.radioName))
      );

      // No units to alert on
      if (incidentUnits.length === 0) return false;

      // const alerted = this.alertIncident(incidentId);

      logger.info(
        `*******************************************\n`,
        `*** Alert Requested for Incident `,
        `${this.incidents[idx].masterIncidentNumber} `,
        this.incidents[idx],
        "\n***************************************\n"
      );

      // now we check if we have already alerted on this incident
      if (
        this.alertedIncidents.findIndex((inc) => incidentId === inc.id) >= 0
      ) {
        logger.info(
          `\tAlert canceled for ${this.incidents[idx].masterIncidentNumber} already alerted.`
        );
        return false;
      }
      this.alertedIncidents.push(this.incidents[idx]);

      // Add our unalert timeout
      if (alert) {
        this.alertCounters[incidentId.toString()] = 0;
        logger.debug(
          `Starting counter for incident `,
          `${this.incidents[idx].masterIncidentNumber}`
        );
      }
      return true;
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
        logger.info(`\tIncident ${incidentId} unalerted.`);
      } else {
        logger.warn(
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
      logger.info(
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
        this.incidents.forEach((inc) => {
          logger.info(
            `Incident ${inc.masterIncidentNumber} with ${inc.id} opened:`,
            inc
          );
          if (this.dispatchIncident(inc.id, true)) {
            logger.debug(
              `Alert requested by incident loader for incident ${inc.masterIncidentNumber} with ${inc.id}.`
            );
          }
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
     * Checks to see if radioName is in our list of units to alert
     *
     * @param {Array} units array representing units
     * @returns {Boolean} true if and only if we should alert
     */
    alertOnUnits(units) {
      // If we alert for everyone check all units to see if we have timeouts
      let alertedUnits = [];
      if (this.alertForAllIncidents) {
        alertedUnits = units.filter((udx) =>
          this.checkUnitTimeout(udx.startDateTime)
        );
      } else {
        alertedUnits =
          typeof units !== "string"
            ? units.filter(
                (udx) =>
                  this.unitsToAlert.includes(udx.radioName) &&
                  udx.endDateTime === null &&
                  this.checkUnitTimeout(udx.startDateTime)
              )
            : units.filter(
                (udx) =>
                  this.unitsToAlert.includes(udx) && udx.endDateTime === null
              );
      }
      return alertedUnits.length > 0;
    },

    /**
     * Checks if datetime is + this.alertTimeOut is less than
     * the current time
     *
     * @param {String} timeString - DateTime to use as reference
     * @returns {Boolean} true iff this unit alerting time has not
     *                    expired
     */
    checkUnitTimeout(timeStr) {
      const dt = new Date(timeStr);
      const now = new Date();
      dt.setSeconds(dt.getSeconds() + this.alertTimeOut);
      return dt >= now || isNaN(dt);
    },

    /**
     * Gets called by the incident-added event, adds or updates an incident in
     * the incidents list, then generats an alert if needed
     *
     * @param {Object} incident object representing new incident information
     */
    onIncidentAdded(incident) {
      logger.info("\tIncidented Added: ", incident);
      let idx = this.getIndexOfIncident(incident.id);
      if (idx === -1) {
        // We don't have a record of this incidnet, lets create it
        this.incidents.unshift(incident);
        logger.info(`\tIncident ${incident.id} opened:`, incident);
        idx = 0;
      } else {
        // We have a record of this incident, lets update it
        this.incidents.splice(idx, 1, incident);
        logger.warn(
          `New incident request received for ${incident.id} but we already have it.`,
          incident
        );
      }
      if (this.dispatchIncident(incident.id, true)) {
        logger.debug(
          `Incident ${incident.id} alerted from onIncidentAdded().`
        );
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
      logger.info(`\tRemove incident requested for ${incidentId}`);
      const idx = this.getIndexOfIncident(incidentId);
      if (idx !== -1) {
        this.incidents.splice(idx, 1);
        logger.info(`\tIncident ${incidentId} removed`);
      } else {
        logger.warn(
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
      logger.info(
        `\tRemoval of incidents ${incidentIds.join(", ")} has been requested`
      );
      incidentIds.forEach((incidentId) => {
        this.onIncidentRemoved(incidentId);
      });
      logger.info("\t**********************");
    },

    /**
     * Gets called by the incident-removed event, adds or updates an incident
     * in the incidents list, then generats an alert if needed
     *
     * @param {Array} incidentIds array of nunique identifier for the incident
     *                to beremoved
     */
    onIncidentUpdated(update) {
      logger.info(
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
        logger.warn(
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
      logger.info(
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
          logger.info(
            `\tAdding ${update.unit.radioName} to ${this.incidents[idx].masterIncidentNumber}.`
          );
          if (this.dispatchIncident(update.incidentId, true)) {
            logger.debug(
              `Incident alert for ${update.incidentId} from onIncidentUnitUpdated().`
            );
          }
        } else {
          // Unit is on call, lets change its status
          this.incidents[idx].unitsAssigned.splice(udx, 1, {
            ...this.incidents[idx].unitsAssigned[udx],
            ...update.unit,
          });
        }
      } else {
        logger.warn(
          `Unable to find incident ${update.incidentId} during incident unit update.`,
          update
        );
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
      logger.info(
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
          this.incidents[idx].comments.splice(cdx, 1, {
            ...this.incidents[idx].comments[cdx],
            ...comment.comment,
          });
          logger.warn(
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
      logger.info(
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
        logger.info(`${update.radioName} not found, adding it.`);
        this.units.push({
          radioName: update.radioName,
          [update.field]: update.value,
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
