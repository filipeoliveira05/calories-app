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
          <span className="font-display text-xl font-semibold">{calories.toFixed(0)}</span>
          <span className="text-ink-muted">
            {calorieGoal ? `/ ${calorieGoal.toFixed(0)} kcal` : "kcal"}
          </span>
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="h-2 w-2 rounded-full bg-terracotta" />
          <span className="font-display text-xl font-semibold">{protein.toFixed(1)}</span>
          <span className="text-ink-muted">
            {proteinGoal ? `/ ${proteinGoal.toFixed(0)} g protein` : "g protein"}
          </span>
        </div>
      </div>
    </div>
  );
}
