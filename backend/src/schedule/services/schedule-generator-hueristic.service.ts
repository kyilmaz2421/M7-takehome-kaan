import { Injectable } from "@nestjs/common";
import {
  ShiftType,
  DayOfWeek,
} from "src/shiftPreference/shift-preference.types";
import { ScheduleEntity, SchedulingAlgorithm } from "../schedule.entity";
import { ScheduleGenerator, NursePreference } from "./schedule-generator.model";

interface DailySchedule {
  [ShiftType.day]: number[]; // nurseIds
  [ShiftType.night]: number[]; // nurseIds
}

type WeeklySchedule = {
  [key in DayOfWeek]: DailySchedule;
};

/**
 * A heuristic-based nurse scheduling service that generates weekly schedules by scoring and assigning nurses based on multiple factors.
 *
 * @description
 * This scheduler uses a greedy heuristic approach to generate nurse schedules. It processes requirements in order of highest nurse demand
 * and assigns nurses based on a composite score calculated from multiple factors.
 *
 * Key Features:
 * - Processes higher demand shifts first to handle the most constrained requirements
 * - Uses a scoring system that considers:
 *   - Nurse preferences for specific shifts (+1 points)
 *   - Fair distribution of shifts across nurses (+1 point per available shift slot)
 *   - Penalties for consecutive night shifts (-1 points)
 *   - Availability for required shifts (+1000 points)
 *
 * Tradeoffs:
 * - Pros:
 *   - Fast execution time (O(n*m) where n = nurses, m = shifts)
 *   - Guarantees meeting minimum staffing requirements when possible
 *   - Considers multiple factors in nurse satisfaction
 *   - Easy to modify scoring weights to adjust priorities
 *
 * - Cons:
 *   - May not find globally optimal solution due to greedy approach
 *   - Could miss better solutions by processing requirements sequentially
 *   - Fixed scoring weights may not adapt well to all scenarios
 *   - No backtracking if early assignments lead to conflicts later
 *
 * The algorithm is most suitable for:
 * - Medium-sized nursing departments (10-50 nurses)
 * - Scenarios where quick scheduling is preferred over perfect optimization
 * - Environments where nurse preferences should be considered but not guaranteed
 */
@Injectable()
export class ScheduleGeneratorHeuristicService extends ScheduleGenerator {
  // higher score is better lower score is worse
  // These could be made configurable or be dynamic but for now hardcoded is sufficient
  private readonly CONSECUTIVE_NIGHT_PENALTY = -10;
  private readonly PREFERENCE_MATCH_SCORE = 15;
  private readonly FAIR_DISTRIBUTION_SCORE = 1;
  private readonly AVAILABLE_FOR_REQUIREMENT_SCORE = 100;
  private readonly NO_PREFERENCE_SCORE = 0;
  private readonly ANTI_PREFERENCE_PENALTY = -2; // Penalty for scheduling against preferences

  override async generateSchedule(): Promise<ScheduleEntity> {
    const schedule = new ScheduleEntity();
    schedule.schedulingAlgorithm = SchedulingAlgorithm.HEURISTIC;
    schedule.shifts = [];

    // Initialize tracking structures
    const weeklySchedule: WeeklySchedule = this.initializeWeeklySchedule();
    const nurseShiftCounts: Map<number, number> = new Map();
    const nurseScores: Map<number, number> = new Map();
    this.nurses.forEach(({ nurseId }) => {
      nurseScores.set(nurseId, this.AVAILABLE_FOR_REQUIREMENT_SCORE);
      nurseShiftCounts.set(nurseId, 0);
    });

    // Sort requirements to handle higher requirement days first
    const sortedShiftsToFill = [...this.requirements].sort(
      (a, b) => Number(b.nursesRequired) - Number(a.nursesRequired)
    );

    // Process each day and shift type
    for (const shiftToFill of sortedShiftsToFill) {
      const dayOfWeek = shiftToFill.dayOfWeek.toLowerCase() as DayOfWeek;
      const shiftType = shiftToFill.shift;
      const nursesNeededOnShift = shiftToFill.nursesRequired;

      this.nurses.forEach(({ nurseId, preferences }) => {
        const currentScore = nurseScores.get(nurseId) || 0;
        const currentShiftCount = nurseShiftCounts.get(nurseId) || 0;
        const score = this.calculateScoreForNurse(
          nurseId,
          preferences,
          dayOfWeek,
          shiftType,
          weeklySchedule,
          currentShiftCount,
          currentScore
        );
        nurseScores.set(nurseId, score);
      });

      // Assign nurses based on scores
      const assignedNursesOnShift = this.assignNursesToShift(
        nurseScores,
        nursesNeededOnShift
      );

      // Update schedule
      weeklySchedule[dayOfWeek][shiftType] = assignedNursesOnShift;

      // Create shift entities
      assignedNursesOnShift.forEach((nurseId) => {
        // Update shift counts
        nurseShiftCounts.set(nurseId, (nurseShiftCounts.get(nurseId) || 0) + 1);
        schedule.shifts.push(
          this.createShift(
            nurseId,
            this.getDateForDay(dayOfWeek),
            shiftType,
            dayOfWeek
          )
        );
      });
    }

    return schedule;
  }

