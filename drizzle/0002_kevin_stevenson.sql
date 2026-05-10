INSERT INTO `players` (`username`, `display_name`, `team_id`, `created_at`, `updated_at`)
SELECT 'kevinstevensonbirds', 'Kevin Stevenson', `id`, (unixepoch() * 1000), (unixepoch() * 1000)
FROM `teams`
WHERE `slug` = 'birds';
--> statement-breakpoint
INSERT INTO `players` (`username`, `display_name`, `team_id`, `created_at`, `updated_at`)
SELECT 'kevinstevensoncats', 'Kevin Stevenson', `id`, (unixepoch() * 1000), (unixepoch() * 1000)
FROM `teams`
WHERE `slug` = 'cats';
--> statement-breakpoint
INSERT INTO `players` (`username`, `display_name`, `team_id`, `created_at`, `updated_at`)
SELECT 'kevinstevensonrabbits', 'Kevin Stevenson', `id`, (unixepoch() * 1000), (unixepoch() * 1000)
FROM `teams`
WHERE `slug` = 'rabbits';
--> statement-breakpoint
INSERT INTO `players` (`username`, `display_name`, `team_id`, `created_at`, `updated_at`)
SELECT 'kevinstevensondogs', 'Kevin Stevenson', `id`, (unixepoch() * 1000), (unixepoch() * 1000)
FROM `teams`
WHERE `slug` = 'dogs';
--> statement-breakpoint
INSERT INTO `players` (`username`, `display_name`, `team_id`, `created_at`, `updated_at`)
SELECT 'kevinstevensonpandas', 'Kevin Stevenson', `id`, (unixepoch() * 1000), (unixepoch() * 1000)
FROM `teams`
WHERE `slug` = 'pandas';