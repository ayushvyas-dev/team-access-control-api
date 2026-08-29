import { pinoHttp } from "pino-http";
import logger from "../config/logger.config.js";

const loggerMiddleware = pinoHttp({
  logger,

  customLogLevel: (_req, res) => {
    if (res.statusCode >= 500) return "error";
    if (res.statusCode >= 400) return "warn";
    return "info";
  },

  serializers: {
    req(req) {
      return {
        id: req.id,
        method: req.method,
        url: req.url,
        remoteAddress: req.remoteAddress,
      };
    },

    res(res) {
      return {
        statusCode: res.statusCode,
      };
    },
  },
});

export default loggerMiddleware;
