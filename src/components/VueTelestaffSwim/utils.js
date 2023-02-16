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

  fetchRoster(opts = {}) {
    utils.station = opts.station;
    return fetch(`${opts.url}${opts.date}`)
      .then((resp) => resp.json())
      .then(utils.mapRoster);
  },

  mapRoster(data) {
    console.log(data);
    const {
      data: {
        Date: [
          {
            title: dataDate,
            Institution: [
              {
                Agency: [
                  {
                    Batallion: [{ Shift: shifts }],
                  },
                ],
              },
            ],
          },
        ],
      },
    } = data;

    const shiftDate = dayjs(dataDate, "dddd, MMMM D YYYY");

    const thisShift = utils.getShift(shiftDate);

    const shift = shifts.filter(
      (shift) => shift.title === `Ops ${thisShift.toUpperCase()} Shift`
    )[0];

    const stationRoster = shift["Station"].filter(
      (station) => station.title === utils.station
    )[0];

    let units = stationRoster["Unit"].filter(
      (unit) => unit.title !== "{off roster}"
    );

    units.forEach((unit) => {
      // let lastId = -1;

      const people = unit["Position"].filter((position) => position.isWorking);
      let positions = {};
      people.forEach((person) => {
        if (!(person["id"] in positions)) {
          positions[person.id] = {
            title: person.title,
            people: [],
          };
        }
        positions[person["id"]]["people"].push(person);
      });
      console.log("Position: ", positions);
      unit["Position"] = positions;
    });
    console.log(units);

    // console.log(unit['Position']);
    // const persons = unit["Position"].filter((position) => position.isWorking);
    // let positions = []
    // for (let position in persons){
    //   if (position.id == lastId) {
    //     positions.at(-1).push(position);
    //   } else {
    //     positions.push([position]);
    //   }
    // }
    // unit["Position"] = positions;
    // }

    return {
      day: utils.getTodayOrDayName(shiftDate),
      date: shiftDate,
      shift: shift.title.split(" ")[1].toLowerCase(),
      station: stationRoster.title,
      units: units,
      activities: stationRoster["Unit"].reduce((activites, unit) => {
        if (unit.notes !== "") {
          activites.push(
            {
              unit: unit.title,
              activity: unit.notes,
            },
            []
          );
        }
        return activites;
      }, []),
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
