/**
 * Utility functions for VueTelestaff.
 * @module VueTelestaff/utils
 * @author joe@kt3i.com
 * @version 0.0.1
 * @license MIT
 */

/**
 * Utilities to handle fetching data
 *
 */
const utils = {
  /**
   * Retrieves messages from the server
   *
   */
  fetchMessages(opts = {}) {
    return fetch(`${opts.url}`).then((resp) => resp.json());
  },
};

export default utils;
