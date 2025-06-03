import { Injectable } from "@nestjs/common";
import { ShiftRequirements } from "src/shift/shift.entity";
import {
  ShiftType,
  DayOfWeek,
} from "src/shiftPreference/shift-preference.types";
import { ScheduleEntity, SchedulingAlgorithm } from "../schedule.entity";
import { ScheduleGenerator, NursePreference } from "./schedule-generator.model";

// GLPK types - defined inline to avoid module resolution issues
interface LP {
  name: string;
  objective: {
    direction: number;
    name: string;
    vars: { name: string; coef: number }[];
  };
  subjectTo: {
    name: string;
    vars: { name: string; coef: number }[];
    bnds: { type: number; ub: number; lb: number };
  }[];
  bounds?: {
    name: string;
    type: number;
    ub: number;
    lb: number;
  }[];
  binaries?: string[];
  generals?: string[];
}

interface Result {
  name: string;
  time: number;
  result: {
    status: number;
    z: number;
    vars: { [key: string]: number };
    dual?: { [key: string]: number };
  };
}

interface GLPK {
  readonly GLP_MIN: number;
  readonly GLP_MAX: number;
  readonly GLP_FR: number;
  readonly GLP_LO: number;
  readonly GLP_UP: number;
  readonly GLP_DB: number;
  readonly GLP_FX: number;
  readonly GLP_MSG_OFF: number;
  readonly GLP_MSG_ERR: number;
  readonly GLP_MSG_ON: number;
  readonly GLP_MSG_ALL: number;
  readonly GLP_MSG_DBG: number;
  readonly GLP_UNDEF: number;
  readonly GLP_FEAS: number;
  readonly GLP_INFEAS: number;
  readonly GLP_NOFEAS: number;
  readonly GLP_OPT: number;
  readonly GLP_UNBND: number;
  version: string;
  write(lp: LP): string;
  solve(lp: LP, options?: any): Result;
}

/**
 * Integer Linear Programming (ILP) based nurse scheduling service.
 * Uses the GLPK (GNU Linear Programming Kit) solver to find optimal schedules.
 *
 * @description
 * This scheduler formulates nurse scheduling as an ILP problem where:
 * - Decision Variables: Binary variables x[n,d,s] representing nurse n working shift s on day d
 * - Objective Function: Maximize the sum of preference matches while ensuring all constraints
 * - Hard Constraints: Exact staffing requirements, max shifts per nurse, one shift per day
 *
 * Weight System:
 * - BASE_ASSIGNMENT_WEIGHT (0.1): Ensures valid assignments
 * - PREFERENCE_WEIGHT (1.0): Bonus for matching preferences
 * - ANTI_PREFERENCE_PENALTY (-0.2): Small penalty when assigning against preferences
 *   (only applies when nurse has some preferences but not for this shift)
 *
 * Final Weight Calculation:
 * - Preferred shift: 1.1 (0.1 + 1.0)
 * - No preferences: 0.1 (base only)
 * - Against preferences: -0.1 (0.1 - 0.2)
 *
 * Mathematical Formulation:
 *
 * 1. Decision Variables:
 *    x[n,d,s] ∈ {0,1} where:
 *    - n ∈ Nurses (set of all nurses)
 *    - d ∈ Days (set of days in week)
 *    - s ∈ Shifts (day, night)
 *    x[n,d,s] = 1 if nurse n is assigned to shift s on day d, 0 otherwise
 *
 * 2. Objective Function:
 *    Maximize: Σ (BASE_ASSIGNMENT_WEIGHT + PREFERENCE_WEIGHT * hasPreference[n,d,s] + ANTI_PREFERENCE_PENALTY * hasAnyPreferences[n] * !hasPreference[n,d,s]) * x[n,d,s]
 *    where:
 *    - BASE_ASSIGNMENT_WEIGHT = 0.1 (ensures valid assignments even without preferences)
 *    - PREFERENCE_WEIGHT = 1.0 (prioritizes matching nurse preferences)
 *    - ANTI_PREFERENCE_PENALTY = -0.2 (small penalty for assigning against preferences)
 *    - hasPreference[n,d,s] = 1 if nurse n prefers shift s on day d, 0 otherwise
 *    - hasAnyPreferences[n] = 1 if nurse n has any preferences, 0 otherwise
 *
 * 3. Constraints:
 *    a) Staffing Requirements (Equality):
 *       Σ(n ∈ Nurses) x[n,d,s] = required[d,s]
 *       ∀ d ∈ Days, s ∈ Shifts
 *
 *    b) Maximum Weekly Shifts (Inequality):
 *       Σ(d ∈ Days, s ∈ Shifts) x[n,d,s] ≤ MAX_SHIFTS_PER_WEEK
 *       ∀ n ∈ Nurses
 *
 *    c) One Shift Per Day (Inequality):
 *       Σ(s ∈ Shifts) x[n,d,s] ≤ 1
 *       ∀ n ∈ Nurses, d ∈ Days
 *
 * Solution Method:
 * The GLPK solver uses branch-and-cut algorithm:
 * 1. Relaxes integer constraints to solve as LP
 * 2. Branches on fractional variables
 * 3. Adds cutting planes to tighten bounds
 * 4. Repeats until optimal integer solution is found
 *
 * Advantages of ILP Approach:
 * - Guarantees optimal solution if one exists
 * - Can handle complex constraints elegantly
 * - Provides mathematical certainty about solution quality
 * - Better at handling interdependent constraints
 *
 * Disadvantages:
 * - Computationally expensive for large problems (NP-hard)
 * - May take longer to solve than heuristic approaches
 * - Requires specialized solver library (GLPK)
 * - Less flexible for handling soft constraints
 *
 * GLPK Solver Details:
 * - Uses branch-and-cut algorithm for integer programming
 * - Provides exact solutions for linear optimization
 * - Status codes:
 *   - GLP_OPT: Optimal solution found
 *   - GLP_INFEAS: Problem has no feasible solution
 *   - GLP_UNBND: Problem has unbounded solution
 *   - GLP_UNDEF: Solution is undefined
 *
 * Example:
 * For a simple case with 2 nurses (N1, N2), 1 day (Monday), 1 required nurse:
 *
 * Variables: x[N1,Mon,day], x[N2,Mon,day]
 * Objective: max(0.1*x[N1,Mon,day] + 1.1*x[N2,Mon,day])
 *           where N2 has preference for Monday day shift
 * Constraints:
 * - x[N1,Mon,day] + x[N2,Mon,day] = 1
 * - x[N1,Mon,day], x[N2,Mon,day] ∈ {0,1}
 *
 * Solution: x[N2,Mon,day] = 1, x[N1,Mon,day] = 0
 */
