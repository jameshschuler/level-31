import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import * as LucideIcons from "lucide-react";
import {
  getAvailableMonthsFn,
  getLastUpdatedFn,
  getTeamLeaderboardFn,
  getPlayerLeaderboardFn,
} from "#/features/leaderboard/get-leaderboard.functions";
import type {
  TeamLeaderboardRow,
  PlayerLeaderboardRow,
} from "#/features/leaderboard/get-team-leaderboard.server";

type LeaderboardSearch = { month?: string };

export const Route = createFileRoute("/leaderboard")({
  validateSearch: (search: Record<string, unknown>): LeaderboardSearch => ({
    month: typeof search.month === "string" ? search.month : undefined,
  }),
  loader: async ({ location }) => {
    const month =
      typeof location.search === "object" &&
      "month" in location.search &&
      typeof (location.search as LeaderboardSearch).month === "string"
        ? (location.search as LeaderboardSearch).month
        : undefined;
    const [availableMonths, teams, players, lastUpdated] = await Promise.all([
      getAvailableMonthsFn(),
      getTeamLeaderboardFn({ data: month }),
      getPlayerLeaderboardFn({ data: month }),
      getLastUpdatedFn(),
    ]);
    return {
      availableMonths,
      teams,
      players,
      selectedMonth: month,
      lastUpdated,
    };
  },
  component: LeaderboardPage,
});

type Tab = "teams" | "players";

