import SwaggerUI from "swagger-ui";

const swaggerSpec = {
    url: 'http://localhost:8000/openapi.json'
}

const swaggerUI = SwaggerUI(swaggerSpec);

export default swaggerUI;