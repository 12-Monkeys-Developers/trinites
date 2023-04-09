import { LOG_HEAD } from "./constants.js";

export class Log {
  static log(message) {
    console.log(LOG_HEAD, message);
  }
  static info(message) {
    console.info(LOG_HEAD, message);
  }
  static debug(message) {
    console.debug(LOG_HEAD, message);
  }
  static warn(message) {
    console.warn(LOG_HEAD, message);
  }
  static error(message) {
    console.error(LOG_HEAD, message);
  }
}
