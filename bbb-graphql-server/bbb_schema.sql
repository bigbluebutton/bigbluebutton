DROP VIEW IF EXISTS "v_pres_annotation_curr";
DROP VIEW IF EXISTS "v_pres_annotation_history_curr";
DROP VIEW IF EXISTS "v_pres_page_cursor";
DROP VIEW IF EXISTS "v_pres_page_writers";
DROP TABLE IF EXISTS "pres_annotation_history";
DROP TABLE IF EXISTS "pres_annotation";
DROP TABLE IF EXISTS "pres_page_cursor";
DROP TABLE IF EXISTS "pres_page_writers";
DROP TABLE IF EXISTS "pres_page";
DROP TABLE IF EXISTS "pres_presentation";

DROP VIEW IF EXISTS "v_chat";
DROP VIEW IF EXISTS "v_chat_message_public";
DROP VIEW IF EXISTS "v_chat_message_private";
DROP VIEW IF EXISTS "v_chat_participant";
DROP TABLE IF EXISTS "chat_user";
DROP TABLE IF EXISTS "chat_message";
DROP TABLE IF EXISTS "chat";

DROP VIEW IF EXISTS "v_user_camera";
DROP VIEW IF EXISTS "v_user_voice";
--DROP VIEW IF EXISTS "v_user_whiteboard";
DROP VIEW IF EXISTS "v_user_breakoutRoom";
DROP VIEW IF EXISTS "v_user";
DROP VIEW IF EXISTS "v_user_ref";
DROP TABLE IF EXISTS "user_camera";
DROP TABLE IF EXISTS "user_voice";
--DROP TABLE IF EXISTS "user_whiteboard";
DROP TABLE IF EXISTS "user_breakoutRoom";
DROP TABLE IF EXISTS "user";

drop view if exists "v_meeting_lockSettings";
drop table if exists "meeting_breakout";
drop table if exists "meeting_recording";
drop table if exists "meeting_welcome";
drop table if exists "meeting_voice";
drop table if exists "meeting_users";
drop table if exists "meeting_metadata";
drop table if exists "meeting_lockSettings";
drop table if exists "meeting_group";
drop table if exists "meeting";

-- ========== Meeting tables


create table "meeting" (
	"meetingId"	varchar(100) primary key,
	"extId" 	varchar(100),
	"name" varchar(100),
	"isBreakout" boolean,
	"disabledFeatures" varchar[],
	"meetingCameraCap" integer,
	"maxPinnedCameras" integer,
	"notifyRecordingIsOn" boolean,
	"presentationUploadExternalDescription" text,
	"presentationUploadExternalUrl" varchar(500),
	"learningDashboardAccessToken" varchar(100),
	"html5InstanceId" varchar(100),
	"createdTime" bigint,
	"duration" integer
);

create table "meeting_breakout" (
	"meetingId" 		varchar(100) primary key references "meeting"("meetingId") ON DELETE CASCADE,
    "parentId"           varchar(100),
    "sequence"           integer,
    "freeJoin"           boolean,
    "breakoutRooms"      varchar[],
    "record"             boolean,
    "privateChatEnabled" boolean,
    "captureNotes"       boolean,
    "captureSlides"      boolean,
    "captureNotesFilename" varchar(100),
    "captureSlidesFilename" varchar(100)
);
create index "idx_meeting_breakout_meetingId" on "meeting_breakout"("meetingId");

create table "meeting_recording" (
	"meetingId" 		varchar(100) primary key references "meeting"("meetingId") ON DELETE CASCADE,
	"record" boolean, 
	"autoStartRecording" boolean, 
	"allowStartStopRecording" boolean, 
	"keepEvents" boolean
);
create index "idx_meeting_recording_meetingId" on "meeting_recording"("meetingId");

create table "meeting_welcome" (
	"meetingId" 		varchar(100) primary key references "meeting"("meetingId") ON DELETE CASCADE,
	"welcomeMsgTemplate" text, 
	"welcomeMsg" text, 
	"modOnlyMessage" text
);
create index "idx_meeting_welcome_meetingId" on "meeting_welcome"("meetingId");

