// Mock break/meal policy used to auto-insert legally-styled rest and meal
// periods into a crew's day. This is explicitly a SIMULATED company policy,
// not a citation of any specific law: US break/meal requirements are set at
// the state level (federal law does not require them at all), and vary a
// lot — California requires them, Florida (where our demo addresses are)
// does not. Modeling one universal "US law" would be inaccurate, so the UI
// always labels this as a configurable, simulated policy.

export interface BreakPolicy {
  /** Paid rest break granted after this many accumulated minutes since the last one. */
  restBreakEveryMinutes: number;
  restBreakDurationMinutes: number;
  /** Unpaid meal period granted after this many accumulated minutes since the last one. */
  mealBreakAfterMinutes: number;
  mealBreakDurationMinutes: number;
  /** A second meal period is granted once total elapsed shift time crosses this. */
  secondMealAfterMinutes: number;
}

export const DEFAULT_BREAK_POLICY: BreakPolicy = {
  restBreakEveryMinutes: 240, // 4h
  restBreakDurationMinutes: 10,
  mealBreakAfterMinutes: 285, // 4h45m — a meal already covers a rest that would otherwise fall due minutes later
  mealBreakDurationMinutes: 30,
  secondMealAfterMinutes: 600, // 10h
};

export const BREAK_POLICY_LABEL =
  "Break policy (simulated): 10-min paid rest every 4h worked · 30-min meal after ~4h45m · 2nd meal after 10h";
