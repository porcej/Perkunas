/**
 * Utility functions for VueIncidentAlerts.
 * @module VueIncidentAlerts/utils
 * @author joe@kt3i.com
 * @version 0.0.1
 * @license MIT
 */

/**
 * Unit status code to description mapping
 *
 */
const UNIT_STATUS_MAPPING = [
  {
    code: "OFF",
    description: "Off Duty",
  },
  {
    code: "AV",
    description: "Available",
  },
  {
    code: "IQ",
    description: "In Quarters",
  },
  {
    code: "RES",
    description: "Reserved",
  },
  {
    code: "--",
    description: "--",
  },
  {
    code: "BUSY",
    description: "BUSY",
  },
  {
    code: "D",
    description: "Dispatched",
  },
  {
    code: "ER",
    description: "En Route",
  },
  {
    code: "ED",
    description: "ER to Detail",
  },
  {
    code: "ST",
    description: "Staged",
  },
  {
    code: "OS",
    description: "On Scene",
  },
  {
    code: "AI",
    description: "At Incident",
  },
  {
    code: "TO",
    description: "To Destination",
  },
  {
    code: "AT",
    description: "At Destination",
  },
  {
    code: "01",
    description: "--",
  },
  {
    code: "AE",
    description: "UNUSED STATUS",
  },
  {
    code: "SS",
    description: "Start Shift",
  },
  {
    code: "OD",
    description: "OS Detail",
  },
  {
    code: "MA",
    description: "Multi-Assign",
  },
  {
    code: "D2",
    description: "D 2nd Loc",
  },
  {
    code: "E2",
    description: "ER 2nd Loc",
  },
  {
    code: "O2",
    description: "OS 2nd Loc",
  },
  {
    code: "clear",
    description: "Clear from an assigned incident",
  },
];

/**
 * Call Type to Icon Map
 *
 */
const CALLTYPE_ICON_MAP = {
  medical: "medical.png",
  fire: "fire.png",
  other: "other.png",
};

const utils = {
  /**
   * Maps an icon from a call type
   *
   * @params {String} callType - nature of the call
   * @returns {String} path to call type's icon
   */
  getIncidentIcon(callType) {
    return `./icons/${CALLTYPE_ICON_MAP[callType] ?? "fire.png"}`;
  },
  fetchIncidents(opts = {}) {
    return fetch(`${opts.url}`).then((resp) => resp.json());
  },

  fetchIncident(opts = {}) {
    // return fetch(`${opts.url}/${opts.id}/full?$eventid=${eventid}`)
    return fetch(`${opts.url}/${opts.id}/full`).then((resp) => resp.json());
  },

  getUnitIncidentStatus(id) {
    id = id === 1 ? 22 : id;
    return utils.getUnitStatus(id);
  },

  getUnitStatus(id) {
    return UNIT_STATUS_MAPPING[id].code.toLowerCase();
  },

  parseShiftTimes(str) {
    // 05/30/2017 07:00 AM
    str = str || "";
    str = str.slice(10);
    var parts = str.trim().split(" ");
    if (parts[1] == "PM") {
      var p = parts[0].split(":");
      if (p[0] != 12) {
        parts[0] = (parseInt(p[0]) + 12).toString() + ":" + p[1];
      }
    }
    return parts[0];
  },
};

export default utils;
