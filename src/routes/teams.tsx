import { createFileRoute } from "@tanstack/react-router";
import * as LucideIcons from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { getTeamsWithPlayers } from "#/features/teams/get-teams-with-players.functions";

export const Route = createFileRoute("/teams")({
  loader: () => getTeamsWithPlayers(),
  component: TeamsPage,
});

function TeamsPage() {
  const teams = Route.useLoaderData();

  return (
    <main className="page-wrap px-4 py-12">
      <section className="island-shell rounded-2xl p-6 sm:p-8">
        <p className="island-kicker mb-2">Teams</p>
        <h1 className="display-title mb-3 text-4xl font-bold text-[var(--sea-ink)] sm:text-5xl">
          Teams and Players
        </h1>
        <p className="m-0 max-w-3xl text-base leading-8 text-[var(--sea-ink-soft)]">
          View each team with its current players from the database.
        </p>
      </section>

      <section className="mt-6 grid gap-4 md:grid-cols-2">
        {teams.map((team) => {
          const Icon =
            (LucideIcons[team.icon as keyof typeof LucideIcons] as
              | LucideIcon
              | undefined) ?? LucideIcons.Users;

          return (
            <article
              key={team.id}
              className="island-shell feature-card rounded-2xl p-5"
            >
              <div className="mb-4 flex items-center gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--line)] bg-[var(--card-bg)] text-[var(--lagoon-deep)]">
                  <Icon className="h-5 w-5" />
                </span>
                <div>
                  <h2 className="m-0 text-xl font-semibold text-[var(--sea-ink)]">
                    {team.name}
                  </h2>
                  <p className="m-0 text-xs uppercase tracking-[0.12em] text-[var(--sea-ink-soft)]">
                    {team.players.length} player
                    {team.players.length === 1 ? "" : "s"}
                  </p>
                </div>
              </div>

              {team.players.length > 0 ? (
                <div className="space-y-1.5">
                  {team.players.map((player) => (
                    <div
                      key={player.id}
                      className="rounded-lg border border-[var(--line)] bg-[var(--card-bg)] px-3 py-2 text-sm text-[var(--sea-ink)]"
                    >
                      {player.displayName}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="m-0 text-sm text-[var(--sea-ink-soft)]">
                  No players assigned.
                </p>
              )}
            </article>
          );
        })}
      </section>
    </main>
  );
}