function DynamicIcon({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  const icons = LucideIcons as unknown as Record<
    string,
    React.ComponentType<{ className?: string }>
  >;
  const Icon = icons[name] ?? icons["Users"];
  return <Icon className={className} />;
}

function TeamLeaderboard({ rows }: { rows: TeamLeaderboardRow[] }) {
  if (rows.length === 0) {
    return (
      <p className="text-sm text-(--sea-ink-soft)">
        No team score data yet. Upload a CSV to populate the leaderboard.
      </p>
    );
  }

  return (
    <>
      <div className="space-y-4 sm:hidden">
        {rows.map((row, idx) => (
          <article
            key={row.teamId}
            className="rounded-xl border border-(--line) bg-(--card-bg) p-5"
          >
            <div className="mb-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-(--line) bg-(--card-bg)">
                  <DynamicIcon
                    name={row.teamIcon}
                    className="h-4 w-4 text-(--lagoon-deep)"
                  />
                </div>
                <div>
                  <p className="m-0 text-sm font-semibold uppercase tracking-wide text-(--sea-ink-soft)">
                    #{idx + 1}
                  </p>
                  <p className="m-0 text-base font-semibold text-(--sea-ink)">
                    {row.teamName}
                  </p>
                </div>
              </div>
              <p className="m-0 text-base font-semibold text-(--lagoon-deep)">
                {row.totalPoints.toLocaleString()} pts
              </p>
            </div>

            <div className="grid grid-cols-2 gap-x-3 gap-y-2 text-sm text-(--sea-ink-soft)">
              <p className="m-0">Days Met</p>
              <p className="m-0 text-right text-(--sea-ink)">
                {row.daysMetRequirement}/{row.totalDays}
              </p>
              <p className="m-0">Bonuses</p>
              <p className="m-0 text-right text-(--sea-ink)">
                {row.daysHitDoubleMilestone}/{row.totalDays}
              </p>
              <p className="m-0">Total Steps</p>
              <p className="m-0 text-right text-(--sea-ink)">
                {row.totalSteps.toLocaleString()}
              </p>
            </div>
          </article>
        ))}
      </div>

      <div className="hidden overflow-x-auto sm:block">
        <table className="min-w-[680px] w-full text-base">
          <thead>
            <tr className="border-b border-(--line) text-left text-sm font-semibold uppercase tracking-wide text-(--sea-ink-soft)">
              <th className="pb-4 pr-4">#</th>
              <th className="pb-4 pr-6">Team</th>
              <th className="pb-4 pr-6 text-right">Points</th>
              <th className="pb-4 pr-6 text-right">Days Met</th>
              <th className="pb-4 pr-6 text-right">Bonuses</th>
              <th className="pb-4 text-right">Total Steps</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-(--line)">
            {rows.map((row, idx) => (
              <tr key={row.teamId} className="group">
                <td className="py-4 pr-4 font-semibold text-(--sea-ink-soft)">
                  {idx + 1}
                </td>
                <td className="py-4 pr-6">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-(--line) bg-(--card-bg)">
                      <DynamicIcon
                        name={row.teamIcon}
                        className="h-4 w-4 text-(--lagoon-deep)"
                      />
                    </div>
                    <span className="font-semibold text-(--sea-ink)">
                      {row.teamName}
                    </span>
                  </div>
                </td>
                <td className="py-4 pr-6 text-right font-semibold text-(--lagoon-deep)">
                  {row.totalPoints.toLocaleString()}
                </td>
                <td className="py-4 pr-6 text-right text-(--sea-ink)">
                  <span className="font-semibold">
                    {row.daysMetRequirement}
                  </span>
                  <span className="text-(--sea-ink-soft)">
                    /{row.totalDays}
                  </span>
                </td>
                <td className="py-4 pr-6 text-right text-(--sea-ink)">
                  <span className="font-semibold">
                    {row.daysHitDoubleMilestone}
                  </span>
                  <span className="text-(--sea-ink-soft)">
                    /{row.totalDays}
                  </span>
                </td>
                <td className="py-4 text-right text-(--sea-ink-soft)">
                  {row.totalSteps.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function PlayerLeaderboard({ rows }: { rows: PlayerLeaderboardRow[] }) {
  const [expanded, setExpanded] = useState<number | null>(null);

  if (rows.length === 0) {
    return (
      <p className="text-sm text-(--sea-ink-soft)">
        No player step data yet. Upload a CSV to populate the leaderboard.
      </p>
    );
  }

  const allDates = Array.from(
    new Set(rows.flatMap((r) => r.dailySteps.map((d) => d.stepDate))),
  ).sort();

  return (
    <>
      <div className="space-y-4 sm:hidden">
        {rows.map((row, idx) => {
          const isExpanded = expanded === row.playerId;
          const stepMap = new Map(
            row.dailySteps.map((d) => [d.stepDate, d.steps]),
          );

          return (
            <article
              key={row.playerId}
              className="rounded-xl border border-(--line) bg-(--card-bg) p-5"
            >
              <div className="mb-3 flex items-start justify-between gap-3">
                <div>
                  <p className="m-0 text-sm font-semibold uppercase tracking-wide text-(--sea-ink-soft)">
                    #{idx + 1}
                  </p>
                  <p className="m-0 text-base font-semibold text-(--sea-ink)">
                    {row.playerName}
                  </p>
                </div>
                <p className="m-0 text-base font-semibold text-(--lagoon-deep)">
                  {row.totalSteps.toLocaleString()}
                </p>
              </div>

              <div className="mb-3 flex items-center gap-2 text-sm text-(--sea-ink-soft)">
                <div className="flex h-6 w-6 items-center justify-center rounded-md border border-(--line) bg-(--card-bg)">
                  <DynamicIcon
                    name={row.teamIcon}
                    className="h-3.5 w-3.5 text-(--lagoon-deep)"
                  />
                </div>
                <span>{row.teamName}</span>
                <span className="ml-auto text-(--sea-ink)">
                  Avg {row.avgDailySteps.toLocaleString()}/day
                </span>
              </div>

              {row.dailySteps.length > 0 && (
                <div>
                  <button
                    onClick={() =>
                      setExpanded(isExpanded ? null : row.playerId)
                    }
                    className="rounded-lg border border-(--line) px-2.5 py-1 text-xs font-semibold text-(--lagoon-deep) transition hover:bg-[rgba(79,184,178,0.1)]"
                  >
                    {isExpanded ? "Hide" : `Show ${row.dailySteps.length} days`}
                  </button>

                  {isExpanded && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {allDates
                        .filter((d) => stepMap.has(d))
                        .map((date) => (
                          <div
                            key={date}
                            className="rounded-lg border border-(--line) bg-(--card-bg) px-2.5 py-1 text-center"
                          >
                            <p className="m-0 text-[10px] font-semibold text-(--sea-ink-soft)">
                              {date.slice(5)}
                            </p>
                            <p className="m-0 text-xs font-semibold text-(--sea-ink)">
                              {(stepMap.get(date) ?? 0).toLocaleString()}
                            </p>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              )}
            </article>
          );
        })}
      </div>

      <div className="hidden overflow-x-auto sm:block">
        <table className="min-w-[780px] w-full text-base">
          <thead>
            <tr className="border-b border-(--line) text-left text-sm font-semibold uppercase tracking-wide text-(--sea-ink-soft)">
              <th className="pb-4 pr-4">#</th>
              <th className="pb-4 pr-6">Player</th>
              <th className="pb-4 pr-6">Team</th>
              <th className="pb-4 pr-6 text-right">Total Steps</th>
              <th className="pb-4 pr-6 text-right">Avg / Day</th>
              <th className="pb-4 text-right">Daily Log</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-(--line)">
            {rows.map((row, idx) => {
              const isExpanded = expanded === row.playerId;
              const stepMap = new Map(
                row.dailySteps.map((d) => [d.stepDate, d.steps]),
              );
              return (
                <>
                  <tr key={row.playerId}>
                    <td className="py-4 pr-4 font-semibold text-(--sea-ink-soft)">
                      {idx + 1}
                    </td>
                    <td className="py-4 pr-6">
                      <span className="font-semibold text-(--sea-ink)">
                        {row.playerName}
                      </span>
                    </td>
                    <td className="py-4 pr-6">
                      <div className="flex items-center gap-2">
                        <div className="flex h-6 w-6 items-center justify-center rounded-md border border-(--line) bg-(--card-bg)">
                          <DynamicIcon
                            name={row.teamIcon}
                            className="h-3.5 w-3.5 text-(--lagoon-deep)"
                          />
                        </div>
                        <span className="text-(--sea-ink-soft)">
                          {row.teamName}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 pr-6 text-right font-semibold text-(--lagoon-deep)">
                      {row.totalSteps.toLocaleString()}
                    </td>
                    <td className="py-4 pr-6 text-right text-(--sea-ink)">
                      {row.avgDailySteps.toLocaleString()}
                    </td>
                    <td className="py-4 text-right">
                      {row.dailySteps.length > 0 && (
                        <button
                          onClick={() =>
                            setExpanded(isExpanded ? null : row.playerId)
                          }
                          className="rounded-lg border border-(--line) px-2.5 py-1 text-xs font-semibold text-(--lagoon-deep) transition hover:bg-[rgba(79,184,178,0.1)]"
                        >
                          {isExpanded
                            ? "Hide"
                            : `${row.dailySteps.length} days`}
                        </button>
                      )}
                    </td>
                  </tr>
                  {isExpanded && (
                    <tr key={`${row.playerId}-daily`}>
                      <td
                        colSpan={6}
                        className="bg-[rgba(79,184,178,0.04)] px-4 pb-3 pt-1"
                      >
                        <div className="flex flex-wrap gap-2">
                          {allDates
                            .filter((d) => stepMap.has(d))
                            .map((date) => (
                              <div
                                key={date}
                                className="rounded-lg border border-(--line) bg-(--card-bg) px-3 py-1.5 text-center"
                              >
                                <p className="m-0 text-[10px] font-semibold text-(--sea-ink-soft)">
                                  {date.slice(5)}
                                </p>
                                <p className="m-0 text-sm font-semibold text-(--sea-ink)">
                                  {(stepMap.get(date) ?? 0).toLocaleString()}
                                </p>
                              </div>
                            ))}
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}

function MonthLabel(month: string): string {
  const [year, m] = month.split("-");
  const date = new Date(Number(year), Number(m) - 1, 1);
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

function LeaderboardPage() {
  const { teams, players, availableMonths, selectedMonth, lastUpdated } =
    Route.useLoaderData();
  const [activeTab, setActiveTab] = useState<Tab>("teams");
  const navigate = useNavigate({ from: "/leaderboard" });

  const currentMonth = selectedMonth ?? availableMonths[0];

  function handleMonthChange(month: string) {
    void navigate({
      search: (prev) => ({ ...prev, month: month || undefined }),
    });
  }

  return (
    <main className="page-wrap px-4 pb-16 pt-14">
      <section className="island-shell rounded-2xl p-6 sm:p-8">
        <p className="island-kicker mb-3">Rankings</p>
        <h1 className="display-title mb-5 text-4xl font-bold text-(--sea-ink) sm:text-5xl">
          Leaderboard
        </h1>
        <p className="m-0 max-w-2xl text-lg leading-8 text-(--sea-ink-soft)">
          Team and player standings based on uploaded step reports.
        </p>
        {lastUpdated && (
          <p className="m-0 mt-4 text-sm text-(--sea-ink-soft)">
            Last updated{" "}
            {new Date(lastUpdated).toLocaleString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
              hour: "numeric",
              minute: "2-digit",
            })}
          </p>
        )}
      </section>

      <section className="island-shell mt-8 rounded-2xl p-6 sm:p-8">
        {/* Month selector + Tabs row */}
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-(--line) pb-0">
          <div className="flex w-full gap-2 sm:w-auto">
            {(["teams", "players"] as Tab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={[
                  "relative -mb-px flex-1 rounded-t-lg border border-b-0 px-4 py-2.5 text-sm font-semibold capitalize transition sm:flex-none sm:px-5",
                  activeTab === tab
                    ? "border-(--line) bg-(--card-bg) text-(--lagoon-deep)"
                    : "border-transparent text-(--sea-ink-soft) hover:text-(--sea-ink)",
                ].join(" ")}
              >
                {tab === "teams" ? "Teams" : "Players"}
              </button>
            ))}
          </div>

          {availableMonths.length > 0 && (
            <div className="mb-1 flex w-full gap-2 overflow-x-auto pb-1 sm:w-auto sm:flex-wrap sm:overflow-visible sm:pb-0">
              {availableMonths.map((m: string) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => handleMonthChange(m)}
                  className={[
                    "shrink-0 rounded-full border px-4 py-1.5 text-sm font-semibold whitespace-nowrap transition hover:-translate-y-0.5",
                    (currentMonth ?? "") === m
                      ? "border-(--lagoon-deep)/40 bg-(--lagoon-deep)/10 text-(--lagoon-deep)"
                      : "border-(--line) bg-transparent text-(--sea-ink-soft) hover:text-(--sea-ink)",
                  ].join(" ")}
                >
                  {MonthLabel(m)}
                </button>
              ))}
            </div>
          )}
        </div>

        {activeTab === "teams" ? (
          <TeamLeaderboard rows={teams} />
        ) : (
          <PlayerLeaderboard rows={players} />
        )}
      </section>
    </main>
  );
}
