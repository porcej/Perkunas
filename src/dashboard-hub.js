import { HubConnectionBuilder, LogLevel } from "@microsoft/signalr";

/**
 *  Signalr Client Plugin for Dievas https://github.com/porcej/Dievas
 *  - Inspired:
 *    https://github.com/DaniJG/so-signalr
 *
 *  @param {Vue} instance Vue Instance
 *  @param {String} hubUrl string representation of the hub URL
 */

export default {
  install(instance, hubUrl) {
    const dashboardHub = new instance();
    instance.prototype.$dashboardHub = dashboardHub;

    // Provide methods to connect/disconnect from the SignalR hub
    let connection = null;
    let startedPromise = null;
    let manuallyClosed = false;

    /**
     *  Establishes a connection to the SignalR Hub
     */
    instance.prototype.startSignalR = () => {
      /**
       *  Object holding SignalR Connection Parameters
       */
      connection = new HubConnectionBuilder()
        .withUrl(`${hubUrl}`)
        .configureLogging(LogLevel.Information)
        .build();

      // Forward hub events through the event, so we can listen for them in the Vue components
      connection.on("ReceiveGroupMessage", (groupName, user, message) => {
        dashboardHub.$emit("group-message-received", {
          groupName,
          user,
          message,
        });
        console.log(`RGM: ${groupName} - ${message}`);
      });

      /**
       * Gets called when a IncidentFieldChanged messages are received
       *
       * @param {Number} incidentId unique identifier for the incident being
       *                 updated
       * @param {String} field Incident field that is being udpated
       * @param {String} value Incident data that is being updated
       * @event incident-updated
       * @type {object}
       */
      connection.on("IncidentFieldChanged", (incidentId, field, value) => {
        field = field.charAt(0).toLowerCase() + field.slice(1);
        console.log(
          `++Incident #${incidentId} field change RXed:\n\tField:`,
          field,
          "\n\tValue:",
          value
        );
        dashboardHub.$emit("incident-updated", {
          incidentId: incidentId,
          field: field,
          value: value,
        });
      });

      /**
       * Gets called when a IncidentUnitStatusChanged messages are received
       *
       * @param {Number} incidentId unique identifier for the incident
       * @param {Object} unit object populated with any changed values
       * @event incident-unit-updated, unit-updated
       * @type {object}
       */
      connection.on("IncidentUnitStatusChanged", (incidentId, unit) => {
        console.log(`++Incident Unit Change RXed: ${incidentId}`, unit);
        dashboardHub.$emit("incident-unit-updated", {
          incidentId: incidentId,
          unit: unit,
        });
        const radioName = unit.radioName;
        for (const [key, value] of Object.entries(unit)) {
          if (key !== "radioName") {
            dashboardHub.$emit("unit-updated", {
              radioName: radioName,
              field: key,
              value: value,
            });
          }
        }
      });

      /**
       * Gets called when a IncidentAdded messages are received
       *
       * @param {Object} incident new incident information
       * @event incident-added
       * @type {object}
       */
      connection.on("IncidentAdded", (incident) => {
        dashboardHub.$emit("incident-added", incident);
        console.log(`+++Incident #${incident.id} added`, incident);
      });

      /**
       * Gets called when a IncidentRemoved messages are received
       *
       * @param {Number} incidentId unique identifier for the incident
       *                 being removed
       * @event incident-removed
       * @type {object}
       */
      connection.on("IncidentRemoved", (incidentId) => {
        dashboardHub.$emit("incident-removed", {
          incidentId: incidentId,
        });
      });

      /**
       * Gets called when a IncidentsRemoved messages are received
       *
       * @param {Array} incidentIds array of unique identifier for the
       *                incidents being removed
       * @event incidents-removed
       * @type {object}
       */
      connection.on("IncidentsRemoved", (incidentIds) => {
        dashboardHub.$emit("incidents-removed", {
          incidentIds: incidentIds,
        });
      });

      /**
       * Gets called when a UnitStatusChanged messages are received
       *
       * @param {String} radioName unique identifier for a unit
       * @param {statusId} id number corrosponding to the unit's new status
       * @event unit-updated
       * @type {object}
       */
      connection.on("UnitStatusChanged", (radioName, statusId) => {
        console.log(`++Unit Change RXed: ${radioName}`, statusId);
        dashboardHub.$emit("unit-updated", {
          radioName: radioName,
          field: "statusId",
          value: statusId,
        });
      });

      /**
       * Gets called when a UnitFieldChanged messages are received
       *
       * @param {String} radioName unique identifier for a unit
       * @param {String} field field name that contains new value
       * @param {String} value updated value
       * @event unit-updated
       * @type {object}
       */
      connection.on("UnitFieldChanged", (radioName, field, value) => {
        field = field.charAt(0).toLowerCase() + field.slice(1);
        console.log(
          `++Unit Field Change Rxed: ${radioName}: ${field} => ${value}`
        );
        dashboardHub.$emit("unit-updated", {
          radioName: radioName,
          field: field,
          value: value,
        });
      });

      /**
       * Gets called when a IncidentCommentAdded messages are received
       *
       * @param {Number} incidentId unique identifier for the associated
       *                 incident
       * @param {Object} comment comment to be added
       * @event incident-comment-added
       * @type {object}
       */
      connection.on("IncidentCommentAdded", (incidentId, comment) => {
        console.log(
          `++Comment added to incident ID ${incidentId} RXed`,
          comment
        );
        dashboardHub.$emit("incident-comment-added", {
          incidentId: incidentId,
          comment: comment,
        });
      });

      /**
       * Gets called to kickoff a connection to a SignlR Hub, returns a promise
       * if the connection fails
       *
       * @returns {Promise} Promise object representing a connection to a
       *                    SignalR Hub
       */
      function $_start() {
        startedPromise = connection.start().catch((err) => {
          console.error("Failed to connect with hub", err);
          return new Promise((resolve, reject) =>
            setTimeout(() => $_start().then(resolve).catch(reject), 5000)
          );
        });
        return startedPromise;
      }

      /**
       * Gets called when SignlR hub connection closes - trys to reestablish
       * connection if the connection was not closed by calling stopSignalR
       *
       * @param {Object} err Object holding error information on the
       *                 connection closed event
       * @event disconnected
       * @type {boolean}
       */
      connection.onclose((err) => {
        if (err) {
          console.log("Disconnected from hub on error ", err);
        } else {
          console.log("Disconnected from hub.", err);
        }
        dashboardHub.$emit("disconnected");
        if (!manuallyClosed) $_start();
      });

      /**
       * Gets things going by starting the starting the connection
       */
      manuallyClosed = false;
      $_start();
    };

    /**
     * Called to stop the SignalR connectionm nulls out the startedPromise
     * and sets manuallyClosed to false
     *
     * @param {Object} err Object holding error information on the
     *                 connection closed event
     * @event disconnected
     * @returns {(null|Promise)} Null if SignalR connection is closed
     *                           Otherwise returns a Promise object
     *                           representing a stopped connection
     * @public
     */
    dashboardHub.stopSignalR = () => {
      if (!startedPromise) return;

      manuallyClosed = true;
      return startedPromise
        .then(() => connection.stop())
        .then(() => {
          startedPromise = null;
        });
    };

    /**
     * Gets called to to check on the SignlR connection state
     * returns a SignlR Connection State Object
     *
     * @returns {Object} SignalR connection state object
     * @public
     */
    dashboardHub.state = () => {
      return connection.state;
    };

    // Provide methods for components to send messages back to server
    // Make sure no invocation happens until the connection is established
    dashboardHub.incidentOpened = (incidentId) => {
      if (!startedPromise) return;

      return startedPromise
        .then(() => connection.invoke("JoinIncidentGroup", incidentId))
        .catch(console.error);
    };

    dashboardHub.incidentClosed = (incidentId) => {
      if (!startedPromise) return;

      return startedPromise
        .then(() => connection.invoke("LeaveIncidentGroup", incidentId))
        .catch(console.error);
    };

    /**
     * Gets called to join the Dashboard group by invoking the JoinDashboard
     * method on the Dievas server
     *
     * @returns {(null|Promise)} Null if SignalR connection is closed
     *                           Otherwise returns a Promise object
     *                           representing a joining the dashboard group
     */
    dashboardHub.JoinDashboard = () => {
      if (!startedPromise) return;

      return startedPromise
        .then(() => connection.invoke("JoinDashboard"))
        .catch(console.error);
    };

    /**
     * Gets called to join a generic group by calling the subscribe method
     * the subscribe method on the Dievas server
     *
     * @params {String} group group name to join on the SignlR hub
     * @returns {(null|Promise)} Null if SignalR connection is closed
     *                           Otherwise returns a Promise object
     *                           representing a joining group
     */
    dashboardHub.subscribe = (group) => {
      if (!startedPromise) return;

      return startedPromise
        .then(() => connection.invoke("Subscribe", group))
        .catch(console.error);
    };
  },
};