create table "meeting_voice" (
	"meetingId" 		varchar(100) primary key references "meeting"("meetingId") ON DELETE CASCADE,
	"telVoice" varchar(100), 
	"voiceConf" varchar(100), 
	"dialNumber" varchar(100), 
	"muteOnStart" boolean
);
create index "idx_meeting_voice_meetingId" on "meeting_voice"("meetingId");

create table "meeting_usersPolicies" (
	"meetingId" 		varchar(100) primary key references "meeting"("meetingId") ON DELETE CASCADE,
    "maxUsers"                 integer,
    "maxUserConcurrentAccesses" integer,
    "webcamsOnlyForModerator"  boolean,
    "userCameraCap"            integer,
    "guestPolicy"              varchar(100),
    "meetingLayout"            varchar(100),
    "allowModsToUnmuteUsers"   boolean,
    "allowModsToEjectCameras"  boolean,
    "authenticatedGuest"       boolean
);
create index "idx_meeting_usersPolicies_meetingId" on "meeting_usersPolicies"("meetingId");

CREATE OR REPLACE VIEW "v_meeting_usersPolicies" AS SELECT * FROM "meeting_usersPolicies";

create table "meeting_metadata"(
	"meetingId" varchar(100) references "meeting"("meetingId") ON DELETE CASCADE,
	"name" varchar(255),
	"value" varchar(255),
	CONSTRAINT "meeting_metadata_pkey" PRIMARY KEY ("meetingId","name")
);
create index "idx_meeting_metadata_meetingId" on "meeting_metadata"("meetingId");

create table "meeting_lockSettings" (
	"meetingId" 		varchar(100) primary key references "meeting"("meetingId") ON DELETE CASCADE,
    "disableCam"             boolean,
    "disableMic"             boolean,
    "disablePrivateChat"     boolean,
    "disablePublicChat"      boolean,
    "disableNotes"           boolean,
    "hideUserList"           boolean,
    "lockOnJoin"             boolean,
    "lockOnJoinConfigurable" boolean,
    "hideViewersCursor"      boolean
);
create index "idx_meeting_lockSettings_meetingId" on "meeting_lockSettings"("meetingId");

CREATE OR REPLACE VIEW "v_meeting_lockSettings" AS
SELECT
	mls."meetingId",
	mls."disableCam",
	mls."disableMic",
	mls."disablePrivateChat",
	mls."disablePublicChat",
	mls."disableNotes",
	mls."hideUserList",
	mls."hideViewersCursor",
	mu."webcamsOnlyForModerator",
	CASE WHEN
	mls."disableCam" IS TRUE THEN TRUE
	WHEN mls."disableMic"  IS TRUE THEN TRUE
	WHEN mls."disablePrivateChat"  IS TRUE THEN TRUE
	WHEN mls."disablePublicChat"  IS TRUE THEN TRUE
	WHEN mls."disableNotes"  IS TRUE THEN TRUE
	WHEN mls."hideUserList"  IS TRUE THEN TRUE
	WHEN mls."hideViewersCursor"  IS TRUE THEN TRUE
	WHEN mu."webcamsOnlyForModerator"  IS TRUE THEN TRUE
	ELSE FALSE
	END "hasActiveLockSetting"
FROM meeting m
JOIN "meeting_lockSettings" mls ON mls."meetingId" = m."meetingId"
JOIN meeting_users mu ON mu."meetingId" = m."meetingId";

create table "meeting_group" (
	"meetingId"  varchar(100) references "meeting"("meetingId") ON DELETE CASCADE,
    "groupId"    varchar(100),
    "name"       varchar(100),
    "usersExtId" varchar[],
    CONSTRAINT "meeting_group_pkey" PRIMARY KEY ("meetingId","groupId")
);
create index "idx_meeting_group_meetingId" on "meeting_group"("meetingId");


-- ========== User tables


