CREATE TABLE `candidate` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text,
	`party_id` integer,
	`constituency_id` integer,
	`postal_votes` integer DEFAULT 0 NOT NULL,
	`evm_votes` integer DEFAULT 0 NOT NULL,
	`total_votes` integer DEFAULT 0 NOT NULL,
	`vote_percentage` real DEFAULT 100 NOT NULL,
	FOREIGN KEY (`party_id`) REFERENCES `party`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`constituency_id`) REFERENCES `constituency`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `constituency` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text,
	`code` text,
	`state_id` integer,
	FOREIGN KEY (`state_id`) REFERENCES `state`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `party` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text,
	`short_name` text
);
--> statement-breakpoint
CREATE TABLE `state` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`code` text,
	`name` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `state_code_unique` ON `state` (`code`);
