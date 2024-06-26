var crypto = require('crypto');
var logger = require('../../logger');

/**
 * Class describing an AWS X-Ray trace ID.
 * @see https://docs.aws.amazon.com/xray/latest/devguide/xray-concepts.html#xray-concepts-traces
 */
class TraceID {
  /**
   * Constructs a new trace ID using the current time.
   * @param {string} [tsHex] - time stamp to use for trace ID in hexadecimal format
   * @param {string} [numberhex] - string of hexadecimal characters for random portion of Trace ID
   * @constructor
   */
  constructor(tsHex, numberhex) {
    this.version = 1;
    this.timestamp = tsHex || Math.round(new Date().getTime() / 1000).toString(16);
    this.id = numberhex || crypto.randomBytes(12).toString('hex');
  }

  /**
   * @returns {TraceID} - a hardcoded trace ID using zeroed timestamp and random ID
   */
  static Invalid() {
    return new TraceID('00000000', '000000000000000000000000');
  }

  /**
   * Constructs a new trace ID from provided string. If no string is provided or the provided string is invalid,
   * log an error but a new trace ID still returned. This can be used as a trace ID string validator.
   * @param {string} [rawID] - string to create a Trace ID object from.
   */
  static FromString(rawID) {
    const DELIMITER = '-';
    var traceID = new TraceID();
    var version, timestamp;

    if (!rawID || typeof rawID !== 'string') {
      logger.getLogger().error('Empty or non-string trace ID provided');
      return traceID;
    }

    const parts = rawID.trim().split(DELIMITER);
    if (parts.length !== 3) {
      logger.getLogger().error('Unrecognized trace ID format');
      return traceID;
    }

    version = parseInt(parts[0]);
    if (isNaN(version) || version < 1) {
      logger.getLogger().error('Trace ID version must be positive integer');
      return traceID;
    }

    timestamp = parseInt(parts[1], 16).toString(16);
    if (timestamp === 'NaN') {
      logger.getLogger().error('Trace ID timestamp must be a hex-encoded value');
      return traceID;
    } else {
      timestamp = timestamp.padStart(8, '0');
    }

    traceID.version = version;
    traceID.timestamp = timestamp;
    traceID.id = parts[2];

    return traceID;
  }

  /**
   * Returns a string representation of the trace ID.
   * @returns {string} - stringified trace ID, e.g. 1-57fbe041-2c7ad569f5d6ff149137be86
   */
  toString() {
    return `${this.version.toString()}-${this.timestamp}-${this.id}`;
  }
}

module.exports = TraceID;
