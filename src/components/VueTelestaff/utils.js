import dayjs from "dayjs";

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

const utils = {
  station: null,
  homeUnits: [],

  fetchRoster(opts = {}) {
    utils.station = opts.station;
    utils.homeUnits = opts.homeUnits;
    return fetch(`${opts.url}${opts.date}`)
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
      .then(utils.mapRoster)
      .catch((err) => console.warn(err));
  },

  mapRoster(data) {
    console.debug("Staffing data rxed:", data);

    const shiftDate = dayjs(data.RosterDate);

    const stationRoster = data.records.filter(
      (record) =>
        (record.stationName === utils.station ||
          utils.homeUnits.indexOf(record.unitName) >= 0) &&
        record.unitName !== "{off roster}" &&
        record.isWorking
    );

    const stationUnitNames = stationRoster.reduce((units, record) => {
      if (!units.includes(record.unitName)) {
        units.push(record.unitName);
      }
      return units;
    }, []);

    console.info(`Staffing records found for ${stationUnitNames.join(" ")}.`);

    const stationUnits = stationRoster.reduce((units, record) => {
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
      day: utils.getTodayOrDayName(shiftDate),
      date: shiftDate,
      shift: utils.getShift(shiftDate),
      station: utils.station,
      units: stationUnits,
    };
  },

  getDeltaDay(delta = 1) {
    const tomorrow = dayjs().add(delta, "days");
    return tomorrow.format("YYYYMMDD");
  },

  getTodayOrDayName(date) {
    if (date.isSame(dayjs(), "day")) {
      return "Today";
    }
    return date.format("dddd");
  },

  getRank(str) {
    str = str.toLowerCase() || "";

    // Prepare str by removing '.', '+', and leading + trailing white
    //      space, and making everything lower case
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

  parseShiftTimes(str) {
    const date = dayjs(str);
    return date.format("HH:mm");
  },

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
