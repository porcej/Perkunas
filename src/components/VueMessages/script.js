import Utils from "./utils";

export default {
  name: "VueMessages",

  props: {
    url: {
      type: String,
    },

    // Auto update interval in milliseconds, default is 15 minutes
    updateInterval: {
      type: Number,
      default: 30 * 1000,
    },
  },

  data() {
    return {
      loading: true,
      messages: null,
      error: null,
    };
  },

  mounted() {
    this.showMessage();
  },

  destroyed() {
    clearTimeout(this.timeout);
  },

  methods: {
    /**
     * Loads staffing information and sets timeouts to rerun
     *
     * @params {String} startTime string representation of the start of a
     *                  staffing period
     * @params {String} endTime string representation of the end of a
     *                  staffing period
     * @returns {Object} Representing a staffing period display
     */
    showMessage(setLoading = true) {
      this.$set(this, "loading", setLoading);
      return this.$nextTick()
        .then(this.fetchMessages)
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
      this.timeout = setTimeout(() => this.showMessage(false), time);
    },

    fetchMessages() {
      return Utils.fetchMessages({
        url: this.url
      }).then((data) => {
        this.$set(this, "messages", data);
      });
    }
  },
};