CREATE TABLE "user" (
	"userId" varchar(50) NOT NULL PRIMARY KEY,
	"extId" varchar(50) NULL,
	"meetingId" varchar(100) NULL references "meeting"("meetingId") ON DELETE CASCADE,
	"name" varchar(255) NULL,
	"avatar" varchar(500) NULL,
	"color" varchar(7) NULL,
	"emoji" varchar,
	"guest" bool NULL,
	"guestStatus" varchar(50),
	"mobile" bool NULL,
	"clientType" varchar(50),
--	"excludeFromDashboard" bool NULL,
	"role" varchar(20) NULL,
	"authed" bool NULL,
	"joined" bool NULL,
	"leftFlag" bool NULL,
--	"ejected" bool null,
--	"ejectReason" varchar(255),
	"banned" bool NULL,
	"loggedOut" bool NULL,
	"registeredOn" bigint NULL,
	"presenter" bool NULL,
	"pinned" bool NULL,
	"locked" bool NULL
);
CREATE INDEX "idx_user_meetingId" ON "user"("meetingId");

--Virtual columns isModerator and isOnline
--ALTER TABLE "user" ADD COLUMN "isModerator" boolean GENERATED ALWAYS AS (CASE WHEN "role" = 'MODERATOR' THEN true ELSE false END) STORED;
--ALTER TABLE "user" ADD COLUMN "isOnline" boolean GENERATED ALWAYS AS (CASE WHEN "joined" IS true AND "loggedOut" IS false THEN true ELSE false END) STORED;

CREATE OR REPLACE VIEW "v_user"
AS SELECT "user"."userId",
    "user"."extId",
    "user"."meetingId",
    "user"."name",
    "user"."avatar",
    "user"."color",
    "user"."emoji",
    "user"."guest",
    "user"."guestStatus",
    "user"."mobile",
    "user"."clientType",
    "user"."role",
    "user"."authed",
    "user"."joined",
    "user"."leftFlag",
    "user"."banned",
    "user"."loggedOut",
    "user"."registeredOn",
    "user"."presenter",
    "user"."pinned",
    "user"."locked",
    CASE WHEN "user"."role" = 'MODERATOR' THEN true ELSE false END "isModerator",
    CASE WHEN "user"."joined" IS true AND "user"."loggedOut" IS false THEN true ELSE false END "isOnline"
   FROM "user"
  WHERE "user"."loggedOut" IS FALSE
  AND "user".joined IS TRUE;
CREATE INDEX "idx_v_user_meetingId" ON "user"("meetingId") where "user"."loggedOut" IS FALSE and "user".joined IS TRUE;

--v_user_ref will be used only as foreign key (not possible to fetch this table directly through graphql)
--it is necessary because v_user has some conditions like "lockSettings-hideUserList"
--but viewers still needs to query this users as foreign key of chat, cameras, etc
CREATE OR REPLACE VIEW "v_user_ref"
AS SELECT "user"."userId",
    "user"."extId",
    "user"."meetingId",
    "user"."name",
    "user"."avatar",
    "user"."color",
    "user"."emoji",
    "user"."guest",
    "user"."guestStatus",
    "user"."mobile",
    "user"."clientType",
    "user"."role",
    "user"."authed",
    "user"."joined",
    "user"."leftFlag",
    "user"."banned",
    "user"."loggedOut",
    "user"."registeredOn",
    "user"."presenter",
    "user"."pinned",
    "user"."locked",
    CASE WHEN "user"."role" = 'MODERATOR' THEN true ELSE false END "isModerator",
    CASE WHEN "user"."joined" IS true AND "user"."loggedOut" IS false THEN true ELSE false END "isOnline"
   FROM "user";

CREATE TABLE "user_voice" (
	"userId" varchar(50) PRIMARY KEY NOT NULL REFERENCES "user"("userId") ON DELETE	CASCADE,
	"voiceUserId" varchar(100),
	"callerName" varchar(100),
	"callerNum" varchar(100),
	"callingWith" varchar(100),
	"joined" boolean NULL,
	"listenOnly" boolean NULL,
	"muted" boolean NULL,
	"spoke" boolean NULL,
	"talking" boolean NULL,
	"floor" boolean NULL,
	"lastFloorTime" varchar(25),
	"voiceConf" varchar(100),
	"color" varchar(7),
	"endTime" bigint NULL,
	"startTime" bigint NULL
);
--CREATE INDEX "idx_user_voice_userId" ON "user_voice"("userId");

