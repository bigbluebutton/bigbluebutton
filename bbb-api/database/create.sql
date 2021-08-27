DROP SCHEMA IF EXISTS `bbb`;
CREATE SCHEMA `bbb`;
USE `bbb`;

CREATE TABLE IF NOT EXISTS `bbb`.`recording` (
	`id` VARCHAR(64) NOT NULL,
	`meeting_id` VARCHAR(256) NOT NULL,
	`internal_meeting_id` VARCHAR(64) NOT NULL,
	`name` VARCHAR(256) NOT NULL,
	`is_breakout` BOOLEAN NOT NULL,
	`published` BOOLEAN NOT NULL,
	`state` VARCHAR(256) NOT NULL,
	`start_time` BIGINT NOT NULL,
	`end_time` BIGINT NOT NULL,
	`participants` INT NOT NULL,
	`raw_size` BIGINT NOT NULL,
	`size` BIGINT NOT NULL,
	PRIMARY KEY (`id`)
)
ENGINE=InnoDB
AUTO_INCREMENT = 1;

CREATE TABLE IF NOT EXISTS `bbb`.`recording_metadata` (
	`id` BIGINT NOT NULL AUTO_INCREMENT,
	`bbb_origin_version` VARCHAR(64) NOT NULL,
	`meeting_name` VARCHAR(256) NOT NULL,
	`meeting_id` VARCHAR(256) NOT NULL,
	`gl_listed` BOOLEAN NOT NULL,
	`bbb_origin` VARCHAR(256) NOT NULL,
	`is_breakout` BOOLEAN NOT NULL,
	`bbb_origin_server_name` VARCHAR(64) NOT NULL,
	`recording_id` VARCHAR(64),
	PRIMARY KEY (`id`),
	KEY `fk_metadata_recording` (`recording_id`),
	CONSTRAINT `fk_metadata_recording` FOREIGN KEY (`recording_id`) REFERENCES `recording` (`id`)
)
ENGINE=InnoDB
AUTO_INCREMENT = 1;

CREATE TABLE IF NOT EXISTS `bbb`.`playback` (
	`id` BIGINT NOT NULL AUTO_INCREMENT,
	`recording_id` VARCHAR(64) NOT NULL,
	PRIMARY KEY (`id`),
	KEY `fk_playback_recording` (`recording_id`),
	CONSTRAINT `fk_playback_recording` FOREIGN KEY (`recording_id`) REFERENCES `recording` (`id`)
)
ENGINE=InnoDB
AUTO_INCREMENT = 1;

CREATE TABLE IF NOT EXISTS `bbb`.`playback_format` (
	`id` BIGINT NOT NULL AUTO_INCREMENT,
	`type` VARCHAR(64) NOT NULL,
	`url` VARCHAR(256) NOT NULL,
	`processing_time` INT NOT NULL,
	`length` INT NOT NULL,
	`size` BIGINT NOT NULL,
	`playback_id` BIGINT,
	PRIMARY KEY (`id`),
	KEY `fk_playback_id` (`playback_id`),
	CONSTRAINT `fk_playback_id` FOREIGN KEY (`playback_id`) REFERENCES `playback` (`id`)
)
ENGINE=InnoDB
AUTO_INCREMENT = 1;

CREATE TABLE IF NOT EXISTS `bbb`.`playback_format_preview` (
	`id` BIGINT NOT NULL AUTO_INCREMENT,
	`format_id` BIGINT,
	PRIMARY KEY (`id`),
	KEY `fk_format_id` (`format_id`),
	CONSTRAINT `fk_format_id` FOREIGN KEY (`format_id`) REFERENCES `playback_format` (`id`)
)
ENGINE=InnoDB
AUTO_INCREMENT = 1;

CREATE TABLE IF NOT EXISTS `bbb`.`recording_image` (
	`id` BIGINT NOT NULL AUTO_INCREMENT,
	`alt` VARCHAR(256) NOT NULL,
	`height` INT NOT NULL,
	`width` INT NOT NULL,
	`src` VARCHAR(256) NOT NULL,
	`preview_id` BIGINT,
	PRIMARY KEY (`id`),
	KEY `fk_preview_id` (`preview_id`),
	CONSTRAINT `fk_preview_id` FOREIGN KEY (`preview_id`) REFERENCES `playback_format_preview` (`id`)
)
ENGINE=InnoDB
AUTO_INCREMENT = 1;	
	