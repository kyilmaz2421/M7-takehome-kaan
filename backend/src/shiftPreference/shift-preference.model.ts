import { Preference, ShiftType, DayOfWeek } from "./shift-preference.types";

export class PreferenceValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PreferenceValidationError";
  }
}

export class PreferenceParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PreferenceParseError";
  }
}

/**
 * Handles validation and storage of nurse shift preferences.
 *
 * While this level of validation might seem excessive for a simple application especially one that has some type safety via TypeScript
 * and a simple database contract, it's crucial when storing JSON in a database:
 *
 * 1. TypeScript types are removed at runtime, so we can't rely on them for validation
 * 2. JSON columns in databases accept any valid JSON, which could break our application
 * 3. Data could be modified outside our application (e.g., direct DB updates)
 * 4. Invalid JSON data could cause runtime errors that are hard to debug
 *
 * This class ensures that:
 * - The JSON structure always matches our expected format
 * - All required fields are present
 * - All values are within their expected ranges
 * - We never save invalid or empty preferences
 *
 * @example
 * ```typescript
 * const preferences = new ShiftPreferences([
 *   { shift: 'day', dayOfWeek: 'monday' }
 * ]);
 * ```
 */
export class ShiftPreferences {
  private preferences: Preference[];

  constructor(preferences: Preference[]) {
    // we validate the preferences here because we want to throw an error if the preferences are invalid
    this.validatePreferences(preferences);
    this.preferences = preferences;
  }

  getPreferences(): Preference[] {
    return this.preferences;
  }

  validatePreferenceObject(preference: Preference): void {
    if (!preference || typeof preference !== "object") {
      throw new PreferenceValidationError("The value passed is not an object");
    }

    if (!("shift" in preference) || !("dayOfWeek" in preference)) {
      throw new PreferenceValidationError(
        "The object must have shift and dayOfWeek properties"
      );
    }

    if (!(preference.shift in ShiftType)) {
      throw new PreferenceValidationError(
        'Invalid shift value: must be "day" or "night"'
      );
    }

    if (
      ![
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
        "sunday",
      ].includes(preference.dayOfWeek as DayOfWeek)
    ) {
      throw new PreferenceValidationError(
        'Invalid dayOfWeek value: must be "monday" to "sunday"'
      );
    }
  }

  validatePreferences(preferences: Preference[]): void {
    try {
      if (preferences.length === 0)
        throw new PreferenceValidationError(
          "Prefences array was empty, this is an invalid state, we do not want to save an empty array"
        );

      preferences.forEach((pref: Preference) => {
        this.validatePreferenceObject(pref);
        return pref;
      });
    } catch (error) {
      // no proper logging here because we are not in a production environment but good to log errors
      console.log("error", error);
      if (error instanceof PreferenceValidationError) {
        throw error;
      }
      if (error instanceof SyntaxError) {
        throw new PreferenceParseError("Invalid JSON format for preferences");
      }
      throw error;
    }
  }
}