@Injectable()
export class ScheduleGeneratorILPService extends ScheduleGenerator {
  private glpk!: GLPK;
  private readonly PREFERENCE_WEIGHT = 1; // Weight for matching preferences
  private readonly BASE_ASSIGNMENT_WEIGHT = 0.1; // Small positive weight for any valid assignment
  private readonly ANTI_PREFERENCE_PENALTY = -0.2; // Small penalty for assigning against preferences

  constructor(requirements: ShiftRequirements[], nurses: NursePreference[]) {
    super(requirements, nurses);
    // Initialize GLPK synchronously
    const GLPKConstructor = require("glpk.js");
    this.glpk = GLPKConstructor();
  }

  /**
   * Generates an optimal nurse schedule using Integer Linear Programming.
   * The schedule maximizes preference satisfaction while meeting all constraints.
   *
   * Preference Handling Process:
   * 1. For each nurse-day-shift combination:
   *    - Create binary decision variable x[n,d,s]
   *    - Check if nurse has preference for this shift
   *    - Assign appropriate weight in objective function
   *
   * 2. Weight Assignment:
   *    - Base weight (0.1) always added for valid assignments
   *    - Preference bonus (1.0) added only for preferred shifts
   *    - Anti-preference penalty (-0.2) added only for shifts against preferences
   *    - Total coefficient = BASE_ASSIGNMENT_WEIGHT + (hasPreference ? PREFERENCE_WEIGHT : 0) + (hasAnyPreferences && !hasPreference ? ANTI_PREFERENCE_PENALTY : 0)
   *
   * 3. Solver Behavior:
   *    - Maximizes sum of weighted assignments
   *    - Prioritizes assigning nurses to preferred shifts
   *    - Falls back to valid assignments when preferences can't be met
   *
   * @returns Promise<ScheduleEntity> A schedule that:
   * - Meets all hard constraints (requirements, max shifts, one shift per day)
   * - Maximizes preference satisfaction where possible
   * - Is guaranteed to be optimal if a solution exists
   *
   * @throws Error if:
   * - No feasible solution exists
   * - Solver fails to find a solution
   * - Solution verification fails
   */
  override async generateSchedule(): Promise<ScheduleEntity> {
    const schedule = new ScheduleEntity();
    schedule.schedulingAlgorithm = SchedulingAlgorithm.ILP;
    const nurses = this.nurses.map((n) => n.nurseId);

    // Create ILP problem using the correct GLPK.js structure
    const lp: LP = {
      name: "Nurse Scheduling",
      objective: {
        // maximize the objective function
        direction: this.glpk.GLP_MAX,
        name: "obj",
        vars: [],
      },
      subjectTo: [],
      binaries: [],
    };

    // Decision variables: x[n,d,s] = 1 if nurse n works shift s on day d
    nurses.forEach((nurse) => {
      this.DAYS.forEach((day) => {
        Object.values(ShiftType).forEach((shift) => {
          const varName = `x_${nurse}_${day}_${shift}`;

          const nurseData = this.nurses.find((n) => n.nurseId === nurse);
          const hasPreference = nurseData?.preferences.some(
            (p) => p.dayOfWeek === day && p.shift === shift
          );

          // Only apply anti-preference penalty if nurse has some preferences but not for this shift
          const hasAnyPreferences = (nurseData?.preferences.length ?? 0) > 0;
          const penalty =
            hasAnyPreferences && !hasPreference
              ? this.ANTI_PREFERENCE_PENALTY
              : 0;

          lp.objective.vars.push({
            name: varName,
            coef:
              this.BASE_ASSIGNMENT_WEIGHT +
              (hasPreference ? this.PREFERENCE_WEIGHT : 0) +
              penalty,
          });

          lp.binaries!.push(varName);
        });
      });
    });

    /**
     * Constraint Set 1: Exact Staffing Requirements
     * For each day d and shift s:
     * Σ x[n,d,s] = required[d,s] for all nurses n
     *
     * This ensures:
     * - Exactly the required number of nurses are assigned
     * - No over or under-staffing is allowed
     * - Requirements are treated as hard constraints
     */
    this.requirements.forEach((req) => {
      const day = req.dayOfWeek.toLowerCase();
      const shift = req.shift;
      const constraint = {
        name: `req_${day}_${shift}`,
        vars: nurses.map((nurse) => ({
          name: `x_${nurse}_${day}_${shift}`,
          coef: 1,
        })),
        bnds: {
          type: this.glpk.GLP_FX, // Fixed equality constraint
          ub: Number(req.nursesRequired),
          lb: Number(req.nursesRequired),
        },
      };
      lp.subjectTo.push(constraint);
    });

    /**
     * Constraint Set 2: Maximum Shifts Per Nurse
     * For each nurse n:
     * Σ x[n,d,s] ≤ MAX_SHIFTS_PER_WEEK for all days d and shifts s
     *
     * This ensures:
     * - No nurse works more than their maximum allowed shifts
     * - Helps maintain fair workload distribution
     * - Prevents overworking any individual nurse
     */
    nurses.forEach((nurse) => {
      const constraint = {
        name: `max_shifts_${nurse}`,
        vars: this.DAYS.flatMap((day) =>
          Object.values(ShiftType).map((shift) => ({
            name: `x_${nurse}_${day}_${shift}`,
            coef: 1,
          }))
        ),
        bnds: {
          type: this.glpk.GLP_UP,
          ub: this.MAX_SHIFTS_PER_WEEK,
          lb: 0,
        },
      };
      lp.subjectTo.push(constraint);
    });

    /**
     * Constraint Set 3: One Shift Per Day Per Nurse
     * For each nurse n and day d:
     * Σ x[n,d,s] ≤ 1 for all shifts s
     *
     * This ensures:
     * - No nurse works multiple shifts on the same day
     * - Maintains work-life balance
     * - Prevents illegal/unsafe scheduling patterns
     */
    nurses.forEach((nurse) => {
      this.DAYS.forEach((day) => {
        const constraint = {
          name: `one_shift_${nurse}_${day}`,
          vars: Object.values(ShiftType).map((shift) => ({
            name: `x_${nurse}_${day}_${shift}`,
            coef: 1,
          })),
          bnds: {
            type: this.glpk.GLP_UP,
            ub: 1,
            lb: 0,
          },
        };
        lp.subjectTo.push(constraint);
      });
    });

    // Solve the problem
    try {
      const result = this.glpk.solve(lp, { msglev: this.glpk.GLP_MSG_ALL }); // Changed to ALL for better debugging

      if (result.result.status === this.glpk.GLP_OPT) {
        // Convert solution to schedule
        schedule.shifts = [];

        Object.entries(result.result.vars).forEach(([varName, value]) => {
          if (Math.round(value as number) === 1) {
            const [_, nurse, day, shift] = varName.split("_");
            schedule.shifts.push(
              this.createShift(
                parseInt(nurse),
                this.getDateForDay(day as DayOfWeek),
                shift as ShiftType,
                day as DayOfWeek
              )
            );
          }
        });

        // Verify we met all requirements
        if (schedule.shifts.length === 0) {
          throw new Error(
            "Generated schedule has no shifts despite solver reporting success"
          );
        }
      } else {
        throw new Error(
          `Failed to find optimal solution. Status: ${result.result.status}`
        );
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown error occurred";
      throw new Error(`Failed to generate optimal schedule: ${message}`);
    }

    return schedule;
  }
}
