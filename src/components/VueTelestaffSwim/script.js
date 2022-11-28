import Utils from "./utils";
import { DateTime } from "luxon";
import { library } from "@fortawesome/fontawesome-svg-core";
import {
  faStar,
  faCar,
  faFire,
  faUserMd,
  faSpinner,
  faExclamationTriangle,
  faSun,
  faMoon,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";

library.add(
  faStar,
  faCar,
  faFire,
  faUserMd,
  faSpinner,
  faExclamationTriangle,
  faSun,
  faMoon
);

export default {
  name: "VueTelestaff",

  components: {
    FontAwesomeIcon,
  },

  props: {
    url: {
      type: String,
      default: "https://localhost:5001/api/TelestaffProxy/",
      // console.log(`${location.protocol}//${location.host}/`);
    },

    station: {
      type: String,
      required: true,
    },

    // Auto update interval in milliseconds, default is 15 minutes
    updateInterval: {
      type: Number,
      default: 15 * 60 * 1000,
    },

    // Hours to display
    displayHours: {
      type: Number,
      default: 24,
    },

    // Roster Date
    date: {
      type: String,
      default: "",
    },
  },

  data() {
    return {
      loading: true,
      roster: null,
      error: null,
    };
  },

  mounted() {
    this.staff();
  },

  destroyed() {
    clearTimeout(this.timeout);
  },

  methods: {
    workingPositions(positions) {
      return positions.filter((position) => position.isWorking);
    },

    formatRank(position) {
      return Utils.getRank(position).icon;
    },

    formatName(name) {
      // return [name.replace(/\(.*$/g, "").trim(), name.replace(/^[^(]*|\(|\)/g, "").trim()];
      return name.replace(/\(.*$/g, "").trim();
    },

    widthStartByTime(person) {
      const periodStartTime = DateTime.local().set({
        hour: 7,
        minute: 0,
        second: 0,
        milliseconds: 0,
      });
      const periodEndTime = periodStartTime.plus({ hours: this.displayHours });
      const periodLength =
        periodEndTime.diff(periodStartTime).values.milliseconds;
      const personStartTime = DateTime.fromFormat(
        person.startTime,
        "MM/dd/yyyy hh:mm a"
      );
      const personEndTime = DateTime.fromFormat(
        person.endTime,
        "MM/dd/yyyy hh:mm a"
      );
      const workingLength =
        personEndTime.diff(personStartTime).values.milliseconds;
      const deltaStart =
        personStartTime.diff(periodStartTime).values.milliseconds;
      const width = (workingLength / periodLength) * 100;
      const startPosition = (deltaStart / periodLength) * 100;
      return `width:${width}%; left:${startPosition}%;`;
    },

    formatTime(startTime, endTime) {
      const timeText = `${Utils.parseShiftTimes(
        startTime
      )} - ${Utils.parseShiftTimes(endTime)}`;
      if (timeText == "07:00 - 07:00") {
        return {
          isIcon: false,
          icon: null,
          text: "",
        };
      } else if (timeText == "07:00 - 19:00") {
        return {
          isIcon: true,
          icon: faSun,
          text: timeText,
        };
      } else if (timeText == "19:00 - 07:00") {
        return {
          isIcon: true,
          icon: faMoon,
          text: timeText,
        };
      }
      return {
        isIcon: false,
        icon: null,
        text: timeText,
      };
    },

    staff(setLoading = true) {
      this.$set(this, "loading", setLoading);
      return this.$nextTick()
        .then(this.loadRoster)
        .then(() => {
          this.$set(this, "error", null);
        })
        .catch((err) => {
          this.$set(this, "error", "" + err + err.stack);
        })
        .finally(() => {
          this.$set(this, "loading", false);
          this.autoupdate();
        });
    },

    autoupdate() {
      clearTimeout(this.timeout);
      const time = Number(this.updateInterval);
      if (!time || time < 10 || this.destroyed) {
        return;
      }
      this.timeout = setTimeout(() => this.staff(false), time);
    },

    loadRoster() {
      const date =
        this.date == "tomorrow"
          ? Utils.getDeltaDay()
          : this.date == "yesterday"
          ? Utils.getDeltaDay(-1)
          : this.date;
      return Utils.fetchRoster({
        url: this.url,
        station: "Station " + this.station,
        date: date,
      }).then((data) => {
        this.$set(this, "roster", data);
      });
    },
  },
};