  private calculateScoreForNurse(
    nurseId: number,
    preferences: NursePreference["preferences"],
    day: DayOfWeek,
    shiftType: ShiftType,
    weeklySchedule: WeeklySchedule,
    nurseShiftCount: number,
    nurseCurrentScore: number
  ): number {
    // Count how many nurses are already assigned to this shift
    if (!this.isNurseAvailable(nurseId, day, weeklySchedule, nurseShiftCount)) {
      return -Infinity;
    }
    let score = 0;
    score += this.AVAILABLE_FOR_REQUIREMENT_SCORE;
    // // Check consecutive night shifts
    if (shiftType === ShiftType.night) {
      const hadPreviousNight = this.hadPreviousNightShift(
        nurseId,
        day,
        weeklySchedule
      );
      if (hadPreviousNight) score += this.CONSECUTIVE_NIGHT_PENALTY;
    }

    // add preference score
    const preferenceScore = this.getPreferenceScore(
      nurseId,
      preferences,
      day,
      shiftType
    );
    score += preferenceScore;

    // Fair distribution scoring logic:
    // 1. Each nurse can work up to MAX_SHIFTS_PER_WEEK (5) shifts
    // 2. The fewer shifts a nurse has been assigned, the higher their score should be
    // 3. Example calculation:
    //    - If nurse has 0 shifts: score += 1 * (5 - 0) = 5 points
    //    - If nurse has 2 shifts: score += 1 * (5 - 2) = 3 points
    //    - If nurse has 4 shifts: score += 1 * (5 - 4) = 1 point
    //    This creates a natural preference for nurses who have worked fewer shifts
    score +=
      this.FAIR_DISTRIBUTION_SCORE * // Multiplier (currently 1)
      (this.MAX_SHIFTS_PER_WEEK - nurseShiftCount); // More remaining shifts = higher score

    return score;
  }

  private isNurseAvailable(
    nurseId: number,
    day: DayOfWeek,
    weeklySchedule: WeeklySchedule,
    nurseShiftCount: number
  ): boolean {
    // Check if nurse hasn't exceeded max shifts
    const currentShifts = nurseShiftCount;
    if (currentShifts >= this.MAX_SHIFTS_PER_WEEK) return false;

    // Check if nurse isn't already assigned to any shift on this day
    const daySchedule = weeklySchedule[day];
    return !Object.values(daySchedule).some((shifts) =>
      shifts.includes(nurseId)
    );
  }

  private assignNursesToShift(
    nurseScores: Map<number, number>,
    nursesNeededOnShift: number
  ): number[] {
    const nurseScoresArray = Array.from(nurseScores.entries()).map(
      ([nurseId, score]) => ({ nurseId, score })
    );
    // Get the best scoring nurses that aren't already assigned
    const newAssignments = nurseScoresArray
      .sort((a, b) => b.score - a.score)
      .slice(0, nursesNeededOnShift) // takes only the number of nurses needed on the shift
      .map((nurse) => nurse.nurseId);

    // Combine existing and new assignments
    return newAssignments;
  }

  private initializeWeeklySchedule(): WeeklySchedule {
    return this.DAYS.reduce((acc, day) => {
      acc[day] = {
        [ShiftType.day]: [],
        [ShiftType.night]: [],
      };
      return acc;
    }, {} as WeeklySchedule);
  }

  /**
   * Calculate score based on nurse preferences for this shift
   * @returns
   * PREFERENCE_MATCH_SCORE (1): if nurse specifically requested this shift
   * NO_PREFERENCE_SCORE (0): if nurse had no preferences
   * ANTI_PREFERENCE_PENALTY (-2): if nurse had preferences but not for this shift
   */
  private getPreferenceScore(
    nurseId: number,
    preferences: NursePreference["preferences"],
    day: DayOfWeek,
    shiftType: ShiftType
  ): number {
    // If nurse has no preferences at all, return neutral score
    if (preferences.length === 0) {
      return this.NO_PREFERENCE_SCORE;
    }

    // Check if nurse specifically requested this shift
    const hasPreference = preferences.some(
      (pref) => pref.dayOfWeek === day && pref.shift === shiftType
    );

    if (hasPreference) {
      return this.PREFERENCE_MATCH_SCORE; // Bonus for matching preference
    }

    // If nurse had preferences but not for this shift, apply penalty
    return this.ANTI_PREFERENCE_PENALTY;
  }

  private hadPreviousNightShift(
    nurseId: number,
    currentDay: DayOfWeek,
    schedule: WeeklySchedule
  ): boolean {
    const currentDayIndex = this.DAYS.indexOf(currentDay);
    if (currentDayIndex <= 0) return false;

    const previousDay = this.DAYS[currentDayIndex - 1];
    return schedule[previousDay][ShiftType.night].includes(nurseId);
  }
}
