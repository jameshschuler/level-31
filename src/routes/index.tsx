import { createFileRoute, useNavigate } from "@tanstack/react-router";
import * as LucideIcons from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { getTeamDailyScores } from "#/features/scores/get-team-daily-scores.functions";

type DayCard = {
  stepDate: string;
  label: string;
  isToday: boolean;
  rows: Array<{
    teamId: number;
    teamName: string;
    teamIcon: string;
    teamSteps: number;
    requiredSteps: number;
    doubleMilestoneSteps: number;
    totalPoints: number;
    basePoints: number;
    bonusPoints: number;
    metRequirement: boolean;
    hitDoubleMilestone: boolean;
  }>;
};

export const Route = createFileRoute("/")({
  validateSearch: (search: Record<string, unknown>) => ({
    week: typeof search.week === "string" ? search.week : undefined,
  }),
  loader: async () => {
    const dailyScores = await getTeamDailyScores();
    return { dailyScores };
  },
  component: HomePage,
});

function formatIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function startOfWeekMonday(date: Date): Date {
  const result = new Date(date);
  const day = result.getDay();
  const offset = day === 0 ? -6 : 1 - day;
  result.setDate(result.getDate() + offset);
  result.setHours(0, 0, 0, 0);
  return result;
}

function parseIsoDate(value: string): Date | null {
  const [yearString, monthString, dayString] = value.split("-");
  const year = Number(yearString);
  const month = Number(monthString);
  const day = Number(dayString);

  if (
    !Number.isInteger(year) ||
    !Number.isInteger(month) ||
    !Number.isInteger(day)
  ) {
    return null;
  }

  const date = new Date(year, month - 1, day);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  date.setHours(0, 0, 0, 0);
  return date;
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function TeamIcon({ iconName }: { iconName: string }) {
  const Icon =
    (LucideIcons[iconName as keyof typeof LucideIcons] as
      | LucideIcon
      | undefined) ?? LucideIcons.Users;
  return <Icon className="h-4 w-4" />;
}

function HomePage() {
  const { dailyScores } = Route.useLoaderData();
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/" });
  const today = new Date();
  const currentWeekStart = startOfWeekMonday(today);
  const defaultWeekStart = currentWeekStart;
  const requestedWeekDate = search.week ? parseIsoDate(search.week) : null;
  const weekStart = requestedWeekDate
    ? startOfWeekMonday(requestedWeekDate)
    : defaultWeekStart;
  const weekEnd = addDays(weekStart, 6);
  const isCurrentWeek =
    formatIsoDate(weekStart) === formatIsoDate(currentWeekStart);
  const todayIso = formatIsoDate(today);

  const scoresByDate = new Map(
    dailyScores.map((day) => [day.stepDate, day.rows]),
  );

  const dayCards: DayCard[] = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + index);
    const stepDate = formatIsoDate(date);
    return {
      stepDate,
      label: date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      }),
      isToday: stepDate === todayIso,
      rows: scoresByDate.get(stepDate) ?? [],
    };
  });

  function setWeek(date: Date) {
    const monday = startOfWeekMonday(date);
    const mondayIso = formatIsoDate(monday);
    const defaultMondayIso = formatIsoDate(defaultWeekStart);

    void navigate({
      search: (prev) => ({
        ...prev,
        week: mondayIso === defaultMondayIso ? undefined : mondayIso,
      }),
    });
  }

  return (
    <main className="px-4 pb-16 pt-14">
      <section className="page-wrap island-shell rounded-2xl p-6 sm:p-8">
        <p className="island-kicker mb-3">Weekly Snapshot</p>
        <h1 className="display-title mb-5 text-4xl font-bold text-(--sea-ink) sm:text-5xl">
          Level 31 Week View
        </h1>
        <p className="m-0 max-w-3xl text-lg leading-8 text-(--sea-ink-soft)">
          Daily team performance for the selected week.
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => setWeek(addDays(weekStart, -7))}
            className="w-full rounded-full border border-(--line) bg-(--input-bg) px-4 py-2.5 text-sm font-semibold text-(--sea-ink) transition hover:-translate-y-0.5 sm:w-auto"
          >
            Previous Week
          </button>
          <button
            type="button"
            onClick={() => setWeek(addDays(weekStart, 7))}
            disabled={isCurrentWeek}
            className="w-full rounded-full border border-(--line) bg-(--input-bg) px-4 py-2.5 text-sm font-semibold text-(--sea-ink) transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
          >
            Next Week
          </button>
          <button
            type="button"
            onClick={() => setWeek(currentWeekStart)}
            disabled={isCurrentWeek}
            className="w-full rounded-full border border-[rgba(50,143,151,0.3)] bg-[rgba(79,184,178,0.14)] px-4 py-2.5 text-sm font-semibold text-(--lagoon-deep) transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
          >
            Current Week
          </button>
          <p className="m-0 w-full text-sm text-(--sea-ink-soft) sm:w-auto">
            {weekStart.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}
            {" - "}
            {weekEnd.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        </div>
      </section>

      <section className="mx-auto mt-8 grid w-full max-w-screen-2xl gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {dayCards.map((day) => (
          <article
            key={day.stepDate}
            className={[
              "island-shell rounded-2xl p-5 sm:p-6",
              day.isToday ? "ring-2 ring-[rgba(79,184,178,0.4)]" : "",
            ].join(" ")}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="m-0 text-base font-semibold uppercase tracking-wide text-(--sea-ink-soft)">
                {day.label}
              </h2>
              {day.isToday ? (
                <span className="rounded-full bg-[rgba(79,184,178,0.2)] px-2 py-0.5 text-xs font-semibold text-(--lagoon-deep)">
                  Today
                </span>
              ) : null}
            </div>

            {day.rows.length === 0 ? (
              <p className="m-0 text-base text-(--sea-ink-soft)">
                No scores logged.
              </p>
            ) : (
              <div className="space-y-3.5">
                {day.rows.map((row, rank) => (
                  <div
                    key={`${day.stepDate}-${row.teamId}`}
                    className="rounded-xl border border-(--line) bg-(--card-bg) px-4 py-3"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex h-6 w-6 items-center justify-center rounded-md border border-(--line) bg-(--card-bg) text-(--lagoon-deep)">
                          <TeamIcon iconName={row.teamIcon} />
                        </span>
                        <p className="m-0 text-base font-semibold text-(--sea-ink)">
                          {rank + 1}. {row.teamName}
                        </p>
                      </div>
                      <p className="m-0 text-base font-semibold text-(--lagoon-deep)">
                        {row.totalPoints} pts
                      </p>
                    </div>
                    <p className="m-0 mt-2 text-sm text-(--sea-ink-soft)">
                      Steps {row.teamSteps.toLocaleString()} /{" "}
                      {row.requiredSteps.toLocaleString()} req
                    </p>
                    <p className="m-0 text-sm leading-6 text-(--sea-ink-soft)">
                      Bonus {row.teamSteps.toLocaleString()} /{" "}
                      {row.doubleMilestoneSteps.toLocaleString()} double (
                      {row.hitDoubleMilestone ? "Hit" : "Miss"})
                    </p>
                  </div>
                ))}
              </div>
            )}
          </article>
        ))}
      </section>
    </main>
  );
}
