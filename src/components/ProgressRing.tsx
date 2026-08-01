function ringPath(radius: number, progress: number, color: string) {
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(progress, 1));
  return (
    <circle
      cx="42"
      cy="42"
      r={radius}
      fill="none"
      stroke={color}
      strokeWidth="9"
      strokeLinecap="round"
      strokeDasharray={circumference}
      strokeDashoffset={circumference * (1 - clamped)}
      transform="rotate(-90 42 42)"
    />
  );
}

function Remaining({
  remaining,
  decimals,
  unit,
  color,
}: {
  remaining: number;
  decimals: number;
  unit: string;
  color: "sage" | "terracotta";
}) {
  const over = remaining < 0;
  return (
    <span className="flex items-baseline gap-1">
      {over && (
        <span className="text-danger" aria-hidden="true">
          ▲
        </span>
      )}
      <span className={`font-semibold tabular-nums ${color === "sage" ? "text-sage" : "text-terracotta"}`}>
        {Math.abs(remaining).toFixed(decimals)}
      </span>
      <span className="text-ink-muted">
        {unit} {over ? "over" : "left"}
      </span>
    </span>
  );
}

export function ProgressRing({
  calories,
  calorieGoal,
  protein,
  proteinGoal,
}: {
  calories: number;
  calorieGoal: number | null;
  protein: number;
  proteinGoal: number | null;
}) {
  return (
    <div>
      <div className="flex items-center gap-5">
        <svg viewBox="0 0 84 84" className="h-24 w-24 shrink-0">
          <circle cx="42" cy="42" r="34" fill="none" stroke="var(--color-sage-soft)" strokeWidth="9" />
          <circle cx="42" cy="42" r="21" fill="none" stroke="var(--color-terracotta-soft)" strokeWidth="9" />
          {ringPath(34, calorieGoal ? calories / calorieGoal : 0, "var(--color-sage)")}
          {ringPath(21, proteinGoal ? protein / proteinGoal : 0, "var(--color-terracotta)")}
        </svg>
        <div className="flex flex-col gap-1.5 text-sm">
          <div className="flex items-baseline gap-1.5">
            <span className="h-2 w-2 rounded-full bg-sage" />
            <span className="font-display text-xl font-semibold tabular-nums">
              {calories.toFixed(0)}
            </span>
            <span className="text-ink-muted">
              {calorieGoal ? `/ ${calorieGoal.toFixed(0)} kcal` : "kcal"}
            </span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="h-2 w-2 rounded-full bg-terracotta" />
            <span className="font-display text-xl font-semibold tabular-nums">
              {protein.toFixed(1)}
            </span>
            <span className="text-ink-muted">
              {proteinGoal ? `/ ${proteinGoal.toFixed(0)} g protein` : "g protein"}
            </span>
          </div>
        </div>
      </div>
      {(calorieGoal !== null || proteinGoal !== null) && (
        <div className="mt-3 flex items-center gap-4 border-t border-hairline pt-3 text-sm">
          {calorieGoal !== null && (
            <Remaining remaining={calorieGoal - calories} decimals={0} unit="kcal" color="sage" />
          )}
          {proteinGoal !== null && (
            <Remaining
              remaining={proteinGoal - protein}
              decimals={1}
              unit="g protein"
              color="terracotta"
            />
          )}
        </div>
      )}
    </div>
  );
}
