import { createFileRoute } from "@tanstack/react-router";
import {
  Trophy,
  Footprints,
  Star,
  Zap,
  Users,
  CalendarDays,
  BarChart3,
} from "lucide-react";

export const Route = createFileRoute("/about")({
  component: AboutPage,
});

function Section({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="island-shell rounded-2xl p-7 sm:p-9">
      <div className="mb-5 flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-(--lagoon-deep) text-white">
          <Icon size={20} />
        </span>
        <h2 className="m-0 text-xl font-bold text-(--sea-ink)">{title}</h2>
      </div>
      <div className="space-y-4 text-lg leading-8 text-(--sea-ink-soft)">
        {children}
      </div>
    </div>
  );
}

function AboutPage() {
  return (
    <main className="page-wrap px-4 py-16">
      {/* Hero */}
      <section className="island-shell mb-8 rounded-2xl p-6 sm:p-8">
        <p className="island-kicker mb-3">About</p>
        <h1 className="display-title mb-5 text-4xl font-bold text-(--sea-ink) sm:text-5xl">
          How Level 31 Works
        </h1>
        <p className="m-0 max-w-3xl text-lg leading-8 text-(--sea-ink-soft)">
          Level 31 is a team step-counting competition. Teams earn points each
          day based on how many steps their members take — hit the daily target
          to score base points, go further to earn bonus points.
        </p>
      </section>

      <div className="space-y-5">
        {/* How the competition works */}
        <Section icon={Users} title="The Competition">
          <p className="m-0">
            Players are divided into teams. Each day, everyone's steps are
            recorded. A team's daily step total is the combined steps of all its
            members.
          </p>
          <p className="m-0">
            The competition runs over a set period (typically a month). Points
            accumulate daily, and the team with the most points at the end wins.
          </p>
        </Section>

        {/* Points system */}
        <Section icon={Trophy} title="Points System">
          <p className="m-0">
            Points are awarded per team per day based on two thresholds:
          </p>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-(--line) bg-(--card-bg) p-5">
              <div className="mb-3 flex items-center gap-2">
                <Footprints className="h-5 w-5 text-(--lagoon-deep) sm:h-4 sm:w-4" />
                <span className="font-semibold text-(--sea-ink)">
                  Base Points — Daily Requirement
                </span>
              </div>
              <p className="m-0 text-base">
                If the team's combined steps reach{" "}
                <strong className="text-(--sea-ink)">day × 1,000</strong> (e.g.
                10,000 on day 10), they earn{" "}
                <strong className="text-(--sea-ink)">day × 100 points</strong>{" "}
                (e.g. 1,000 pts on day 10).
              </p>
            </div>

            <div className="rounded-xl border border-(--line) bg-(--card-bg) p-5">
              <div className="mb-3 flex items-center gap-2">
                <Star className="h-5 w-5 text-amber-500 sm:h-4 sm:w-4" />
                <span className="font-semibold text-(--sea-ink)">
                  Bonus Points — Double Milestone
                </span>
              </div>
              <p className="m-0 text-base">
                If the team's steps also reach{" "}
                <strong className="text-(--sea-ink)">day × 2,000</strong>{" "}
                (double the requirement), they earn an extra{" "}
                <strong className="text-(--sea-ink)">day × 75 bonus pts</strong>{" "}
                (e.g. 750 bonus pts on day 10).
              </p>
            </div>
          </div>

          <p className="m-0 mt-2">
            A team's{" "}
            <strong className="text-(--sea-ink)">total daily points</strong> =
            base points + bonus points. Both scale with the day number, so later
            days are worth more — day 1 is worth up to 175 pts, day 30 is worth
            up to 5,250 pts.
          </p>
        </Section>

        {/* Daily requirement explained */}
        <Section icon={Footprints} title="Daily Step Targets">
          <p className="m-0">
            Step targets and point values both scale with the{" "}
            <strong className="text-(--sea-ink)">day of the month</strong>. Day
            1 is a gentle warm-up; day 30 raises the stakes significantly.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full min-w-100 border-collapse text-base">
              <thead>
                <tr className="border-b border-(--line) text-left text-(--sea-ink-soft)">
                  <th className="pb-2 pr-4 font-semibold">Day</th>
                  <th className="pb-2 pr-4 font-semibold">Required steps</th>
                  <th className="pb-2 pr-4 font-semibold">Double milestone</th>
                  <th className="pb-2 pr-4 font-semibold">Base pts</th>
                  <th className="pb-2 font-semibold">Bonus pts</th>
                </tr>
              </thead>
              <tbody className="text-(--sea-ink)">
                {[1, 5, 10, 15, 20, 25, 30].map((d) => (
                  <tr key={d} className="border-b border-(--line)/50">
                    <td className="py-1.5 pr-4 font-medium">Day {d}</td>
                    <td className="py-1.5 pr-4">
                      {(d * 1000).toLocaleString()}
                    </td>
                    <td className="py-1.5 pr-4">
                      {(d * 2000).toLocaleString()}
                    </td>
                    <td className="py-1.5 pr-4 text-(--lagoon-deep) font-semibold">
                      {(d * 100).toLocaleString()}
                    </td>
                    <td className="py-1.5 text-amber-600 font-semibold">
                      +{(d * 75).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="rounded-xl bg-(--lagoon-deep)/10 p-5 text-base">
            <p className="m-0 font-semibold text-(--sea-ink)">Day 10 example</p>
            <ul className="mt-2 space-y-1 pl-4">
              <li>
                Steps &lt; 10,000 → <strong>0 pts</strong> (missed requirement)
              </li>
              <li>
                Steps ≥ 10,000 → <strong>1,000 pts</strong> (met requirement)
              </li>
              <li>
                Steps ≥ 20,000 → <strong>1,750 pts</strong> (1,000 base + 750
                bonus)
              </li>
            </ul>
          </div>
        </Section>

        {/* Reading the stats */}
        <Section icon={BarChart3} title="Reading the Stats">
          <p className="m-0">
            Throughout the app you'll see fractions like{" "}
            <strong className="text-(--sea-ink)">5 / 30</strong>. Here's what
            they mean:
          </p>
          <ul className="m-0 space-y-2 pl-4">
            <li>
              <strong className="text-(--sea-ink)">
                Days Met / Total Days
              </strong>{" "}
              — how many days out of the total competition days the team cleared
              the daily requirement.
            </li>
            <li>
              <strong className="text-(--sea-ink)">Bonuses / Total Days</strong>{" "}
              — how many days the team hit the double milestone.
            </li>
            <li>
              <strong className="text-(--sea-ink)">Steps X / Y req</strong> —
              the team's actual steps versus the day's required step target.
            </li>
          </ul>
        </Section>

        {/* Pages guide */}
        <Section icon={CalendarDays} title="Pages at a Glance">
          <ul className="m-0 space-y-4 pl-4">
            <li>
              <strong className="text-(--sea-ink)">Home</strong> — Shows the
              current week's daily results as cards. Each card shows how every
              team performed that day — steps, points, and whether they hit the
              milestones. Navigate to previous weeks using the week controls.
            </li>
            <li>
              <strong className="text-(--sea-ink)">Leaderboard</strong> —
              Overall standings for the competition period. Switch between the
              team view (total points, days met, bonuses) and the player view
              (individual steps and averages). Use the month selector to filter
              by period.
            </li>
            <li>
              <strong className="text-(--sea-ink)">Teams</strong> — Browse each
              team and its members.
            </li>
            <li>
              <strong className="text-(--sea-ink)">Scores</strong> — A detailed
              day-by-day breakdown of every team's raw score data: steps taken,
              points earned, and milestone status.
            </li>
          </ul>
        </Section>

        {/* Data freshness */}
        <Section icon={Zap} title="Data Updates">
          <p className="m-0">
            Step data is uploaded by an admin via CSV. The leaderboard shows a{" "}
            <strong className="text-(--sea-ink)">Last Updated</strong> timestamp
            so you always know how fresh the numbers are. Check back after each
            daily upload for the latest standings.
          </p>
        </Section>
      </div>
    </main>
  );
}
