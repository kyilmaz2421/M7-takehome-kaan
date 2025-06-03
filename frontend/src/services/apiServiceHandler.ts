import axios, { AxiosInstance } from "axios";
import { ShiftPreference, Nurse } from "../model/nurse";
import { ShiftRequirement } from "../model/shift";
import { Schedule } from "../model/schedule";

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// Higher-order function to wrap API calls with error handling
function withErrorHandling<T>(apiCall: () => Promise<T>): Promise<T> {
  return apiCall().catch((error: unknown) => {
    if (axios.isAxiosError(error)) {
      throw new ApiError(
        error.response?.status || 500,
        error.response?.data?.message || "An unknown error occurred",
      );
    }
    throw new ApiError(500, "An unknown error occurred");
  });
}

export class ApiServiceHandler {
  private instance: AxiosInstance;
  constructor(instance: AxiosInstance) {
    this.instance = instance;
  }

  // Nurse endpoints
  public async getNurses(): Promise<Nurse[]> {
    return withErrorHandling(async () => {
      const { data } = await this.instance.get("/nurses");
      return data;
    });
  }

  public async getNursePreferences(id: number): Promise<ShiftPreference[]> {
    return withErrorHandling(async () => {
      const { data } = await this.instance.get(`/nurses/${id}/preferences`);
      return data;
    });
  }

  public async setNursePreferences(
    id: number,
    preferences: ShiftPreference[],
  ): Promise<Nurse> {
    return withErrorHandling(async () => {
      const { data } = await this.instance.post(`/nurses/${id}/preferences`, {
        preferences,
      });
      return data;
    });
  }

  // Shift endpoints
  public async getShiftRequirements(): Promise<ShiftRequirement[]> {
    return withErrorHandling(async () => {
      const { data } = await this.instance.get(`/shifts/requirements`);
      return data;
    });
  }

  // Schedule endpoints
  public async generateSchedule(
    requirements: ShiftRequirement[],
    nurseToPreferences: { nurseId: number; preferences: ShiftPreference[] }[],
  ): Promise<Schedule> {
    return withErrorHandling(async () => {
      const { data } = await this.instance.post(`/schedules/generate`, {
        requirements,
        nurseToPreferences,
      });
      return data;
    });
  }

  public async getMostRecentSchedules(): Promise<Schedule[]> {
    return withErrorHandling(async () => {
      const { data } = await this.instance.get("/schedules/latest");
      return data;
    });
  }
}
