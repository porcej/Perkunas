/**
 * A really simple clock
 * @VueDigitalClock
 */

import dayjs from "dayjs";
import logger from "@/utils/logger";

export default {
  name: "VueDigitalClock",

  props: {
    //  Determines if this is a counter or clock
    counter: {
      type: Boolean,
      default: false,
    },

    countDown: {
      type: Boolean,
      default: false,
    },

    // For counter mode, determines counter start
    counterStart: {
      type: Number,
      default: 0,
    },

    // Clock format
    timeFormat: {
      type: String,
      default: "HH:mm:ss",
    },

    // Clock format
    dateFormat: {
      type: String,
      default: "dddd, MMMM D YYYY",
    },

    // Update resolution for clock in ms
    updateInterval: {
      type: Number,
      default: 1000,
    },

    // Determined weather the background should be shown
    showBackground: {
      type: Boolean,
      default: true,
    },
  },

  data() {
    return {
      timeout: null,
      time: null,
      date: null,
      backgroundString: null,
    };
  },

  /**
   * Wind the clock
   *
   */
  mounted() {
    this.backgroundString = this.timeFormat.replace(/[a-z)-9]/gim, "8");
    logger.debug("Background string generated:", this.backgroundString);
    this.clockTick();
  },

  /**
   * Clean up when this component is removed
   *
   */
  destroyed() {
    clearTimeout(this.timeout);
  },

  methods: {
    /**
     * Progresses timer by one interval and checks for events
     *
     */
    clockTick() {
      clearTimeout(this.timeout);
      const time = Number(this.updateInterval);
      if (!time || time < 10 || this.destroyed) {
        return;
      }
      if (this.timeFormat && this.timeFormat !== "") {
        this.time = dayjs().format(this.timeFormat);
      }
      if (this.dateFormat && this.dateFormat !== "") {
        this.date = dayjs().format(this.dateFormat);
      }
      this.timeout = setTimeout(() => this.clockTick(), time);
    },
  },
};
