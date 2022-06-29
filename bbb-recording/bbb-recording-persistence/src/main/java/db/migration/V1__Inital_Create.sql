CREATE DATABASE bbb;
\c bbb;

CREATE TABLE IF NOT EXISTS recording (
	id BIGSERIAL PRIMARY KEY,
	record_id VARCHAR(64),
	meeting_id VARCHAR(256),
	name VARCHAR(256),
	published BOOLEAN,
	participants INT,
	state VARCHAR(256),
	start_time timestamp,
	end_time timestamp,
	deleted_at timestamp,
	publish_updated BOOLEAN DEFAULT FALSE,
	protected BOOLEAN
);
CREATE UNIQUE INDEX index_recording_on_recording_id ON recording (record_id);
CREATE INDEX index_recording_on_meeting_id ON recording(meeting_id);

CREATE TABLE IF NOT EXISTS metadata (
	id BIGSERIAL PRIMARY KEY,
	recording_id BIGINT,
	key VARCHAR(256),
	value VARCHAR(256),
	CONSTRAINT fk_metadata_recording FOREIGN KEY(recording_id) REFERENCES recording(id)
);
CREATE UNIQUE INDEX index_metadata_on_recording_id_and_key ON metadata(recording_id, key);

CREATE TABLE IF NOT EXISTS playback_format (
	id BIGSERIAL PRIMARY KEY,
	recording_id BIGINT,
	format VARCHAR(64),
	url VARCHAR(256),
	length INT,
	processing_time INT,
	CONSTRAINT fk_playback_format_recording FOREIGN KEY (recording_id) REFERENCES recording(id)
);
CREATE UNIQUE INDEX index_playback_format_on_recording_id_and_format ON playback_format(recording_id, format);


CREATE TABLE IF NOT EXISTS thumbnail (
	id BIGSERIAL PRIMARY KEY,
	playback_format_id BIGINT,
	height INT,
	width INT,
	alt VARCHAR(256),
	url VARCHAR(256),
	sequence INT,
	CONSTRAINT fk_thumbnails_playback_format FOREIGN KEY (playback_format_id) REFERENCES playback_format(id)
);
CREATE INDEX index_thumbnail_on_playback_format_id ON thumbnail(playback_format_id);


CREATE TABLE IF NOT EXISTS callback_data (
	id BIGSERIAL PRIMARY KEY,
	recording_id BIGINT,
	meeting_id VARCHAR(256),
	callback_attributes TEXT,
	created_at timestamp NOT NULL,
	updated_at timestamp NOT NULL,
	CONSTRAINT fk_callback_data_recording FOREIGN KEY (recording_id) REFERENCES recording(id)
);

CREATE TABLE IF NOT EXISTS track (
    id BIGSERIAL PRIMARY KEY,
    recording_id BIGINT,
    href VARCHAR(256),
    kind VARCHAR(128),
    lang VARCHAR(128),
    label VARCHAR(128),
    original_name VARCHAR(256),
    temp_name VARCHAR(256),
    content_type VARCHAR(128),
    source VARCHAR(128),
    CONSTRAINT fk_track_recording FOREIGN KEY (recording_id) REFERENCES recording (id)
);

CREATE TABLE IF NOT EXISTS events (
    id BIGSERIAL PRIMARY KEY,
    recording_id BIGINT,
    content TEXT,
    CONSTRAINT fk_event_recording FOREIGN KEY (recording_id) REFERENCES recording (id)
);

CREATE OR REPLACE FUNCTION truncate_tables(username IN VARCHAR) RETURNS void AS $$
DECLARE
    statements CURSOR FOR
        SELECT tablename FROM pg_tables
        WHERE tableowner = username AND schemaname = 'public';
BEGIN
    FOR stmt IN statements LOOP
        EXECUTE 'TRUNCATE TABLE ' || quote_ident(stmt.tablename) || ' CASCADE;';
    END LOOP;
END;
$$ LANGUAGE plpgsql;