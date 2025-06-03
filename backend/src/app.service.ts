import { Injectable } from "@nestjs/common";

export type HealthCheckResponse = {
  status: "healthy" | "unhealthy";
};

@Injectable()
export class AppService {
  constructor() {}

  getHello(): string {
    return "Hello World!";
  }

  getHealth(): HealthCheckResponse {
    return {
      status: "healthy",
    };
  }
}
