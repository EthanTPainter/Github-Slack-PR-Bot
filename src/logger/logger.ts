import {
  createLogger,
  format,
  Logger,
  transports,
} from "winston";

const {
combine,
colorize,
timestamp,
splat,
simple,
label,
printf,
} = format;

/**
 * Calculate the spacing for the log level in the custom formatted log message.
 * This functions helps align the log messages for easier manual parsing.
 * NOTE: This function only handles the following log levels:
 * ["debug", "info", "warn", "error"]
 *
 * @param  {string} level - The log level. This value is actually encoded, hence
 * the odd solution in this function (ex. "\u001b[32minfo\u001b[39m").
 * @return {string} - The correct spacing to format the log message.
 */
function getSpacingForLevel(level: string): string {
  if (["info", "warn"].some(s => level.includes(s))) {
    return "  ";
  }

  return " ";
}

/**
 * Generate a winston Logger with the specified label.
 *
 * @param  {string} labelInput - The label to inject into the log message.
 * @return {Logger} - The winston Logger.
 */
export function newLogger(labelInput: string): Logger {

  const customFormat = printf(info => {
    return `[${info.timestamp}] ${info.level}${getSpacingForLevel(info.level)}- ${info.label}: ${info.message}`;
  });

  const opts: any = {
      format: combine(
          colorize(),
          timestamp(),
          splat(),
          simple(),
          label({ label: labelInput }),
          customFormat,
      ),
      level: process.env.LOG_LEVEL || "info",
      stderrLevels: ["error"],
  };

  return createLogger({
      transports: [ new transports.Console(opts) ],
  });
}
