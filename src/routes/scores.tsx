import { createFileRoute } from "@tanstack/react-router";
import { getTeamDailyScores } from "#/features/scores/get-team-daily-scores.functions";

export const Route = createFileRoute("/scores")({
  loader: () => getTeamDailyScores(),
  component: ScoresPage,
});

function ScoresPage() {
  const dailyScores = Route.useLoaderData();

  return (
    <main className="page-wrap px-4 py-16">
      <section className="island-shell rounded-2xl p-6 sm:p-8">
        <p className="island-kicker mb-3">Scores</p>
        <h1 className="display-title mb-5 text-4xl font-bold text-(--sea-ink) sm:text-5xl">
          Team Daily Score Results
        </h1>
        <p className="m-0 max-w-3xl text-lg leading-8 text-(--sea-ink-soft)">
          Daily points for each team from uploaded CSV scoring runs.
        </p>
      </section>

      {dailyScores.length === 0 ? (
        <section className="island-shell mt-8 rounded-2xl p-6">
          <p className="m-0 text-base text-(--sea-ink-soft)">
            No score data yet. Upload a CSV to generate daily score results.
          </p>
        </section>
      ) : (
        <section className="mt-8 space-y-5">
          {dailyScores.map((day) => (
            <article
              key={day.stepDate}
              className="island-shell rounded-2xl p-6"
            >
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <h2 className="m-0 text-lg font-semibold text-(--sea-ink)">
                  {day.stepDate}
                </h2>
                <span className="text-sm font-semibold tracking-[0.12em] text-(--sea-ink-soft) uppercase">
                  {day.rows.length} team{day.rows.length === 1 ? "" : "s"}
                </span>
              </div>

              <div className="space-y-3 sm:hidden">
                {day.rows.map((row) => (
                  <div
                    key={`${day.stepDate}-${row.teamId}`}
                    className="rounded-xl border border-(--line)/70 bg-white/70 p-4"
                  >
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <p className="m-0 text-base font-semibold text-(--sea-ink)">
                        {row.teamName}
                      </p>
                      <p className="m-0 text-base font-semibold text-(--lagoon-deep)">
                        {row.totalPoints} pts
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-sm text-(--sea-ink-soft)">
                      <p className="m-0">Steps</p>
                      <p className="m-0 text-right">
                        {row.teamSteps.toLocaleString()}
                      </p>
                      <p className="m-0">Required</p>
                      <p className="m-0 text-right">
                        {row.requiredSteps.toLocaleString()}
                      </p>
                      <p className="m-0">Bonus Required</p>
                      <p className="m-0 text-right">
                        {row.doubleMilestoneSteps.toLocaleString()}
                      </p>
                      <p className="m-0">Base / Bonus</p>
                      <p className="m-0 text-right">
                        {row.basePoints} / {row.bonusPoints}
                      </p>
                      <p className="m-0">Milestones</p>
                      <p className="m-0 text-right">
                        {row.metRequirement ? "Met" : "Missed"}
                        {row.hitDoubleMilestone ? " + Double" : ""}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="-mx-1 hidden overflow-x-auto px-1 sm:block">
                <table className="w-full min-w-175 border-collapse text-base">
                  <thead>
                    <tr className="border-b border-(--line) text-left text-(--sea-ink-soft)">
                      <th className="px-3 py-3 font-semibold">Team</th>
                      <th className="px-3 py-3 font-semibold">Steps</th>
                      <th className="px-3 py-3 font-semibold">Required</th>
                      <th className="px-3 py-3 font-semibold">
                        Bonus Required
                      </th>
                      <th className="px-3 py-3 font-semibold">Base</th>
                      <th className="px-3 py-3 font-semibold">Bonus</th>
                      <th className="px-3 py-3 font-semibold">Total</th>
                      <th className="px-3 py-3 font-semibold">Milestones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {day.rows.map((row) => (
                      <tr
                        key={`${day.stepDate}-${row.teamId}`}
                        className="border-b border-(--line)/60"
                      >
                        <td className="px-3 py-3 text-(--sea-ink)">
                          {row.teamName}
                        </td>
                        <td className="px-3 py-3 text-(--sea-ink-soft)">
                          {row.teamSteps.toLocaleString()}
                        </td>
                        <td className="px-3 py-3 text-(--sea-ink-soft)">
                          {row.requiredSteps.toLocaleString()}
                        </td>
                        <td className="px-3 py-3 text-(--sea-ink-soft)">
                          {row.doubleMilestoneSteps.toLocaleString()}
                        </td>
                        <td className="px-3 py-3 text-(--sea-ink-soft)">
                          {row.basePoints}
                        </td>
                        <td className="px-3 py-3 text-(--sea-ink-soft)">
                          {row.bonusPoints}
                        </td>
                        <td className="px-3 py-3 font-semibold text-(--lagoon-deep)">
                          {row.totalPoints}
                        </td>
                        <td className="px-3 py-3 text-(--sea-ink-soft)">
                          {row.metRequirement ? "Met" : "Missed"}
                          {row.hitDoubleMilestone ? " + Double" : ""}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}