CREATE OR REPLACE VIEW "v_user_voice" AS
SELECT
	u."meetingId",
	"user_voice" .*,
	greatest(coalesce(user_voice."startTime", 0), coalesce(user_voice."endTime", 0)) AS "lastSpeakChangedAt"
FROM "user_voice"
JOIN "user" u ON u."userId" = "user_voice"."userId";

CREATE TABLE "user_camera" (
	"streamId" varchar(100) PRIMARY KEY,
	"userId" varchar(50) NOT NULL REFERENCES "user"("userId") ON DELETE CASCADE
);
CREATE INDEX "idx_user_camera_userId" ON "user_camera"("userId");

CREATE OR REPLACE VIEW "v_user_camera" AS
SELECT
	u."meetingId",
	"user_camera" .*
FROM "user_camera"
JOIN "user" u ON u."userId" = user_camera."userId";

CREATE TABLE "user_breakoutRoom" (
	"userId" varchar(50) PRIMARY KEY REFERENCES "user"("userId") ON DELETE CASCADE,
	"breakoutRoomId" varchar(100),
	"isDefaultName" boolean,
	"sequence" int,
	"shortName" varchar(100),
	"currentlyInRoom" boolean
);
--CREATE INDEX "idx_user_breakoutRoom_userId" ON "user_breakoutRoom"("userId");

CREATE OR REPLACE VIEW "v_user_breakoutRoom" AS
SELECT
	u."meetingId",
	"user_breakoutRoom" .*
FROM "user_breakoutRoom"
JOIN "user" u ON u."userId" = "user_breakoutRoom"."userId";

CREATE TABLE "user_connectionStatus" (
	"userId" varchar(50) PRIMARY KEY REFERENCES "user"("userId") ON DELETE CASCADE,
	"meetingId" varchar(100) REFERENCES meeting("meetingId"),
	"status" varchar(15),
	"statusUpdatedAt" timestamp,
	"connectionAliveAt" timestamp
);
create index "idx_user_connectionStatus_meetingId" on "user_connectionStatus"("meetingId");

--CREATE OR REPLACE VIEW "v_user_connectionStatus" AS
--SELECT u."meetingId", u."userId", uc.status, uc."statusUpdatedAt", uc."connectionAliveAt",
--CASE WHEN "statusUpdatedAt" < current_timestamp - INTERVAL '20 seconds' THEN TRUE ELSE FALSE END AS "clientNotResponding"
--FROM "user" u
--LEFT JOIN "user_connectionStatus" uc ON uc."userId" = u."userId";

-- ===================== CHAT TABLES


CREATE TABLE "chat" (
	"chatId"  varchar(100),
	"meetingId" varchar(100) REFERENCES "meeting"("meetingId") ON DELETE CASCADE,
	"access" varchar(20),
	"createdBy" varchar(25),
	CONSTRAINT "chat_pkey" PRIMARY KEY ("chatId","meetingId")
);
CREATE INDEX "idx_chat_meetingId" ON "chat"("meetingId");

CREATE TABLE "chat_user" (
	"chatId" varchar(100),
	"meetingId" varchar(100),
	"userId" varchar(50),
	"lastSeenAt" bigint,
	"typingAt"   timestamp,
	CONSTRAINT "chat_user_pkey" PRIMARY KEY ("chatId","meetingId","userId"),
    CONSTRAINT chat_fk FOREIGN KEY ("chatId", "meetingId") REFERENCES "chat"("chatId", "meetingId") ON DELETE CASCADE
);
CREATE INDEX "idx_chat_user_chatId" ON "chat_user"("chatId","meetingId");

CREATE OR REPLACE VIEW "v_user_typing_public" AS
SELECT "meetingId", "chatId", "userId", "typingAt",
CASE WHEN "typingAt" > current_timestamp - INTERVAL '5 seconds' THEN true ELSE false END AS "isCurrentlyTyping"
FROM chat_user
WHERE "chatId" = 'MAIN-PUBLIC-GROUP-CHAT';


