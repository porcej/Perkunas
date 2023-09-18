import Utils from "./utils";
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
    /**
     * Converts Centigrade to Fahrenheit
     *
     * @params {Number} Centigrate Temperature
     * @returns {Number} Temperature in Fahrenheit
     */
    convertC2F(c) {
      return (9*c + 160) / 5;
    },

    /**
     * Filters a list of objects returning those objects with the property
     * isWorking true
     *
     * @params {Array} positions list of position objects
     * @returns {Array} array of filtered incidents
     */
    workingPositions(positions) {
      positions.filter((position) => position.isWorking);
      return true;
    },

    /**
     * Returns an icon representing the position provided
     *
     * @params {Object} position representation of a Telestaff postion
     * @returns {String} string representation of the provided position
     */
    formatRank(position) {
      return Utils.getRank(position).icon;
    },

    /**
     * Cleans up a person's name
     *
     * @params {String} name repenting a person's name
     * @returns {String} a cleaned up string representing a person's name
     */
    formatName(name) {
      return name.replace(/\(.*$/g, "").trim();
    },

    /**
     * Formats time for displaying staffing information
     *
     * @params {String} startTime string representation of the start of a
     *                  staffing period
     * @params {String} endTime string representation of the end of a
     *                  staffing period
     * @returns {Object} Representing a staffing period display
     */
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

    /**
     * Loads staffing information and sets timeouts to rerun
     *
     * @params {String} startTime string representation of the start of a
     *                  staffing period
     * @params {String} endTime string representation of the end of a
     *                  staffing period
     * @returns {Object} Representing a staffing period display
     */
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
        station: this.station,
        date: date,
      }).then((data) => {
        this.$set(this, "roster", data);
      });
    },
  },
};
