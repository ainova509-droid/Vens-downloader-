CREATE TABLE `downloads` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`videoUrl` text NOT NULL,
	`filename` varchar(255) NOT NULL,
	`s3Key` varchar(255),
	`s3Url` text,
	`status` enum('pending','completed','failed') NOT NULL DEFAULT 'pending',
	`errorMessage` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`expiresAt` timestamp,
	CONSTRAINT `downloads_id` PRIMARY KEY(`id`)
);