CREATE TABLE "chat_message" (
	"messageId" varchar(100) PRIMARY KEY,
	"chatId" varchar(100),
	"meetingId" varchar(100),
	"correlationId" varchar(100),
	"createdTime" bigint,
	"chatEmphasizedText" boolean,
	"message" TEXT,
    "senderId" varchar(100),
    "senderName" varchar(255),
	"senderRole" varchar(20),
    CONSTRAINT chat_fk FOREIGN KEY ("chatId", "meetingId") REFERENCES "chat"("chatId", "meetingId") ON DELETE CASCADE
);
CREATE INDEX "idx_chat_message_chatId" ON "chat_message"("chatId","meetingId");

CREATE OR REPLACE VIEW "v_chat" AS
SELECT 	"user"."userId",
		chat."meetingId",
		chat."chatId",
		chat_with."userId" AS "participantId",
		count(DISTINCT cm."messageId") "totalMessages",
		sum(CASE WHEN cm."senderId" != "user"."userId" and cm."createdTime" > coalesce(cu."lastSeenAt",0) THEN 1 ELSE 0 end) "totalUnread",
		CASE WHEN chat."access" = 'PUBLIC_ACCESS' THEN true ELSE false end public
FROM "user"
LEFT JOIN "chat_user" cu ON cu."meetingId" = "user"."meetingId" AND cu."userId" = "user"."userId"
--now it will always add chat_user for public chat onUserJoin
--JOIN "chat" ON "user"."meetingId" = chat."meetingId" AND (cu."chatId" = chat."chatId" OR chat."chatId" = 'MAIN-PUBLIC-GROUP-CHAT')
JOIN "chat" ON "user"."meetingId" = chat."meetingId" AND cu."chatId" = chat."chatId"
LEFT JOIN "chat_user" chat_with ON chat_with."meetingId" = chat."meetingId" AND chat_with."chatId" = chat."chatId" AND chat."chatId" != 'MAIN-PUBLIC-GROUP-CHAT' AND chat_with."userId" != cu."userId"
LEFT JOIN chat_message cm ON cm."meetingId" = chat."meetingId" AND cm."chatId" = chat."chatId"
GROUP BY "user"."userId", chat."meetingId", chat."chatId", chat_with."userId";

CREATE OR REPLACE VIEW "v_chat_message_public" AS
SELECT cm.*, to_timestamp("createdTime" / 1000) AS "createdTimeAsDate"
FROM chat_message cm
WHERE cm."chatId" = 'MAIN-PUBLIC-GROUP-CHAT';

CREATE OR REPLACE VIEW "v_chat_message_private" AS
SELECT cu."userId", cm.*, to_timestamp("createdTime" / 1000) AS "createdTimeAsDate"
FROM chat_message cm
JOIN chat_user cu ON cu."meetingId" = cm."meetingId" AND cu."chatId" = cm."chatId";



--============ Presentation / Annotation


CREATE TABLE "pres_presentation" (
	"presentationId" varchar(100) PRIMARY KEY,
	"meetingId" varchar(100) REFERENCES "meeting"("meetingId") ON DELETE CASCADE,
	"current" boolean,
	"downloadable" boolean,
	"removable" boolean
);
CREATE INDEX "idx_pres_presentation_meetingId" ON "pres_presentation"("meetingId");

CREATE TABLE "pres_page" (
	"pageId" varchar(100) PRIMARY KEY,
	"presentationId" varchar(100) REFERENCES "pres_presentation"("presentationId") ON DELETE CASCADE,
	"num" integer,
	"urls" TEXT,
	"current" boolean,
	"xOffset" NUMERIC,
	"yOffset" NUMERIC,
	"widthRatio" NUMERIC,
	"heightRatio" NUMERIC
);
CREATE INDEX "idx_pres_page_presentationId" ON "pres_page"("presentationId");

CREATE TABLE "pres_annotation" (
	"annotationId" varchar(100) PRIMARY KEY,
	"pageId" varchar(100) REFERENCES "pres_page"("pageId") ON DELETE CASCADE,
	"userId" varchar(50),
	"annotationInfo" TEXT,
	"lastHistorySequence" integer,
	"lastUpdatedAt" timestamp DEFAULT now()
);
CREATE INDEX "idx_pres_annotation_pageId" ON "pres_annotation"("pageId");
CREATE INDEX "idx_pres_annotation_updatedAt" ON "pres_annotation"("pageId","lastUpdatedAt");

