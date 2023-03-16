DROP VIEW IF EXISTS "v_user_camera";
DROP VIEW IF EXISTS "v_user_microphone";
DROP VIEW IF EXISTS "v_user_whiteboard";
DROP VIEW IF EXISTS "v_user_breakoutRoom";
DROP TABLE IF EXISTS "user_camera";
DROP TABLE IF EXISTS "user_microphone";
DROP TABLE IF EXISTS "user_whiteboard";
DROP TABLE IF EXISTS "user_breakoutRoom";
DROP TABLE IF EXISTS "user";

CREATE TABLE public."user" (
	"userId" varchar(50) NOT NULL PRIMARY KEY,
	"extId" varchar(50) NULL,
	"meetingId" varchar(100) NULL,
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

CREATE TABLE "user_microphone" (
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

CREATE INDEX "user_microphone_userId" ON "user_microphone"("userId");

CREATE OR REPLACE VIEW "v_user_microphone" AS
SELECT
	u."meetingId",
	"user_microphone" .*
FROM "user_microphone"
JOIN "user" u ON u."userId" = "user_microphone"."userId";

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
