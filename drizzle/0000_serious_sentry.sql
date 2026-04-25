CREATE TABLE `player_daily_steps` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`report_id` integer NOT NULL,
	`player_id` integer NOT NULL,
	`step_date` text NOT NULL,
	`steps` integer,
	FOREIGN KEY (`report_id`) REFERENCES `step_reports`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`player_id`) REFERENCES `players`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `daily_report_player_date_unique` ON `player_daily_steps` (`report_id`,`player_id`,`step_date`);--> statement-breakpoint
CREATE TABLE `player_step_summaries` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`report_id` integer NOT NULL,
	`player_id` integer NOT NULL,
	`rank` integer,
	`total_steps` integer NOT NULL,
	`avg_daily_steps` integer NOT NULL,
	`daily_step_goal` integer NOT NULL,
	`total_distance_mi` real NOT NULL,
	`total_distance_km` real NOT NULL,
	`avg_daily_distance_mi` real NOT NULL,
	`avg_daily_distance_km` real NOT NULL,
	FOREIGN KEY (`report_id`) REFERENCES `step_reports`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`player_id`) REFERENCES `players`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `summary_report_player_unique` ON `player_step_summaries` (`report_id`,`player_id`);--> statement-breakpoint
CREATE TABLE `players` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`username` text NOT NULL,
	`display_name` text NOT NULL,
	`team_id` integer NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`team_id`) REFERENCES `teams`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE UNIQUE INDEX `players_username_unique` ON `players` (`username`);--> statement-breakpoint
CREATE TABLE `step_reports` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`team_id` integer NOT NULL,
	`label` text NOT NULL,
	`start_date` text,
	`end_date` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`team_id`) REFERENCES `teams`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `teams` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`icon` text DEFAULT 'Users' NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `teams_name_unique` ON `teams` (`name`);--> statement-breakpoint
CREATE UNIQUE INDEX `teams_slug_unique` ON `teams` (`slug`);