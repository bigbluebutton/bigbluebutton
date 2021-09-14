CREATE DATABASE IF NOT EXISTS bbb;
\c bbb;

CREATE TABLE IF NOT EXISTS recording (
	id VARCHAR(64) PRIMARY KEY,
	meeting_id VARCHAR(256) NOT NULL,
	internal_meeting_id VARCHAR(64) NOT NULL,
	name VARCHAR(256) NOT NULL,
	is_breakout BOOLEAN NOT NULL,
	published BOOLEAN NOT NULL,
	state VARCHAR(256) NOT NULL,
	start_time BIGINT NOT NULL,
	end_time BIGINT NOT NULL,
	participants INT NOT NULL,
	raw_size BIGINT NOT NULL,
	size BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS recording_metadata (
	id serial PRIMARY KEY,
	content xml NOT NULL,
	recording_id VARCHAR(64),
	FOREIGN KEY (recording_id) REFERENCES recording (id)
);

CREATE TABLE IF NOT EXISTS playback (
	id serial PRIMARY KEY,
	recording_id VARCHAR(64) NOT NULL,
	FOREIGN KEY (recording_id) REFERENCES recording (id)
);

CREATE TABLE IF NOT EXISTS playback_format (
	id serial PRIMARY KEY,
	type VARCHAR(64) NOT NULL,
	url VARCHAR(256) NOT NULL,
	processing_time INT NOT NULL,
	length INT NOT NULL,
	size BIGINT NOT NULL,
	playback_id BIGINT,
	FOREIGN KEY (playback_id) REFERENCES playback (id)
);

CREATE TABLE IF NOT EXISTS playback_format_preview (
	id serial PRIMARY KEY,
	format_id BIGINT,
	FOREIGN KEY (format_id) REFERENCES playback_format (id) 
);

CREATE TABLE IF NOT EXISTS recording_image (
	id serial PRIMARY KEY,
	alt VARCHAR(256) NOT NULL,
	height INT NOT NULL,
	width INT NOT NULL,
	src VARCHAR(256) NOT NULL,
	preview_id BIGINT,
	FOREIGN KEY (preview_id) REFERENCES playback_format_preview (id)
);	
	