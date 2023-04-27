/**
 * A really simple clock
 * @VueDigitalTimer
 * @author joe@kt3i.com
 * @version 0.0.1
 * @license MIT
 */

export default {
  name: "VueDigitalTimer",

  props: {
    // For counter mode, determines counter start
    counterStart: {
      type: String,
      default: new Date(),
    },

    // Maximume time for okay coloring in ms
    maxOkayTime: {
      type: Number,
      default: 6e4, // 60 Seconds
    },

    // Maximume time for warn coloring in ms
    maxWarnTime: {
      type: Number,
      default: 9e4, // 90 Seconds
    },

    // Update resolution for clock in ms
    updateInterval: {
      type: Number,
      default: 1e3, // 1 second
    },

    // Determine if timer should be color coded
    colorCodeTimer: {
      type: Boolean,
      default: true,
    },
  },

  data() {
    return {
      counter: null,
      timeout: null,
      time: null,
      backgroundString: null,
    };
  },

  computed: {
    /**
     * Returns true iff timer is in time-range for okay coloring
     *
     * @returns {Boolean}
     */
    timerOkay() {
      return (this.colorCodeTimer && (this.counter <= this.maxOkayTime ));
    },

    /**
     * Returns true iff timer is in time-range for warn coloring
     *
     * @returns {Boolean}
     */
    timerWarn() {
      return (this.colorCodeTimer && (this.maxOkayTime < this.counter <= this.maxWarnTime ));
    },

    /**
     * Returns true iff timer is in time-range for alert coloring
     *
     * @returns {Boolean}
     */
    timerDanger() {
      return (this.colorCodeTimer && (this.counter > this.maxWarnTime ));
    },
  },

  /**
   * Wind the clock
   *
   */
  mounted() {
    this.counter = new Date() - new Date(this.counterStart);
    this.timerTick();
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
    timerTick() {
      const MS_PER_SEC = 1e3;
      const MS_PER_MIN = 60e3;
      const MS_PER_HOUR = 3.6e6;

      clearTimeout(this.timeout);
      this.counter = this.counter + this.updateInterval;
      if (!this.updateInterval || this.destroyed) {
        return;
      }
      const hours = Math.floor(this.counter / MS_PER_HOUR)
      const minutes = Math.floor((this.counter % MS_PER_HOUR) / MS_PER_MIN);
      const seconds = Math.floor((this.counter % MS_PER_MIN) / MS_PER_SEC);

      const hoursString = hours > 0 ? `${hours}:`.padStart(3, '0') : "";
      const minutesString = `${minutes}`.padStart(2, '0');
      const secondsString = `${seconds}`.padStart(2, '0');

      this.time = `${hoursString}${minutesString}:${secondsString}`;
      this.timeout = setTimeout(() => this.timerTick(), this.updateInterval);
    },
  },
};
