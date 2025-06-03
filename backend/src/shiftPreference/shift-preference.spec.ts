import { Preference, ShiftType, DayOfWeek } from "./shift-preference.types";
import {
  ShiftPreferences,
  PreferenceValidationError,
  PreferenceParseError,
} from "./shift-preference.model";

describe("ShiftPreferences", () => {
  describe("constructor", () => {
    it("should create instance with valid preferences", () => {
      const validPrefs: Preference[] = [
        { shift: ShiftType.day, dayOfWeek: DayOfWeek.MONDAY },
        { shift: ShiftType.night, dayOfWeek: DayOfWeek.TUESDAY },
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
        { shift: ShiftType.day, dayOfWeek: DayOfWeek.MONDAY },
      ]);
    });

    it("should throw PreferenceValidationError for null or undefined input", () => {
      [null, undefined].forEach((invalidInput) => {
        expect(() => {
          preferences.validatePreferenceObject(invalidInput as any);
        }).toThrow(PreferenceValidationError);
        expect(() => {
          preferences.validatePreferenceObject(invalidInput as any);
        }).toThrow("The value passed is not an object");
      });
    });

    it("should throw PreferenceValidationError for non-object inputs", () => {
      ["string", 123, true].forEach((invalidInput) => {
        expect(() => {
          preferences.validatePreferenceObject(invalidInput as any);
        }).toThrow(PreferenceValidationError);
        expect(() => {
          preferences.validatePreferenceObject(invalidInput as any);
        }).toThrow("The value passed is not an object");
      });
    });

    it("should throw PreferenceValidationError for array input", () => {
      expect(() => {
        preferences.validatePreferenceObject([] as any);
      }).toThrow(PreferenceValidationError);
      expect(() => {
        preferences.validatePreferenceObject([] as any);
      }).toThrow("The object must have shift and dayOfWeek properties");
    });

    it("should throw PreferenceValidationError for missing required properties", () => {
      const testCases = [
        { input: { dayOfWeek: DayOfWeek.MONDAY }, missing: "shift" },
        { input: { shift: ShiftType.day }, missing: "dayOfWeek" },
        { input: {}, missing: "both" },
      ];

      testCases.forEach((testCase) => {
        expect(() => {
          preferences.validatePreferenceObject(testCase.input as any);
        }).toThrow("The object must have shift and dayOfWeek properties");
      });
    });

    it("should throw PreferenceValidationError for invalid shift values", () => {
      const invalidPreference = {
        shift: "afternoon",
        dayOfWeek: DayOfWeek.MONDAY,
      };

      expect(() => {
        preferences.validatePreferenceObject(invalidPreference as any);
      }).toThrow('Invalid shift value: must be "day" or "night"');
    });

    it("should throw PreferenceValidationError for invalid dayOfWeek values", () => {
      const invalidPreference = {
        shift: ShiftType.day,
        dayOfWeek: "invalidDay",
      };

      expect(() => {
        preferences.validatePreferenceObject(invalidPreference as any);
      }).toThrow('Invalid dayOfWeek value: must be "monday" to "sunday"');
    });

    it("should accept all valid days of the week", () => {
      Object.values(DayOfWeek).forEach((day) => {
        const validPreference = {
          shift: ShiftType.day,
          dayOfWeek: day,
        };
        expect(() => {
          preferences.validatePreferenceObject(validPreference);
        }).not.toThrow();
      });
    });
  });

  describe("validatePreferences", () => {
    let preferences: ShiftPreferences;

    beforeEach(() => {
      preferences = new ShiftPreferences([
        { shift: ShiftType.day, dayOfWeek: DayOfWeek.MONDAY },
      ]);
    });

    it("should throw PreferenceValidationError for empty array", () => {
      expect(() => {
        preferences.validatePreferences([]);
      }).toThrow(
        "Prefences array was empty, this is an invalid state, we do not want to save an empty array"
      );
    });

    it("should throw PreferenceValidationError for array with invalid preferences", () => {
      const invalidPrefs = [
        { shift: ShiftType.day, dayOfWeek: DayOfWeek.MONDAY },
        { shift: "invalid", dayOfWeek: DayOfWeek.TUESDAY },
      ];
      expect(() => {
        preferences.validatePreferences(invalidPrefs as any[]);
      }).toThrow('Invalid shift value: must be "day" or "night"');
    });

    it("should handle JSON parsing errors appropriately", () => {
      const malformedJson = "[{bad json}]";
      expect(() => {
        preferences.validatePreferences(JSON.parse(malformedJson) as any[]);
      }).toThrow(SyntaxError);
    });

    it("should validate all preferences in the array", () => {
      const validPrefs: Preference[] = [
        { shift: ShiftType.day, dayOfWeek: DayOfWeek.MONDAY },
        { shift: ShiftType.night, dayOfWeek: DayOfWeek.TUESDAY },
        { shift: ShiftType.day, dayOfWeek: DayOfWeek.WEDNESDAY },
      ];
      expect(() => {
        preferences.validatePreferences(validPrefs);
      }).not.toThrow();
    });
  });

  describe("getPreferences", () => {
    it("should return the preferences array", () => {
      const validPrefs: Preference[] = [
        { shift: ShiftType.day, dayOfWeek: DayOfWeek.MONDAY },
        { shift: ShiftType.night, dayOfWeek: DayOfWeek.TUESDAY },
      ];
      const prefs = new ShiftPreferences(validPrefs);
      const returnedPrefs = prefs.getPreferences();
      expect(returnedPrefs).toEqual(validPrefs);
    });
  });
});
