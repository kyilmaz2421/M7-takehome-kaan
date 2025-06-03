import { Preference, ShiftType, DayOfWeek } from "./shift-preference.types";
import {
  ShiftPreferences,
  PreferenceValidationError,
} from "./shift-preference.model";

describe("ShiftPreferences", () => {
  describe("constructor", () => {
    it("should create instance with valid preferences", () => {
      const validPrefs: Preference[] = [
        { shift: ShiftType.day, dayOfWeek: "monday" },
        { shift: ShiftType.night, dayOfWeek: "tuesday" },
      ];
      const prefs = new ShiftPreferences(validPrefs);
      expect(prefs.getPreferences()).toEqual(validPrefs);
    });

    it("should throw PreferenceValidationError for empty preferences array", () => {
      expect(() => {
        new ShiftPreferences([]);
      }).toThrow(PreferenceValidationError);
      expect(() => {
        new ShiftPreferences([]);
      }).toThrow(
        "Prefences array was empty, this is an invalid state, we do not want to save an empty array"
      );
    });
  });

  describe("validatePreferenceObject", () => {
    let preferences: ShiftPreferences;

    beforeEach(() => {
      preferences = new ShiftPreferences([
        { shift: "day" as ShiftType, dayOfWeek: "monday" as DayOfWeek },
      ]);
    });

    it("should throw PreferenceValidationError for null input", () => {
      expect(() => {
        preferences.validatePreferenceObject(null as any);
      }).toThrow(PreferenceValidationError);
      expect(() => {
        preferences.validatePreferenceObject(null as any);
      }).toThrow("The value passed is not an object");
    });

    it("should throw PreferenceValidationError for non-object input", () => {
      expect(() => {
        preferences.validatePreferenceObject("string" as any);
      }).toThrow(PreferenceValidationError);
      expect(() => {
        preferences.validatePreferenceObject("string" as any);
      }).toThrow("The value passed is not an object");
    });

    it("should throw PreferenceValidationError for missing shift property", () => {
      expect(() => {
        preferences.validatePreferenceObject({ dayOfWeek: "monday" } as any);
      }).toThrow(PreferenceValidationError);
      expect(() => {
        preferences.validatePreferenceObject({ dayOfWeek: "monday" } as any);
      }).toThrow("The object must have shift and dayOfWeek properties");
    });

    it("should throw PreferenceValidationError for missing dayOfWeek property", () => {
      expect(() => {
        preferences.validatePreferenceObject({ shift: "day" } as any);
      }).toThrow(PreferenceValidationError);
      expect(() => {
        preferences.validatePreferenceObject({ shift: "day" } as any);
      }).toThrow("The object must have shift and dayOfWeek properties");
    });

    it("should throw PreferenceValidationError for invalid shift value", () => {
      expect(() => {
        preferences.validatePreferenceObject({
          shift: "afternoon",
          dayOfWeek: "monday",
        } as any);
      }).toThrow(PreferenceValidationError);
      expect(() => {
        preferences.validatePreferenceObject({
          shift: "afternoon",
          dayOfWeek: "monday",
        } as any);
      }).toThrow('Invalid shift value: must be "day" or "night"');
    });

    it("should throw PreferenceValidationError for invalid dayOfWeek value", () => {
      expect(() => {
        preferences.validatePreferenceObject({
          shift: "day",
          dayOfWeek: "invalidDay",
        } as any);
      }).toThrow(PreferenceValidationError);
      expect(() => {
        preferences.validatePreferenceObject({
          shift: "day",
          dayOfWeek: "invalidDay",
        } as any);
      }).toThrow('Invalid dayOfWeek value: must be "monday" to "sunday"');
    });

    it("should not throw for valid preference object", () => {
      expect(() => {
        preferences.validatePreferenceObject({
          shift: "day" as ShiftType,
          dayOfWeek: "monday" as DayOfWeek,
        });
      }).not.toThrow();
    });
  });

  describe("validatePreferences", () => {
    let preferences: ShiftPreferences;

    beforeEach(() => {
      preferences = new ShiftPreferences([
        { shift: "day" as ShiftType, dayOfWeek: "monday" as DayOfWeek },
      ]);
    });

    it("should throw PreferenceValidationError for empty array", () => {
      expect(() => {
        preferences.validatePreferences([]);
      }).toThrow(PreferenceValidationError);
      expect(() => {
        preferences.validatePreferences([]);
      }).toThrow(
        "Prefences array was empty, this is an invalid state, we do not want to save an empty array"
      );
    });

    it("should throw PreferenceValidationError for array with invalid preference", () => {
      const invalidPrefs = [
        { shift: "day" as ShiftType, dayOfWeek: "monday" as DayOfWeek },
        { shift: "invalid", dayOfWeek: "tuesday" },
      ];
      expect(() => {
        preferences.validatePreferences(invalidPrefs as any[]);
      }).toThrow(PreferenceValidationError);
      expect(() => {
        preferences.validatePreferences(invalidPrefs as any[]);
      }).toThrow('Invalid shift value: must be "day" or "night"');
    });

    it("should not throw for array with valid preferences", () => {
      const validPrefs: Preference[] = [
        { shift: "day" as ShiftType, dayOfWeek: "monday" as DayOfWeek },
        { shift: "night" as ShiftType, dayOfWeek: "tuesday" as DayOfWeek },
      ];
      expect(() => {
        preferences.validatePreferences(validPrefs);
      }).not.toThrow();
    });
  });

  describe("getPreferences", () => {
    it("should return the preferences array", () => {
      const validPrefs: Preference[] = [
        { shift: "day" as ShiftType, dayOfWeek: "monday" as DayOfWeek },
        { shift: "night" as ShiftType, dayOfWeek: "tuesday" as DayOfWeek },
      ];
      const prefs = new ShiftPreferences(validPrefs);
      expect(prefs.getPreferences()).toEqual(validPrefs);
    });

    it("should return a copy of the preferences array", () => {
      const validPrefs: Preference[] = [
        { shift: "day" as ShiftType, dayOfWeek: "monday" as DayOfWeek },
      ];
      const prefs = new ShiftPreferences(validPrefs);
      const returnedPrefs = prefs.getPreferences();

      // Modify the returned array
      returnedPrefs.push({
        shift: "night" as ShiftType,
        dayOfWeek: "tuesday" as DayOfWeek,
      });

      // Original preferences should not be modified
      expect(prefs.getPreferences()).toEqual(validPrefs);
    });
  });
});