CREATE TABLE "pres_annotation_history" (
	"sequence" serial PRIMARY KEY,
	"annotationId" varchar(100),
	"pageId" varchar(100) REFERENCES "pres_page"("pageId") ON DELETE CASCADE,
	"userId" varchar(50),
	"annotationInfo" TEXT
--	"lastUpdatedAt" timestamp DEFAULT now()
);
CREATE INDEX "idx_pres_annotation_history_pageId" ON "pres_annotation"("pageId");

CREATE VIEW "v_pres_annotation_curr" AS
SELECT p."meetingId", pp."presentationId", pa.*
FROM pres_presentation p
JOIN pres_page pp ON pp."presentationId" = p."presentationId"
JOIN pres_annotation pa ON pa."pageId" = pp."pageId"
WHERE p."current" IS true
AND pp."current" IS true;

CREATE VIEW "v_pres_annotation_history_curr" AS
SELECT p."meetingId", pp."presentationId", pah.*
FROM pres_presentation p
JOIN pres_page pp ON pp."presentationId" = p."presentationId"
JOIN pres_annotation_history pah ON pah."pageId" = pp."pageId"
WHERE p."current" IS true
AND pp."current" IS true;

CREATE TABLE "pres_page_writers" (
	"pageId" varchar(100)  REFERENCES "pres_page"("pageId") ON DELETE CASCADE,
    "userId" varchar(50) REFERENCES "user"("userId") ON DELETE CASCADE,
    "changedModeOn" bigint,
    CONSTRAINT "pres_page_writers_pkey" PRIMARY KEY ("pageId","userId")
);
create index "idx_pres_page_writers_userID" on "pres_page_writers"("userId");

CREATE OR REPLACE VIEW "v_pres_page_writers" AS
SELECT
	u."meetingId",
	"pres_presentation"."presentationId",
	"pres_page_writers" .*,
	CASE WHEN pres_presentation."current" IS true AND pres_page."current" IS true THEN true ELSE false END AS "isCurrentPage"
FROM "pres_page_writers"
JOIN "user" u ON u."userId" = "pres_page_writers"."userId"
JOIN "pres_page" ON "pres_page"."pageId" = "pres_page_writers"."pageId"
JOIN "pres_presentation" ON "pres_presentation"."presentationId"  = "pres_page"."presentationId" ;

CREATE TABLE "pres_page_cursor" (
	"pageId" varchar(100)  REFERENCES "pres_page"("pageId") ON DELETE CASCADE,
    "userId" varchar(50) REFERENCES "user"("userId") ON DELETE CASCADE,
    "xPercent" numeric,
    "yPercent" numeric,
    "lastUpdatedAt" timestamp DEFAULT now(),
    CONSTRAINT "pres_page_cursor_pkey" PRIMARY KEY ("pageId","userId")
);
create index "idx_pres_page_cursor_pageId" on "pres_page_cursor"("pageId");
create index "idx_pres_page_cursor_userID" on "pres_page_cursor"("userId");
create index "idx_pres_page_cursor_lastUpdatedAt" on "pres_page_cursor"("pageId","lastUpdatedAt");

CREATE VIEW "v_pres_page_cursor" AS
SELECT pres_presentation."meetingId", pres_page."presentationId", c.*,
        CASE WHEN pres_presentation."current" IS true AND pres_page."current" IS true THEN true ELSE false END AS "isCurrentPage"
FROM pres_page_cursor c
JOIN pres_page ON pres_page."pageId" = c."pageId"
JOIN pres_presentation ON pres_presentation."presentationId" = pres_page."presentationId";

--
--CREATE TABLE whiteboard (
--	"whiteboardId" varchar(100) PRIMARY KEY,
--	"meetingId" varchar(100) REFERENCES "meeting"("meetingId") ON DELETE CASCADE
--);
--
--CREATE TABLE whiteboard_annotation (
--	"annotationId" varchar(100) PRIMARY KEY,
--	"whiteboardId" varchar(100) REFERENCES "whiteboard"("whiteboardId") ON DELETE CASCADE,
--	"userId" varchar(50),
--	"annotationInfo" TEXT,
--	"lastUpdatedAt" timestamp DEFAULT now()
--);