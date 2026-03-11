import { UAParser } from "ua-parser-js";
import { IDeviceInfo } from "../interfaces";

export function parseUserAgent(userAgent: string): IDeviceInfo {
  const parser = new UAParser(userAgent);
  const result = parser.getResult();

  return {
    device: result.device.model || "Unknown",
    os: result.os.name || "Unknown",
    browser: result.browser.name || "Unknown",
    browserVersion: result.browser.version || "Unknown",
    type: result.device.type || "desktop",
  };
}
