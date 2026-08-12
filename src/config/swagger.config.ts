import path from "node:path";
import SwaggerParser from "@apidevtools/swagger-parser";

const openApiPath = path.join(process.cwd(), "src/docs/openapi.yaml");

const swaggerSpec = await SwaggerParser.bundle(openApiPath);

export default swaggerSpec;
