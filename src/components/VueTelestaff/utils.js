/**
 * Utility functions for VueTelestaff.
 * @module VueTelestaff/utils
 * @author jo2@kt3i.com
 * @version 0.0.1
 * @license MIT
 */
import dayjs from "dayjs";

/**
 * Mappings for finding ranks from strings
 *
 */
const RANK_MAPPINGS = [
  {
    rank: "medic",
    titles: ["medic", "attendant a"],
    icon: "user-md",
  },
  {
    rank: "officer",
    titles: [
      "captain",
      "lieutenant",
      "officer",
      "battalion aide",
      "battalion chief",
    ],
    icon: "star",
  },
  {
    rank: "driver",
    titles: ["dot", "doe"],
    icon: "car",
  },
  {
    // We use "" in titles to make it the default, this will *always* match
    rank: "firefighter",
    titles: ["firefighter", "attendant b", ""],
    icon: "fire",
  },
];

/**
 * Utilities to handle fetching data
 *
 */
const utils = {
  /**
   * Retrieves a list of units assigned to this station
   *
   */
  fetchUnits() {
    return fetch(
      `${utils.unitsUrl}?` +
        new URLSearchParams({
          homeStation: utils.station,
        })
    ).then((resp) => resp.json());
  },

  // fetchRoster(opts = {}) {
  //   return
  //     fetch(`${opts.url}${opts.date}?` +
  //       new URLSearchParams({
  //         station: opts.station,
  //       })
  //       .then((resp) => resp.json())
  //       .then((data) => {
  //         console.debug("Raw staffing data rxed:", data);
  //         if (data.status_code !== 200) {
  //           throw new Error(
  //             `Error received from Staffing server. Error code ${data.status_code}`
  //           );
  //         }
  //         return data.data;
  //       })
  //     .then(([rosterData, homeUnits]) =>
  //       utils.filterRoster(rosterData, homeUnits, opts.station)
  //     )
  //     .catch((err) => console.warn(err));
  // },

  fetchRoster(opts = {}) {
    return fetch(`${opts.url}${opts.date}?station=${opts.station}`)
      .then((resp) => resp.json())
      .then((data) => {
        console.debug("Raw staffing data rxed:", data);
        if (data.status_code !== 200) {
          throw new Error(
            `Error received from Staffing server. Error code ${data.status_code}`
          );
        }
        return data.data;
      })
      .then((roster) => utils.mapRoster(roster, opts.station))
      .catch((err) => console.warn(err));
  },

  /**
   * Returns a list of unit names from a list of unitDto objects
   *
   * @params {Array} List of unit objects
   * @returns {Array} List of unit names
   *
   */
  filterUnits(data) {
    return data.reduce((udx, unit) => {
      udx.push(unit.radioName);
      return udx;
    }, []);
  },

  /**
   * Returns a staffing roster for VueTelestaff
   *
   * @params {Object} roster raw staffing data
   * @params {Array}  homeUnits list of units homed at this station
   * @returns {Object} Staffing data based on the supplied roster for the
   *                   supplied station and homeunits
   */
  mapRoster(roster, station) {
    const rosterDate = dayjs(roster.rosterDate);
    const stationUnits = roster.records.reduce((units, record) => {
      let idx = units.findIndex((r) => r.title === record.unitName);
      if (idx === -1) {
        idx =
          units.push({
            title: record.unitName,
            notes: record.unitNotes,
            Position: [],
          }) - 1;
      }
      units[idx].Position.push(record);
      return units;
    }, []);
    console.debug("Station units: ", stationUnits);

    return {
      day: utils.getTodayOrDayName(rosterDate),
      date: rosterDate,
      shift: utils.getShift(rosterDate),
      station: station,
      units: stationUnits,
    };
  },

  /**
   * Returns a Date string representing a date delta days from now
   *
   * @params {Number} delta difference between current date and new date
   * @returns {String} represents a date in the format YYYYMMDD
   */
  getDeltaDay(delta = 1) {
    const date = dayjs().add(delta, "days");
    return date.format("YYYYMMDD");
  },

  /**
   * Returns a Date string or "Today" if the date is today
   *
   * @params {Object} date DayJS instance of the date in question.
   * @returns {String} containing today iff date is today, otherwise
   *                   returns a date string representing date.
   */
  getTodayOrDayName(date) {
    if (date.isSame(dayjs(), "day")) {
      return "Today";
    }
    return date.format("dddd");
  },

  /**
   * Attempts to find a rank from the given string
   *
   * @params {String} str containing a rank.
   * @returns {String} the rank represented in str.
   */
  getRank(str) {
    str = str.toLowerCase() || "";
    str = str.replace(/[.+]/g, "").trim();

    const retVal = RANK_MAPPINGS.find((rank) => {
      for (let tdx in rank.titles) {
        if (str.includes(rank.titles[tdx])) {
          return true;
        }
      }
      return false;
    });
    return retVal;
  },

  /**
   * Returns a time str in Staffing format
   *
   * @params {String} str representing time
   * @returns {String} str reformated to "HH:mm"
   */
  parseShiftTimes(str) {
    const date = dayjs(str);
    return date.format("HH:mm");
  },

  /**
   * Returns the chift identifier for the provided date
   *
   * @params {Object} DayJS representation of a date
   * @returns {Char} representing date
   */
  getShift(date) {
    date = date || dayjs();
    const shiftMap = {
      // 2017/00/03 - 2017/00/05 - 2017/00/07
      a: [dayjs([2017, 1, 3]), dayjs([2017, 1, 5]), dayjs([2017, 1, 7])],
      // 2017/00/06 - 2017/00/08 - 2017/00/10
      b: [dayjs([2017, 1, 6]), dayjs([2017, 1, 8]), dayjs([2017, 1, 10])],
      // 2017/00/09 - 2017/00/11 - 2017/00/13
      c: [dayjs([2017, 1, 9]), dayjs([2017, 1, 11]), dayjs([2017, 1, 13])],
    };

    for (const shiftKey in shiftMap) {
      for (const shiftStart of shiftMap[shiftKey]) {
        const deltaDate = date.diff(shiftStart, "days");
        if (deltaDate % 9 === 0) {
          return shiftKey;
        }
      }
    }
  },
};

export default utils;
