const AWSXRay = require("aws-xray-sdk");
AWSXRay.captureHTTPsGlobal(require("http"));

import { XRayOptions } from "../models";
import { newLogger } from "../logger";

const logger = newLogger("XRayInitializer");

export class XRayInitializer {

  public static init(options: XRayOptions): void {
    if (options.disable){
      logger.warn("X-Ray disabled");
      return;
    }

    if (options.logger) {
      AWSXRay.setLogger(options.logger);
    }

    AWSXRay.captureFunc(options.context, (subsegment: any) => {
      subsegment.addAnnotation("context", options.context);
      subsegment.addAnnotation("service", options.service);
    });
  }
}
