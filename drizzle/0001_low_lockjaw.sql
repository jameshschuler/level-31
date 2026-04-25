CREATE TABLE `team_daily_scores` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`report_id` integer NOT NULL,
	`team_id` integer NOT NULL,
	`step_date` text NOT NULL,
	`day_of_month` integer NOT NULL,
	`required_steps` integer NOT NULL,
	`double_milestone_steps` integer NOT NULL,
	`team_steps` integer NOT NULL,
	`met_requirement` integer DEFAULT false NOT NULL,
	`hit_double_milestone` integer DEFAULT false NOT NULL,
	`base_points` integer DEFAULT 0 NOT NULL,
	`bonus_points` integer DEFAULT 0 NOT NULL,
	`total_points` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`report_id`) REFERENCES `step_reports`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`team_id`) REFERENCES `teams`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `team_daily_score_report_date_unique` ON `team_daily_scores` (`report_id`,`team_id`,`step_date`);--> statement-breakpoint
CREATE TABLE `team_score_summaries` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`report_id` integer NOT NULL,
	`team_id` integer NOT NULL,
	`total_points` integer DEFAULT 0 NOT NULL,
	`days_met_requirement` integer DEFAULT 0 NOT NULL,
	`days_hit_double_milestone` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`report_id`) REFERENCES `step_reports`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`team_id`) REFERENCES `teams`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `team_score_summary_report_team_unique` ON `team_score_summaries` (`report_id`,`team_id`);