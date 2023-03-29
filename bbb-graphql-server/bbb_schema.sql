

-- ========== Meeting tables

drop table "meeting_breakout";
drop table "meeting_recording";
drop table "meeting_welcome";
drop table "meeting_voice";
drop table "meeting_users";
drop table "meeting_metadata";
drop table "meeting_lockSettings";
drop table "meeting_group";
drop table "meeting";

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


create table "meeting_recording" (
	"meetingId" 		varchar(100) primary key references "meeting"("meetingId") ON DELETE CASCADE,
	"record" boolean, 
	"autoStartRecording" boolean, 
	"allowStartStopRecording" boolean, 
	"keepEvents" boolean
);

create table "meeting_welcome" (
	"meetingId" 		varchar(100) primary key references "meeting"("meetingId") ON DELETE CASCADE,
	"welcomeMsgTemplate" text, 
	"welcomeMsg" text, 
	"modOnlyMessage" text
);

create table "meeting_voice" (
	"meetingId" 		varchar(100) primary key references "meeting"("meetingId") ON DELETE CASCADE,
	"telVoice" varchar(100), 
	"voiceConf" varchar(100), 
	"dialNumber" varchar(100), 
	"muteOnStart" boolean
);

create table "meeting_users" (
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

create table "meeting_metadata"(
	"meetingId" varchar(100) references "meeting"("meetingId") ON DELETE CASCADE,
	"name" varchar(255),
	"value" varchar(255),
	CONSTRAINT "meeting_metadata_pkey" PRIMARY KEY ("meetingId","name")
);

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

create table "meeting_group" (
	"meetingId"  varchar(100) references "meeting"("meetingId") ON DELETE CASCADE,
    "groupId"    varchar(100),
    "name"       varchar(100),
    "usersExtId" varchar[],
    CONSTRAINT "meeting_group_pkey" PRIMARY KEY ("meetingId","groupId")
);


-- ========== User tables

DROP VIEW IF EXISTS "v_user_camera";
DROP VIEW IF EXISTS "v_user_voice";
DROP VIEW IF EXISTS "v_user_whiteboard";
DROP VIEW IF EXISTS "v_user_breakoutRoom";
DROP TABLE IF EXISTS "user_camera";
DROP TABLE IF EXISTS "user_voice";
DROP TABLE IF EXISTS "user_whiteboard";
DROP TABLE IF EXISTS "user_breakoutRoom";
DROP TABLE IF EXISTS "user";

CREATE TABLE public."user" (
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

CREATE INDEX "user_meetingId" ON "user"("meetingId");

CREATE TABLE "user_voice" (
	"voiceUserId" varchar(100) PRIMARY KEY,
	"userId" varchar(50) NOT NULL REFERENCES "user"("userId") ON DELETE	CASCADE,
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

CREATE INDEX "user_voice_userId" ON "user_voice"("userId");

CREATE OR REPLACE VIEW "v_user_voice" AS
SELECT
	u."meetingId",
	"user_voice" .*
FROM "user_voice"
JOIN "user" u ON u."userId" = "user_voice"."userId";

CREATE TABLE "user_camera" (
	"streamId" varchar(100) PRIMARY KEY,
	"userId" varchar(50) NOT NULL REFERENCES "user"("userId") ON DELETE CASCADE
);

CREATE INDEX "user_camera_userId" ON "user_camera"("userId");

CREATE OR REPLACE VIEW "v_user_camera" AS
SELECT
	u."meetingId",
	"user_camera" .*
FROM "user_camera"
JOIN "user" u ON u."userId" = user_camera."userId";

CREATE TABLE "user_whiteboard" (
	"whiteboardId" varchar(100),
	"userId" varchar(50) REFERENCES "user"("userId") ON DELETE CASCADE,
	"changedModeOn" bigint,
	CONSTRAINT "user_whiteboard_pkey" PRIMARY KEY ("whiteboardId","userId")
);

CREATE INDEX "user_whiteboard_userId" ON "user_whiteboard"("userId");

CREATE OR REPLACE VIEW "v_user_whiteboard" AS
SELECT
	u."meetingId",
	"user_whiteboard" .*
FROM "user_whiteboard"
JOIN "user" u ON u."userId" = "user_whiteboard"."userId";

CREATE TABLE "user_breakoutRoom" (
	"userId" varchar(50) PRIMARY KEY REFERENCES "user"("userId") ON DELETE CASCADE,
	"breakoutRoomId" varchar(100),
	"isDefaultName" boolean,
	"sequence" int,
	"shortName" varchar(100),
	"online" boolean
);

CREATE OR REPLACE VIEW "v_user_breakoutRoom" AS
SELECT
	u."meetingId",
	"user_breakoutRoom" .*
FROM "user_breakoutRoom"
JOIN "user" u ON u."userId" = "user_breakoutRoom"."userId";

-- ===================== CHAT TABLES

DROP VIEW IF EXISTS "v_chat";
DROP VIEW IF EXISTS "v_chat_message_public";
DROP VIEW IF EXISTS "v_chat_message_private";
DROP TABLE IF EXISTS "chat_user";
DROP TABLE IF EXISTS "chat_message";
DROP TABLE IF EXISTS "chat";

CREATE TABLE "chat" (
	"chatId"  varchar(100),
	"meetingId" varchar(100) REFERENCES "meeting"("meetingId") ON DELETE CASCADE,
	"access" varchar(20),
	"createdBy" varchar(25),
	CONSTRAINT "chat_pkey" PRIMARY KEY ("chatId","meetingId")
);

CREATE INDEX "chat_meetingId" ON "chat"("meetingId");

CREATE TABLE "chat_user" (
	"chatId" varchar(100),
	"meetingId" varchar(100),
	"userId" varchar(100),
	"lastSeenAt" bigint,
	CONSTRAINT "chat_user_pkey" PRIMARY KEY ("chatId","meetingId","userId"),
    CONSTRAINT chat_fk FOREIGN KEY ("chatId", "meetingId") REFERENCES "chat"("chatId", "meetingId") ON DELETE CASCADE
);

CREATE INDEX "chat_user_chatId" ON "chat_user"("chatId","meetingId");

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

CREATE INDEX "chat_message_chatId" ON "chat_message"("chatId","meetingId");


CREATE OR REPLACE VIEW "v_chat" AS
SELECT 	cu."userId",
		chat."meetingId",
		chat."chatId",
		chat_with."userId" AS "participantId",
		count(DISTINCT cm."messageId") "totalMessages",
		sum(CASE WHEN cm."createdTime" > cu."lastSeenAt" THEN 1 ELSE 0 end) "totalUnread",
		CASE WHEN chat."access" = 'PUBLIC_ACCESS' THEN TRUE ELSE FALSE end public
FROM "user"
LEFT JOIN "chat_user" cu ON cu."meetingId" = "user"."meetingId" AND cu."userId" = "user"."userId"
JOIN "chat" ON cu."meetingId" = chat."meetingId" AND (cu."chatId" = chat."chatId" OR chat."chatId" = 'MAIN-PUBLIC-GROUP-CHAT')
LEFT JOIN "chat_user" chat_with ON chat_with."meetingId" = chat."meetingId" AND chat_with."chatId" = chat."chatId" AND chat."chatId" != 'MAIN-PUBLIC-GROUP-CHAT' AND chat_with."userId" != cu."userId"
LEFT JOIN chat_message cm ON cm."meetingId" = chat."meetingId" AND cm."chatId" = chat."chatId"
GROUP BY cu."userId", chat."meetingId", chat."chatId", chat_with."userId";


CREATE OR REPLACE VIEW "v_chat_message_public" AS
SELECT cm.*, to_timestamp("createdTime" / 1000) AS "createdTimeAsDate"
FROM chat_message cm
WHERE cm."chatId" = 'MAIN-PUBLIC-GROUP-CHAT';

CREATE OR REPLACE VIEW "v_chat_message_private" AS
SELECT cu."userId", cm.*, to_timestamp("createdTime" / 1000) AS "createdTimeAsDate"
FROM chat_message cm
JOIN chat_user cu ON cu."meetingId" = cm."meetingId" AND cu."chatId" = cm."chatId";





