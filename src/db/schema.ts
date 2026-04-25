import {
  integer,
  real,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

export const teams = sqliteTable(
  "teams",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    icon: text("icon").notNull().default("Users"),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (table) => ({
    teamsNameUnique: uniqueIndex("teams_name_unique").on(table.name),
    teamsSlugUnique: uniqueIndex("teams_slug_unique").on(table.slug),
  }),
);

export const players = sqliteTable(
  "players",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    username: text("username").notNull(),
    displayName: text("display_name").notNull(),
    teamId: integer("team_id")
      .notNull()
      .references(() => teams.id, { onDelete: "restrict" }),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (table) => ({
    playersUsernameUnique: uniqueIndex("players_username_unique").on(
      table.username,
    ),
  }),
);

export const stepReports = sqliteTable("step_reports", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  teamId: integer("team_id")
    .notNull()
    .references(() => teams.id, { onDelete: "cascade" }),
  label: text("label").notNull(),
  startDate: text("start_date"),
  endDate: text("end_date"),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const playerStepSummaries = sqliteTable(
  "player_step_summaries",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    reportId: integer("report_id")
      .notNull()
      .references(() => stepReports.id, { onDelete: "cascade" }),
    playerId: integer("player_id")
      .notNull()
      .references(() => players.id, { onDelete: "cascade" }),
    rank: integer("rank"),
    totalSteps: integer("total_steps").notNull(),
    avgDailySteps: integer("avg_daily_steps").notNull(),
    dailyStepGoal: integer("daily_step_goal").notNull(),
    totalDistanceMi: real("total_distance_mi").notNull(),
    totalDistanceKm: real("total_distance_km").notNull(),
    avgDailyDistanceMi: real("avg_daily_distance_mi").notNull(),
    avgDailyDistanceKm: real("avg_daily_distance_km").notNull(),
  },
  (table) => ({
    reportPlayerUnique: uniqueIndex("summary_report_player_unique").on(
      table.reportId,
      table.playerId,
    ),
  }),
);

export const playerDailySteps = sqliteTable(
  "player_daily_steps",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    reportId: integer("report_id")
      .notNull()
      .references(() => stepReports.id, { onDelete: "cascade" }),
    playerId: integer("player_id")
      .notNull()
      .references(() => players.id, { onDelete: "cascade" }),
    stepDate: text("step_date").notNull(),
    steps: integer("steps"),
  },
  (table) => ({
    reportPlayerDateUnique: uniqueIndex("daily_report_player_date_unique").on(
      table.reportId,
      table.playerId,
      table.stepDate,
    ),
  }),
);

export const teamDailyScores = sqliteTable(
  "team_daily_scores",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    reportId: integer("report_id")
      .notNull()
      .references(() => stepReports.id, { onDelete: "cascade" }),
    teamId: integer("team_id")
      .notNull()
      .references(() => teams.id, { onDelete: "cascade" }),
    stepDate: text("step_date").notNull(),
    dayOfMonth: integer("day_of_month").notNull(),
    requiredSteps: integer("required_steps").notNull(),
    doubleMilestoneSteps: integer("double_milestone_steps").notNull(),
    teamSteps: integer("team_steps").notNull(),
    metRequirement: integer("met_requirement", { mode: "boolean" })
      .notNull()
      .default(false),
    hitDoubleMilestone: integer("hit_double_milestone", { mode: "boolean" })
      .notNull()
      .default(false),
    basePoints: integer("base_points").notNull().default(0),
    bonusPoints: integer("bonus_points").notNull().default(0),
    totalPoints: integer("total_points").notNull().default(0),
  },
  (table) => ({
    teamReportDateUnique: uniqueIndex("team_daily_score_report_date_unique").on(
      table.reportId,
      table.teamId,
      table.stepDate,
    ),
  }),
);

export const teamScoreSummaries = sqliteTable(
  "team_score_summaries",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    reportId: integer("report_id")
      .notNull()
      .references(() => stepReports.id, { onDelete: "cascade" }),
    teamId: integer("team_id")
      .notNull()
      .references(() => teams.id, { onDelete: "cascade" }),
    totalPoints: integer("total_points").notNull().default(0),
    daysMetRequirement: integer("days_met_requirement").notNull().default(0),
    daysHitDoubleMilestone: integer("days_hit_double_milestone")
      .notNull()
      .default(0),
  },
  (table) => ({
    reportTeamUnique: uniqueIndex("team_score_summary_report_team_unique").on(
      table.reportId,
      table.teamId,
    ),
  }),
);
