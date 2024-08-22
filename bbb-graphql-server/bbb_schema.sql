--unaccent will be used to create nameSortable
CREATE EXTENSION IF NOT EXISTS unaccent;
CREATE OR REPLACE FUNCTION immutable_lower_unaccent(text)
				RETURNS text AS $$
				SELECT lower(unaccent('unaccent', $1))
				$$ LANGUAGE SQL IMMUTABLE;

--remove_emojis will be used to create nameSortable
CREATE OR REPLACE FUNCTION remove_emojis(text) RETURNS text AS $$
DECLARE
    input_string ALIAS FOR $1;
    output_string text;
BEGIN
    output_string := regexp_replace(input_string, '[^\u0000-\uFFFF]', '', 'g');
    RETURN output_string;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

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
	"loginUrl" varchar(500),
	"logoutUrl" varchar(500),
	"customLogoUrl" varchar(500),
    "customDarkLogoUrl" varchar(500),
	"bannerText" text,
	"bannerColor" varchar(50),
	"createdTime" bigint,
	"durationInSeconds" integer,
	"endWhenNoModerator"        boolean,
    "endWhenNoModeratorDelayInMinutes" integer,
	"endedAt" timestamp with time zone,
	"endedReasonCode" varchar(200),
	"endedBy" varchar(50)
);
ALTER TABLE "meeting" ADD COLUMN "createdAt" timestamp with time zone GENERATED ALWAYS AS (to_timestamp("createdTime"::double precision / 1000)) STORED;
ALTER TABLE "meeting" ADD COLUMN "ended" boolean GENERATED ALWAYS AS ("endedAt" is not null) STORED;

create index "idx_meeting_extId" on "meeting"("extId");

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
create view "v_meeting_breakoutPolicies" as select * from meeting_breakout;

create table "meeting_recordingPolicies" (
	"meetingId" 		varchar(100) primary key references "meeting"("meetingId") ON DELETE CASCADE,
	"record" boolean,
	"autoStartRecording" boolean,
	"allowStartStopRecording" boolean,
	"keepEvents" boolean
);
create view "v_meeting_recordingPolicies" as select * from "meeting_recordingPolicies";

create table "meeting_recording" (
	"meetingId" varchar(100) references "meeting"("meetingId") ON DELETE CASCADE,
    "startedAt" timestamp with time zone,
    "startedBy" varchar(50),
    "stoppedAt" timestamp with time zone,
    "stoppedBy" varchar(50),
    "recordedTimeInSeconds" integer,
    CONSTRAINT "meeting_recording_pkey" PRIMARY KEY ("meetingId","startedAt")
);
create index "idx_meeting_recording_meetingId" on "meeting_recording"("meetingId");

--Set recordedTimeInSeconds when stoppedAt is updated
CREATE OR REPLACE FUNCTION "update_meeting_recording_trigger_func"() RETURNS TRIGGER AS $$
BEGIN
    NEW."recordedTimeInSeconds" := CASE WHEN NEW."startedAt" IS NULL OR NEW."stoppedAt" IS NULL THEN 0
                                    ELSE EXTRACT(EPOCH FROM (NEW."stoppedAt" - NEW."startedAt"))
                                    END;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "update_meeting_recording_trigger" BEFORE UPDATE OF "stoppedAt" ON "meeting_recording"
    FOR EACH ROW EXECUTE FUNCTION "update_meeting_recording_trigger_func"();


--ALTER TABLE "meeting_recording" ADD COLUMN "recordedTimeInSeconds" integer GENERATED ALWAYS AS
--(CASE WHEN "startedAt" IS NULL OR "stoppedAt" IS NULL THEN 0 ELSE EXTRACT(EPOCH FROM ("stoppedAt" - "startedAt")) END) STORED;

CREATE VIEW v_meeting_recording AS
SELECT r.*,
CASE
    WHEN "startedAt" IS NULL THEN false
    WHEN "stoppedAt" IS NULL THEN true
    ELSE "startedAt" > "stoppedAt"
END AS "isRecording"
FROM (
	select "meetingId",
	(array_agg("startedAt" ORDER BY "startedAt" DESC))[1] as "startedAt",
	(array_agg("startedBy" ORDER BY "startedAt" DESC))[1] as "startedBy",
	(array_agg("stoppedAt" ORDER BY "startedAt" DESC))[1] as "stoppedAt",
	(array_agg("stoppedBy" ORDER BY "startedAt" DESC))[1] as "stoppedBy",
    coalesce(sum("recordedTimeInSeconds"),0) "previousRecordedTimeInSeconds"
	from "meeting_recording"
	GROUP BY "meetingId"
) r;

create table "meeting_welcome" (
	"meetingId" varchar(100) primary key references "meeting"("meetingId") ON DELETE CASCADE,
	"welcomeMsg" text,
	"welcomeMsgForModerators" text
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
create view "v_meeting_voiceSettings" as select * from meeting_voice;

create table "meeting_usersPolicies" (
	"meetingId" 		varchar(100) primary key references "meeting"("meetingId") ON DELETE CASCADE,
    "maxUsers"                     integer,
    "maxUserConcurrentAccesses"    integer,
    "webcamsOnlyForModerator"      boolean,
    "userCameraCap"                integer,
    "guestPolicy"                  varchar(100),
    "guestLobbyMessage"            text,
    "meetingLayout"                varchar(100),
    "allowModsToUnmuteUsers"       boolean,
    "allowModsToEjectCameras"      boolean,
    "authenticatedGuest"           boolean,
    "allowPromoteGuestToModerator" boolean
);
create index "idx_meeting_usersPolicies_meetingId" on "meeting_usersPolicies"("meetingId");

CREATE OR REPLACE VIEW "v_meeting_usersPolicies" AS
SELECT "meeting_usersPolicies"."meetingId",
    "meeting_usersPolicies"."maxUsers",
    "meeting_usersPolicies"."maxUserConcurrentAccesses",
    "meeting_usersPolicies"."webcamsOnlyForModerator",
    "meeting_usersPolicies"."userCameraCap",
    "meeting_usersPolicies"."guestPolicy",
    "meeting_usersPolicies"."guestLobbyMessage",
    "meeting_usersPolicies"."meetingLayout",
    "meeting_usersPolicies"."allowModsToUnmuteUsers",
    "meeting_usersPolicies"."allowModsToEjectCameras",
    "meeting_usersPolicies"."authenticatedGuest",
    "meeting_usersPolicies"."allowPromoteGuestToModerator",
    "meeting"."isBreakout" is false "moderatorsCanMuteAudio",
    "meeting"."isBreakout" is false and "meeting_usersPolicies"."allowModsToUnmuteUsers" is true "moderatorsCanUnmuteAudio"
   FROM "meeting_usersPolicies"
   JOIN "meeting" using("meetingId");

create table "meeting_metadata" (
	"meetingId" 		varchar(100) references "meeting"("meetingId") ON DELETE CASCADE,
    "name"              varchar(100),
    "value"             varchar(100),
    CONSTRAINT "meeting_metadata_pkey" PRIMARY KEY ("meetingId","name")
);
create index "idx_meeting_metadata_meetingId" on "meeting_metadata"("meetingId");

CREATE OR REPLACE VIEW "v_meeting_metadata" AS
SELECT "meeting_metadata"."meetingId",
    "meeting_metadata"."name",
    "meeting_metadata"."value"
   FROM "meeting_metadata";

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
    "hideViewersCursor"      boolean,
    "hideViewersAnnotation"  boolean
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
	mls."hideViewersAnnotation",
	mls."lockOnJoin",
    mls."lockOnJoinConfigurable",
	mup."webcamsOnlyForModerator",
	CASE WHEN
	mls."disableCam" IS TRUE THEN TRUE
	WHEN mls."disableMic"  IS TRUE THEN TRUE
	WHEN mls."disablePrivateChat"  IS TRUE THEN TRUE
	WHEN mls."disablePublicChat"  IS TRUE THEN TRUE
	WHEN mls."disableNotes"  IS TRUE THEN TRUE
	WHEN mls."hideUserList"  IS TRUE THEN TRUE
	WHEN mls."hideViewersCursor"  IS TRUE THEN TRUE
	WHEN mls."hideViewersAnnotation"  IS TRUE THEN TRUE
	WHEN mup."webcamsOnlyForModerator"  IS TRUE THEN TRUE
	ELSE FALSE
	END "hasActiveLockSetting"
FROM meeting m
JOIN "meeting_lockSettings" mls ON mls."meetingId" = m."meetingId"
JOIN "meeting_usersPolicies" mup ON mup."meetingId" = m."meetingId";

create table "meeting_clientSettings" (
	"meetingId" 		varchar(100) primary key references "meeting"("meetingId") ON DELETE CASCADE,
    "clientSettingsJson"    jsonb
);

CREATE VIEW "v_meeting_clientSettings" AS SELECT * FROM "meeting_clientSettings";

create view "v_meeting_clientPluginSettings" as
select "meetingId",
       plugin->>'name' as "name",
       plugin->>'url' as "url",
       (plugin->>'settings')::jsonb as "settings",
       (plugin->>'dataChannels')::jsonb as "dataChannels"
from (
    select "meetingId", jsonb_array_elements("clientSettingsJson"->'public'->'plugins') AS plugin
    from "meeting_clientSettings"
) settings;

create table "meeting_group" (
	"meetingId"  varchar(100) references "meeting"("meetingId") ON DELETE CASCADE,
    "groupId"    varchar(100),
    "name"       varchar(100),
    "usersExtId" varchar[],
    CONSTRAINT "meeting_group_pkey" PRIMARY KEY ("meetingId","groupId")
);
create index "idx_meeting_group_meetingId" on "meeting_group"("meetingId");
create view "v_meeting_group" as select * from meeting_group;

-- ========== User tables

CREATE TABLE "user" (
    "meetingId" varchar(100) references "meeting"("meetingId") ON DELETE CASCADE,
	"userId" varchar(50) NOT NULL,
	"extId" varchar(50),
	"name" varchar(255),
	"role" varchar(20),
	"avatar" varchar(500),
	"color" varchar(7),
    "sessionToken" varchar(16),
    "authToken" varchar(16),
    "authed" bool,
    "joined" bool,
    "joinErrorCode" varchar(50),
    "joinErrorMessage" varchar(400),
    "banned" bool,
    "loggedOut" bool,  -- when user clicked Leave meeting button
    "guest" bool, --used for dialIn
    "guestStatus" varchar(50),
    "registeredOn" bigint,
    "excludeFromDashboard" bool,
    "enforceLayout" varchar(50),
    --columns of user state below
    "raiseHand" bool default false,
    "raiseHandTime" timestamp with time zone,
    "away" bool default false,
    "awayTime" timestamp with time zone,
	"reactionEmoji" varchar(25),
	"reactionEmojiTime" timestamp with time zone,
	"guestStatusSetByModerator" varchar(50),
	"guestLobbyMessage" text,
	"mobile" bool,
	"clientType" varchar(50),
	"transferredFromParentMeeting" bool default false, --when a user join in breakoutRoom only in audio
	"disconnected" bool default false, -- this is the old leftFlag (that was renamed), set when the user just closed the client
	"expired" bool default false, -- when it is been some time the user is disconnected
	"ejected" bool,
	"ejectReason" varchar(255),
	"ejectReasonCode" varchar(50),
	"ejectedByModerator" varchar(50),
	"presenter" bool,
	"pinned" bool,
	"locked" bool,
	"speechLocale" varchar(255),
	"captionLocale" varchar(255),
	"inactivityWarningDisplay" bool default FALSE,
	"inactivityWarningTimeoutSecs" numeric,
	"hasDrawPermissionOnCurrentPage" bool default FALSE,
	"echoTestRunningAt" timestamp with time zone,
	CONSTRAINT "user_pkey" PRIMARY KEY ("meetingId","userId"),
	FOREIGN KEY ("meetingId", "guestStatusSetByModerator") REFERENCES "user"("meetingId","userId") ON DELETE SET NULL
);
create index "idx_user_pk_reverse" on "user" ("userId", "meetingId");
CREATE INDEX "idx_user_meetingId" ON "user"("meetingId");
CREATE INDEX "idx_user_extId" ON "user"("meetingId", "extId");

--hasDrawPermissionOnCurrentPage is necessary to improve the performance of the order by of userlist
COMMENT ON COLUMN "user"."hasDrawPermissionOnCurrentPage" IS 'This column is dynamically populated by triggers of tables: user, pres_presentation, pres_page, pres_page_writers';
COMMENT ON COLUMN "user"."disconnected" IS 'This column is set true when the user closes the window or his with the server is over';
COMMENT ON COLUMN "user"."expired" IS 'This column is set true after 10 seconds with disconnected=true';
COMMENT ON COLUMN "user"."loggedOut" IS 'This column is set to true when the user click the button to Leave meeting';

--Virtual columns isDialIn, isModerator, isOnline, isWaiting, isAllowed, isDenied
ALTER TABLE "user" ADD COLUMN "isDialIn" boolean GENERATED ALWAYS AS ("clientType" = 'dial-in-user') STORED;
ALTER TABLE "user" ADD COLUMN "isWaiting" boolean GENERATED ALWAYS AS ("guestStatus" = 'WAIT') STORED;
ALTER TABLE "user" ADD COLUMN "isAllowed" boolean GENERATED ALWAYS AS ("guestStatus" = 'ALLOW') STORED;
ALTER TABLE "user" ADD COLUMN "isDenied" boolean GENERATED ALWAYS AS ("guestStatus" = 'DENY') STORED;

ALTER TABLE "user" ADD COLUMN "registeredAt" timestamp with time zone GENERATED ALWAYS AS (to_timestamp("registeredOn"::double precision / 1000)) STORED;

--Used to sort the Userlist
ALTER TABLE "user" ADD COLUMN "nameSortable" varchar(255) GENERATED ALWAYS AS (trim(remove_emojis(immutable_lower_unaccent("name")))) STORED;

CREATE INDEX "idx_user_waiting" ON "user"("meetingId") where "isWaiting" is true;

ALTER TABLE "user" ADD COLUMN "isModerator" boolean GENERATED ALWAYS AS (CASE WHEN "role" = 'MODERATOR' THEN true ELSE false END) STORED;
ALTER TABLE "user" ADD COLUMN "isOnline" boolean GENERATED ALWAYS AS (
    CASE WHEN
            "user"."joined" IS true
            AND "user"."expired" IS false
            AND "user"."loggedOut" IS false
            AND "user"."ejected" IS NOT true
        THEN true
        ELSE false
        END) STORED;

CREATE OR REPLACE VIEW "v_user"
AS SELECT "user"."userId",
    "user"."extId",
    "user"."meetingId",
    "user"."name",
    "user"."nameSortable",
    "user"."avatar",
    "user"."color",
    "user"."away",
    "user"."awayTime",
    "user"."raiseHand",
    "user"."raiseHandTime",
    "user"."reactionEmoji",
    "user"."reactionEmojiTime",
    "user"."guest",
    "user"."guestStatus",
    "user"."mobile",
    "user"."clientType",
    "user"."isDialIn",
    "user"."role",
    "user"."authed",
    "user"."joined",
    "user"."disconnected",
    "user"."expired",
    "user"."banned",
    "user"."loggedOut",
    "user"."registeredOn",
    "user"."registeredAt",
    "user"."presenter",
    "user"."pinned",
    CASE WHEN "user"."role" = 'MODERATOR' THEN false ELSE "user"."locked" END "locked",
    "user"."speechLocale",
    "user"."captionLocale",
    CASE WHEN "user"."echoTestRunningAt" > current_timestamp - INTERVAL '3 seconds' THEN TRUE ELSE FALSE END "isRunningEchoTest",
    "user"."hasDrawPermissionOnCurrentPage",
    CASE WHEN "user"."role" = 'MODERATOR' THEN true ELSE false END "isModerator",
    "user"."isOnline"
  FROM "user"
  WHERE "user"."isOnline" is true;

CREATE INDEX "idx_v_user_meetingId" ON "user"("meetingId") 
                where "user"."loggedOut" IS FALSE
                AND "user"."expired" IS FALSE
                AND "user"."ejected" IS NOT TRUE
                and "user"."joined" IS TRUE;

CREATE INDEX "idx_v_user_meetingId_orderByColumns" ON "user"(
                        "meetingId",
                        "presenter",
                        "role",
                        "raiseHandTime",
                        "isDialIn",
                        "hasDrawPermissionOnCurrentPage",
                        "nameSortable",
                        "registeredAt",
                        "userId"
                        )
                where "user"."isOnline" is true;

CREATE OR REPLACE VIEW "v_user_current"
AS SELECT "user"."userId",
    "user"."extId",
    "user"."authToken",
    "user"."meetingId",
    "user"."name",
    "user"."nameSortable",
    "user"."avatar",
    "user"."color",
    "user"."away",
    "user"."raiseHand",
    "user"."reactionEmoji",
    "user"."guest",
    "user"."guestStatus",
    "user"."mobile",
    "user"."clientType",
    "user"."enforceLayout",
    "user"."isDialIn",
    "user"."role",
    "user"."authed",
    "user"."joined",
    "user"."joinErrorCode",
    "user"."joinErrorMessage",
    "user"."disconnected",
    "user"."expired",
    "user"."ejected",
    "user"."ejectReason",
    "user"."ejectReasonCode",
    "user"."banned",
    "user"."loggedOut",
    "user"."registeredOn",
    "user"."registeredAt",
    "user"."presenter",
    "user"."pinned",
    CASE WHEN "user"."role" = 'MODERATOR' THEN false ELSE "user"."locked" END "locked",
    "user"."speechLocale",
    "user"."captionLocale",
    "user"."hasDrawPermissionOnCurrentPage",
    "user"."echoTestRunningAt",
    CASE WHEN "user"."echoTestRunningAt" > current_timestamp - INTERVAL '3 seconds' THEN TRUE ELSE FALSE END "isRunningEchoTest",
    CASE WHEN "user"."role" = 'MODERATOR' THEN true ELSE false END "isModerator",
    "user"."isOnline",
    "user"."inactivityWarningDisplay",
    "user"."inactivityWarningTimeoutSecs"
   FROM "user";

CREATE OR REPLACE VIEW "v_user_guest" AS
SELECT u."meetingId", u."userId",
u."guestStatus",
u."isWaiting",
rank() OVER (
    PARTITION BY u."meetingId"
    ORDER BY u."registeredOn" ASC, u."userId" ASC
) as "positionInWaitingQueue",
u."isAllowed",
u."isDenied",
COALESCE(NULLIF(u."guestLobbyMessage",''),NULLIF(mup."guestLobbyMessage",'')) AS "guestLobbyMessage"
FROM "user" u
JOIN "meeting_usersPolicies" mup using("meetingId")
where u."guestStatus" = 'WAIT'
and u."loggedOut" is false;

--v_user_ref will be used only as foreign key (not possible to fetch this table directly through graphql)
--it is necessary because v_user has some conditions like "lockSettings-hideUserList"
--but viewers still needs to query this users as foreign key of chat, cameras, etc
CREATE OR REPLACE VIEW "v_user_ref"
AS SELECT
    "user"."meetingId",
    "user"."userId",
    "user"."extId",
    "user"."name",
    "user"."nameSortable",
    "user"."avatar",
    "user"."color",
    "user"."away",
    "user"."raiseHand",
    "user"."reactionEmoji",
    "user"."guest",
    "user"."guestStatus",
    "user"."mobile",
    "user"."clientType",
    "user"."isDialIn",
    "user"."role",
    "user"."authed",
    "user"."joined",
    "user"."disconnected",
    "user"."expired",
    "user"."banned",
    "user"."loggedOut",
    "user"."registeredOn",
    "user"."registeredAt",
    "user"."presenter",
    "user"."pinned",
    CASE WHEN "user"."role" = 'MODERATOR' THEN false ELSE "user"."locked" END "locked",
    "user"."speechLocale",
    "user"."captionLocale",
    "user"."hasDrawPermissionOnCurrentPage",
    CASE WHEN "user"."role" = 'MODERATOR' THEN true ELSE false END "isModerator",
    "user"."isOnline"
   FROM "user";

create table "user_metadata"(
    "meetingId" varchar(100),
    "userId" varchar(50),
	"parameter" varchar(255),
	"value" varchar(255),
	CONSTRAINT "user_metadata_pkey" PRIMARY KEY ("meetingId", "userId","parameter"),
	FOREIGN KEY ("meetingId", "userId") REFERENCES "user"("meetingId","userId") ON DELETE CASCADE
);
create index "idx_user_metadata_pk_reverse" on "user_metadata" ("userId", "meetingId");

CREATE VIEW "v_user_metadata" AS
SELECT *
FROM "user_metadata";

CREATE VIEW "v_user_welcomeMsgs" AS
SELECT
u."meetingId",
u."userId",
w."welcomeMsg",
CASE WHEN u."role" = 'MODERATOR' THEN w."welcomeMsgForModerators" ELSE NULL END "welcomeMsgForModerators"
FROM "user" u
join meeting_welcome w USING("meetingId");


CREATE TABLE "user_voice" (
    "meetingId" varchar(100),
	"userId" varchar(50),
	"voiceUserId" varchar(100),
	"callerName" varchar(100),
	"callerNum" varchar(100),
	"callingWith" varchar(100),
	"joined" boolean,
	"listenOnly" boolean,
	"muted" boolean,
	"spoke" boolean,
	"talking" boolean,
	"floor" boolean,
	"lastFloorTime" varchar(25),
	"voiceConf" varchar(100),
	"voiceConfCallSession" varchar(50),
	"voiceConfClientSession" varchar(10),
	"voiceConfCallState" varchar(30),
	"endTime" bigint,
	"startTime" bigint,
	"voiceActivityAt" timestamp with time zone,
	CONSTRAINT "user_voice_pkey" PRIMARY KEY ("meetingId","userId"),
    FOREIGN KEY ("meetingId", "userId") REFERENCES "user"("meetingId","userId") ON DELETE CASCADE
);
create index "idx_user_voice_pk_reverse" on "user_voice" ("userId", "meetingId");


--CREATE INDEX "idx_user_voice_userId" ON "user_voice"("userId");
-- + 6000 means it will hide after 6 seconds
--ALTER TABLE "user_voice" ADD COLUMN "hideTalkingIndicatorAt" timestamp with time zone
--GENERATED ALWAYS AS (to_timestamp((COALESCE("endTime","startTime") + 6000) / 1000)) STORED;

ALTER TABLE "user_voice" ADD COLUMN "startedAt" timestamp with time zone
GENERATED ALWAYS AS (to_timestamp("startTime"::double precision / 1000)) STORED;

ALTER TABLE "user_voice" ADD COLUMN "endedAt" timestamp with time zone
GENERATED ALWAYS AS (to_timestamp("endTime"::double precision / 1000)) STORED;

CREATE INDEX "idx_user_voice_userId_talking" ON "user_voice"("meetingId", "userId","talking");
--CREATE INDEX "idx_user_voice_userId_hideTalkingIndicatorAt" ON "user_voice"("meetingId", "userId","hideTalkingIndicatorAt");
CREATE INDEX "idx_user_voice_userId_voiceActivityAt" ON "user_voice"("meetingId", "voiceActivityAt") WHERE "voiceActivityAt" is not null;

CREATE OR REPLACE VIEW "v_user_voice" AS
SELECT "user_voice".*
FROM "user_voice"
WHERE "user_voice"."joined" is true;

--Populate voiceActivityAt to provide users that are active in audio via stream subscription using the view v_user_voice_activity
CREATE OR REPLACE FUNCTION "update_user_voice_voiceActivityAt_trigger_func"() RETURNS TRIGGER AS $$
BEGIN
    NEW."voiceActivityAt" := CASE WHEN
    								NEW."muted" IS false
    								or (OLD."muted" IS false and NEW."muted" is true)
    								or NEW."talking" is true
    								or (OLD."talking" IS true and NEW."talking" is false)
    								or (NEW."startTime" != OLD."startTime")
    								or (NEW."endTime" != OLD."endTime")
    								THEN current_timestamp
                                  ELSE OLD."voiceActivityAt"
                             END;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "update_user_voice_voiceActivityAt_trigger" BEFORE INSERT OR UPDATE ON "user_voice" FOR EACH ROW
EXECUTE FUNCTION "update_user_voice_voiceActivityAt_trigger_func"();

CREATE OR REPLACE VIEW "v_user_voice_activity" AS
select
	"user_voice"."meetingId",
	"user_voice"."userId",
	"user_voice"."muted",
	"user_voice"."talking",
    "user_voice"."startTime",
    "user_voice"."endTime",
	"user_voice"."voiceActivityAt"
FROM "user_voice"
WHERE "voiceActivityAt" is not null
AND --filter recent activities to avoid receiving all history every time it starts the streming
    ("voiceActivityAt" > current_timestamp - '10 seconds'::interval
       OR "user_voice"."muted" is false
        OR "user_voice"."talking" is true
     )
;

----

CREATE TABLE "user_camera" (
	"streamId" varchar(150) PRIMARY KEY,
	"meetingId" varchar(100),
    "userId" varchar(50),
    FOREIGN KEY ("meetingId", "userId") REFERENCES "user"("meetingId","userId") ON DELETE CASCADE
);
CREATE INDEX "idx_user_camera_userId" ON "user_camera"("meetingId", "userId");
CREATE INDEX "idx_user_camera_userId_reverse" ON "user_camera"("userId", "meetingId");

CREATE OR REPLACE VIEW "v_user_camera" AS
SELECT * FROM "user_camera";

CREATE TABLE "user_breakoutRoom" (
	"meetingId" varchar(100),
    "userId" varchar(50),
	"breakoutRoomId" varchar(100),
	"isDefaultName" boolean,
	"sequence" int,
	"shortName" varchar(100),
	"currentlyInRoom" boolean,
	CONSTRAINT "user_breakoutRoom_pkey" PRIMARY KEY ("meetingId","userId"),
    FOREIGN KEY ("meetingId", "userId") REFERENCES "user"("meetingId","userId") ON DELETE CASCADE
);
CREATE INDEX "idx_user_breakoutRoom_pk_reverse" ON "user_breakoutRoom"("userId", "meetingId");

CREATE OR REPLACE VIEW "v_user_breakoutRoom" AS
SELECT * FROM "user_breakoutRoom";

CREATE TABLE "user_connectionStatus" (
	"meetingId" varchar(100),
    "userId" varchar(50),
	"connectionAliveAtMaxIntervalMs" numeric,
	"connectionAliveAt" timestamp with time zone,
	"networkRttInMs" numeric,
	"status" varchar(25),
	"statusUpdatedAt" timestamp with time zone,
	CONSTRAINT "user_connectionStatus_voice_pkey" PRIMARY KEY ("meetingId","userId"),
    FOREIGN KEY ("meetingId", "userId") REFERENCES "user"("meetingId","userId") ON DELETE CASCADE
);
create index "idx_user_connectionStatus_pk_reverse" on "user_connectionStatus"("userId", "meetingId");
create index "idx_user_connectionStatus_meetingId" on "user_connectionStatus"("meetingId");

create view "v_user_connectionStatus" as select * from "user_connectionStatus";


--Populate connectionAliveAtMaxIntervalMs to calc clientNotResponding
--It will sum settings public.stats.interval + public.stats.rtt.critical
CREATE OR REPLACE FUNCTION "update_connectionAliveAtMaxIntervalMs"()
RETURNS TRIGGER AS $$
BEGIN
    SELECT ("clientSettingsJson"->'public'->'stats'->'rtt'->'critical')::int
            +
           ("clientSettingsJson"->'public'->'stats'->'interval')::int
         INTO NEW."connectionAliveAtMaxIntervalMs"
    from "meeting_clientSettings" mcs
    where mcs."meetingId" = NEW."meetingId";
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "trigger_update_connectionAliveAtMaxIntervalMs"
BEFORE INSERT ON "user_connectionStatus"
FOR EACH ROW
EXECUTE FUNCTION "update_connectionAliveAtMaxIntervalMs"();


--CREATE TABLE "user_connectionStatusHistory" (
--	"userId" varchar(50) REFERENCES "user"("userId") ON DELETE CASCADE,
--	"status" varchar(25),
--	"statusUpdatedAt" timestamp with time zone
--);
--CREATE TABLE "user_connectionStatusHistory" (
--	"userId" varchar(50) REFERENCES "user"("userId") ON DELETE CASCADE,
--	"status" varchar(25),
--	"totalOfOccurrences" integer,
--	"highestNetworkRttInMs" numeric,
--	"statusInsertedAt" timestamp with time zone,
--	"statusUpdatedAt" timestamp with time zone,
--	CONSTRAINT "user_connectionStatusHistory_pkey" PRIMARY KEY ("userId","status")
--);

CREATE TABLE "user_connectionStatusMetrics" (
	"meetingId" varchar(100),
    "userId" varchar(50),
	"status" varchar(25),
	"occurrencesCount" integer,
	"firstOccurrenceAt" timestamp with time zone,
	"lastOccurrenceAt" timestamp with time zone,
	"lowestNetworkRttInMs" numeric,
    "highestNetworkRttInMs" numeric,
    "lastNetworkRttInMs" numeric,
	CONSTRAINT "user_connectionStatusMetrics_pkey" PRIMARY KEY ("meetingId","userId","status"),
	FOREIGN KEY ("meetingId", "userId") REFERENCES "user"("meetingId","userId") ON DELETE CASCADE
);
create index "idx_user_connectionStatusMetrics_pk_reverse" on "user_connectionStatusMetrics"("userId", "meetingId");

--This function populate rtt, status and the table user_connectionStatusMetrics
CREATE OR REPLACE FUNCTION "update_user_connectionStatus_trigger_func"() RETURNS TRIGGER AS $$
BEGIN
	IF NEW."connectionAliveAt" IS NULL THEN
		RETURN NEW;
	END IF;

    --Update table user_connectionStatusMetrics
    WITH upsert AS (UPDATE "user_connectionStatusMetrics" SET
    "occurrencesCount" = "user_connectionStatusMetrics"."occurrencesCount" + 1,
    "highestNetworkRttInMs" = GREATEST("user_connectionStatusMetrics"."highestNetworkRttInMs",NEW."networkRttInMs"),
    "lowestNetworkRttInMs" = LEAST("user_connectionStatusMetrics"."lowestNetworkRttInMs",NEW."networkRttInMs"),
    "lastNetworkRttInMs" = NEW."networkRttInMs",
    "lastOccurrenceAt" = current_timestamp
    WHERE "meetingId"=NEW."meetingId" AND "userId"=NEW."userId" AND "status"= NEW."status" RETURNING *)
    INSERT INTO "user_connectionStatusMetrics"("meetingId","userId","status","occurrencesCount", "firstOccurrenceAt",
    "highestNetworkRttInMs", "lowestNetworkRttInMs", "lastNetworkRttInMs")
    SELECT NEW."meetingId", NEW."userId", NEW."status", 1, current_timestamp,
    NEW."networkRttInMs", NEW."networkRttInMs", NEW."networkRttInMs"
    WHERE NOT EXISTS (SELECT * FROM upsert);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "update_user_connectionStatus_trigger" AFTER UPDATE OF "connectionAliveAt" ON "user_connectionStatus"
    FOR EACH ROW EXECUTE FUNCTION "update_user_connectionStatus_trigger_func"();

CREATE OR REPLACE VIEW "v_user_connectionStatusReport" AS
SELECT u."meetingId", u."userId",
max(cs."connectionAliveAt") AS "connectionAliveAt",
max(cs."status") AS "currentStatus",
CASE WHEN
    u."isOnline"
    AND max(cs."connectionAliveAt") < current_timestamp - INTERVAL '1 millisecond' * max(cs."connectionAliveAtMaxIntervalMs")
    THEN TRUE
    ELSE FALSE
END AS "clientNotResponding",
(array_agg(csm."status" ORDER BY csm."lastOccurrenceAt" DESC))[1] as "lastUnstableStatus",
max(csm."lastOccurrenceAt") AS "lastUnstableStatusAt"
FROM "user" u
JOIN "user_connectionStatus" cs ON cs."meetingId" = u."meetingId" and cs."userId" = u."userId"
LEFT JOIN "user_connectionStatusMetrics" csm ON csm."meetingId" = u."meetingId" AND csm."userId" = u."userId" AND csm."status" != 'normal'
GROUP BY u."meetingId", u."userId";

CREATE INDEX "idx_user_connectionStatusMetrics_UnstableReport" ON "user_connectionStatusMetrics" ("meetingId", "userId") WHERE "status" != 'normal';


CREATE TABLE "user_graphqlConnection" (
	"graphqlConnectionId" serial PRIMARY KEY,
	"sessionToken" varchar(16),
	"clientSessionUUID" varchar(36),
	"clientType" varchar(50),
	"clientIsMobile" bool,
	"middlewareUID" varchar(36),
	"middlewareConnectionId" varchar(12),
	"establishedAt" timestamp with time zone,
	"closedAt" timestamp with time zone
);

CREATE INDEX "idx_user_graphqlConnectionSessionToken" ON "user_graphqlConnection"("sessionToken");



--ALTER TABLE "user_connectionStatus" ADD COLUMN "applicationRttInMs" NUMERIC GENERATED ALWAYS AS
--(CASE WHEN  "connectionAliveAt" IS NULL OR "userClientResponseAt" IS NULL THEN NULL
--ELSE EXTRACT(EPOCH FROM ("userClientResponseAt" - "connectionAliveAt")) * 1000
--END) STORED;
--
--ALTER TABLE "user_connectionStatus" ADD COLUMN "last" NUMERIC GENERATED ALWAYS AS
--(CASE WHEN  "connectionAliveAt" IS NULL OR "userClientResponseAt" IS NULL THEN NULL
--ELSE EXTRACT(EPOCH FROM ("userClientResponseAt" - "connectionAliveAt")) * 1000
--END) STORED;


--CREATE OR REPLACE VIEW "v_user_connectionStatus" AS
--SELECT u."meetingId", u."userId", uc.status, uc."statusUpdatedAt", uc."connectionAliveAt",
--CASE WHEN "statusUpdatedAt" < current_timestamp - INTERVAL '20 seconds' THEN TRUE ELSE FALSE END AS "clientNotResponding"
--FROM "user" u
--LEFT JOIN "user_connectionStatus" uc ON uc."userId" = u."userId";

CREATE TABLE "user_clientSettings"(
	"meetingId" varchar(100),
    "userId" varchar(50),
	"userClientSettingsJson" jsonb,
	CONSTRAINT "user_clientSettings_pkey" PRIMARY KEY ("meetingId","userId"),
    FOREIGN KEY ("meetingId", "userId") REFERENCES "user"("meetingId","userId") ON DELETE CASCADE
);
CREATE INDEX "idx_user_clientSettings_pk_reverse" ON "user_clientSettings"("userId", "meetingId");
CREATE INDEX "idx_user_clientSettings_meetingId" ON "user_clientSettings"("meetingId");

create view "v_user_clientSettings" as select * from "user_clientSettings";


CREATE TABLE "user_reaction" (
	"meetingId" varchar(100),
    "userId" varchar(50),
	"reactionEmoji" varchar(25),
	"durationInSeconds" integer not null,
	"createdAt" timestamp with time zone not null,
	"expiresAt" timestamp with time zone,
	FOREIGN KEY ("meetingId", "userId") REFERENCES "user"("meetingId","userId") ON DELETE CASCADE
);
create index "idx_user_reaction_user_meeting" on "user_reaction" ("userId", "meetingId");

--Set expiresAt on insert or update user_reaction
--Set user.reactionEmoji with the latest emoji inserted
CREATE OR REPLACE FUNCTION "update_user_reaction_trigger_func"() RETURNS TRIGGER AS $$
BEGIN
    UPDATE "user"
    SET "reactionEmoji" = nullif(lower(NEW."reactionEmoji"),'none'),
        "reactionEmojiTime" = case when NULLIF(LOWER(NEW."reactionEmoji"),'none') is null then null else current_timestamp end
    WHERE "userId" = NEW."userId" AND "meetingId" = NEW."meetingId";

    NEW."expiresAt" := NEW."createdAt" + '1 seconds'::INTERVAL * NEW."durationInSeconds";
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "update_user_reaction_trigger" BEFORE UPDATE ON "user_reaction"
    FOR EACH ROW EXECUTE FUNCTION "update_user_reaction_trigger_func"();

CREATE TRIGGER "insert_user_reaction_trigger" BEFORE INSERT ON "user_reaction" FOR EACH ROW
EXECUTE FUNCTION "update_user_reaction_trigger_func"();

--ALTER TABLE "user_reaction" ADD COLUMN "expiresAt" timestamp with time zone GENERATED ALWAYS AS ("createdAt" + '1 seconds'::INTERVAL * "durationInSeconds") STORED;

CREATE INDEX "idx_user_reaction_userId_createdAt" ON "user_reaction"("meetingId", "userId", "expiresAt");

CREATE VIEW v_user_reaction AS
SELECT ur."meetingId", ur."userId", ur."reactionEmoji", ur."createdAt", ur."expiresAt"
FROM "user_reaction" ur
WHERE "expiresAt" >= current_timestamp;

CREATE TABLE "user_transcriptionError"(
	"meetingId" varchar(100),
    "userId" varchar(50),
	"errorCode" varchar(255),
	"errorMessage" text,
	"lastUpdatedAt" timestamp with time zone DEFAULT now(),
	CONSTRAINT "user_transcriptionError_pkey" PRIMARY KEY ("meetingId","userId"),
    FOREIGN KEY ("meetingId", "userId") REFERENCES "user"("meetingId","userId") ON DELETE CASCADE
);
CREATE INDEX "idx_user_transcriptionError_pk_reverse" ON "user_transcriptionError"("userId", "meetingId");
CREATE INDEX "idx_user_transcriptionError_meetingId" ON "user_transcriptionError"("meetingId");

create view "v_user_transcriptionError" as select * from "user_transcriptionError";


create view "v_meeting" as
select "meeting".*,  "user_ended"."name" as "endedByUserName"
from "meeting"
left join "user" "user_ended" on "user_ended"."meetingId" = "meeting"."meetingId" and "user_ended"."userId" = "meeting"."endedBy"
;

create view "v_meeting_learningDashboard" as
select "meetingId", "learningDashboardAccessToken"
from "v_meeting";


-- ===================== CHAT TABLES


CREATE TABLE "chat" (
	"meetingId" varchar(100) REFERENCES "meeting"("meetingId") ON DELETE CASCADE,
	"chatId"  varchar(100),
	"access" varchar(20),
	"createdBy" varchar(25),
	CONSTRAINT "chat_pkey" PRIMARY KEY ("meetingId", "chatId")
);
CREATE INDEX "idx_chat_pk_reverse" ON "chat"("chatId","meetingId");
CREATE INDEX "idx_chat_meetingId" ON "chat"("meetingId");

CREATE TABLE "chat_user" (
	"chatId" varchar(100),
	"meetingId" varchar(100),
	"userId" varchar(50),
	"lastSeenAt" timestamp with time zone,
	"startedTypingAt" timestamp with time zone,
	"lastTypingAt" timestamp with time zone,
	"visible" boolean,
	CONSTRAINT "chat_user_pkey" PRIMARY KEY ("meetingId","chatId","userId"),
    CONSTRAINT chat_fk FOREIGN KEY ("chatId", "meetingId") REFERENCES "chat"("chatId", "meetingId") ON DELETE CASCADE
);

CREATE INDEX "idx_chat_user_pk_reverse" ON "chat_user"("userId", "meetingId", "chatId");
CREATE INDEX "idx_chat_user_pk_reverse_b" ON "chat_user"("chatId", "meetingId", "userId");
CREATE INDEX "idx_chat_user_chatId_visible" ON "chat_user"("chatId", "meetingId", "userId") WHERE "visible" is true;
CREATE INDEX "idx_chat_user_meetingId_visible" ON "chat_user"("meetingId", "userId", "chatId") WHERE "visible" is true;


--TRIGER startedTypingAt
CREATE OR REPLACE FUNCTION "update_chat_user_startedTypingAt_trigger_func"() RETURNS TRIGGER AS $$
BEGIN
    NEW."startedTypingAt" := CASE WHEN NEW."lastTypingAt" IS NULL THEN NULL
                                  WHEN OLD."lastTypingAt" IS NULL THEN NEW."lastTypingAt"
                                  WHEN OLD."lastTypingAt" < NEW."lastTypingAt" - INTERVAL '5 seconds' THEN NEW."lastTypingAt"
                                  ELSE OLD."startedTypingAt"
                             END;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "update_chat_user_startedTypingAt_trigger" BEFORE UPDATE OF "lastTypingAt" ON "chat_user"
    FOR EACH ROW EXECUTE FUNCTION "update_chat_user_startedTypingAt_trigger_func"();


create view "v_chat_user" as select * from "chat_user";

CREATE INDEX "idx_chat_user_typing_public" ON "chat_user"("meetingId", "lastTypingAt")
        WHERE "chatId" = 'MAIN-PUBLIC-GROUP-CHAT'
        AND "lastTypingAt" is not null;

CREATE INDEX "idx_chat_user_typing_private" ON "chat_user"("meetingId", "userId", "chatId", "lastTypingAt")
        WHERE "chatId" != 'MAIN-PUBLIC-GROUP-CHAT'
        AND "visible" is true;

CREATE INDEX "idx_chat_with_user_typing_private" ON "chat_user"("meetingId", "userId", "chatId", "lastTypingAt")
        WHERE "chatId" != 'MAIN-PUBLIC-GROUP-CHAT'
        AND "lastTypingAt" is not null;

CREATE OR REPLACE VIEW "v_user_typing_public" AS
SELECT "meetingId", "chatId", "userId", "lastTypingAt", "startedTypingAt",
CASE WHEN "lastTypingAt" > current_timestamp - INTERVAL '5 seconds' THEN true ELSE false END AS "isCurrentlyTyping"
FROM chat_user
WHERE "chatId" = 'MAIN-PUBLIC-GROUP-CHAT'
AND "lastTypingAt" is not null;

CREATE OR REPLACE VIEW "v_user_typing_private" AS
SELECT chat_user."meetingId", chat_user."chatId", chat_user."userId" as "queryUserId", chat_with."userId", chat_with."lastTypingAt", chat_with."startedTypingAt",
CASE WHEN chat_with."lastTypingAt" > current_timestamp - INTERVAL '5 seconds' THEN true ELSE false END AS "isCurrentlyTyping"
FROM chat_user
LEFT JOIN "chat_user" chat_with ON chat_with."meetingId" = chat_user."meetingId"
									AND chat_with."userId" != chat_user."userId"
									AND chat_with."chatId" = chat_user."chatId"
									AND chat_with."lastTypingAt" is not null
WHERE chat_user."chatId" != 'MAIN-PUBLIC-GROUP-CHAT'
AND chat_user."visible" is true;

CREATE TABLE "chat_message" (
	"messageId" varchar(100) PRIMARY KEY,
	"chatId" varchar(100),
	"meetingId" varchar(100),
	"correlationId" varchar(100),
	"chatEmphasizedText" boolean,
	"message" text,
	"messageType" varchar(50),
	"messageMetadata" text,
    "senderId" varchar(100),
    "senderName" varchar(255),
	"senderRole" varchar(20),
	"createdAt" timestamp with time zone,
    CONSTRAINT chat_fk FOREIGN KEY ("chatId", "meetingId") REFERENCES "chat"("chatId", "meetingId") ON DELETE CASCADE
);
CREATE INDEX "idx_chat_message_chatId" ON "chat_message"("chatId","meetingId");

CREATE OR REPLACE FUNCTION "update_chatUser_clear_lastTypingAt_trigger_func"() RETURNS TRIGGER AS $$
BEGIN
  UPDATE "chat_user"
  SET "lastTypingAt" = null
  WHERE "chatId" = NEW."chatId" AND "meetingId" = NEW."meetingId" AND "userId" = NEW."senderId";
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "update_chatUser_clear_lastTypingAt_trigger" AFTER INSERT ON chat_message FOR EACH ROW
EXECUTE FUNCTION "update_chatUser_clear_lastTypingAt_trigger_func"();


CREATE OR REPLACE VIEW "v_chat" AS
SELECT 	"user"."userId",
        case when "user"."userId" = "chat"."createdBy" then true else false end "amIOwner",
		chat."meetingId",
		chat."chatId",
		cu."visible",
		chat_with."userId" AS "participantId",
		count(DISTINCT cm."messageId") "totalMessages",
		sum(CASE WHEN cm."senderId" != "user"."userId"
		    and cm."createdAt" < current_timestamp - '2 seconds'::interval --set a delay while user send lastSeenAt
		    and cm."createdAt" > coalesce(cu."lastSeenAt","user"."registeredAt") THEN 1 ELSE 0 end) "totalUnread",
		cu."lastSeenAt",
		CASE WHEN chat."access" = 'PUBLIC_ACCESS' THEN true ELSE false end public
FROM "user"
JOIN "chat_user" cu ON cu."meetingId" = "user"."meetingId" AND cu."userId" = "user"."userId"
--now it will always add chat_user for public chat onUserJoin
--JOIN "chat" ON "user"."meetingId" = chat."meetingId" AND (cu."chatId" = chat."chatId" OR chat."chatId" = 'MAIN-PUBLIC-GROUP-CHAT')
JOIN "chat" ON "user"."meetingId" = chat."meetingId" AND cu."chatId" = chat."chatId"
LEFT JOIN "chat_user" chat_with ON chat_with."meetingId" = chat."meetingId" AND
                                    chat_with."chatId" = chat."chatId" AND
                                    chat_with."userId" != cu."userId"  AND
                                    chat_with."chatId" != 'MAIN-PUBLIC-GROUP-CHAT'
LEFT JOIN chat_message cm ON cm."meetingId" = chat."meetingId" AND
                             cm."chatId" = chat."chatId"
WHERE cu."visible" is true
GROUP BY "user"."userId", chat."meetingId", chat."chatId", cu."visible", cu."lastSeenAt", chat_with."userId";

create index idx_v_chat_with on chat_user("meetingId","chatId","userId") where "chatId" != 'MAIN-PUBLIC-GROUP-CHAT';

CREATE OR REPLACE VIEW "v_chat_message_public" AS
SELECT cm.*
FROM chat_message cm
WHERE cm."chatId" = 'MAIN-PUBLIC-GROUP-CHAT';

CREATE OR REPLACE VIEW "v_chat_message_private" AS
SELECT  cu."meetingId",
        cu."userId",
        cm."messageId",
        cm."chatId",
        cm."correlationId",
        cm."chatEmphasizedText",
        cm."message",
        cm."messageType",
        cm."messageMetadata",
        cm."senderId",
        cm."senderName",
        cm."senderRole",
        cm."createdAt",
        CASE WHEN chat_with."lastSeenAt" >= cm."createdAt" THEN true ELSE false end "recipientHasSeen"
FROM chat_message cm
JOIN chat_user cu ON cu."meetingId" = cm."meetingId" AND cu."chatId" = cm."chatId"
LEFT JOIN "chat_user" chat_with ON chat_with."meetingId" = cm."meetingId"
                                AND chat_with."chatId" = cm."chatId"
                                AND chat_with."userId" != cu."userId"
WHERE cm."chatId" != 'MAIN-PUBLIC-GROUP-CHAT';

--============ Presentation / Annotation


CREATE TABLE "pres_presentation" (
	"presentationId" varchar(100) PRIMARY KEY,
	"meetingId" varchar(100) REFERENCES "meeting"("meetingId") ON DELETE CASCADE,
	"uploadUserId" varchar(100),
    "uploadTemporaryId" varchar(100), --generated by UI
    "uploadToken" varchar(100), --generated by Akka-apps, used for upload POST
	"name" varchar(500),
	"filenameConverted" varchar(500),
	"isDefault" boolean,
	"current" boolean,
	"removable" boolean,
	"downloadable" boolean,
	"downloadFileExtension" varchar(25),
	"downloadFileUri" varchar(500),
    "uploadInProgress" boolean,
    "uploadCompleted" boolean,
    "uploadErrorMsgKey" varchar(100),
    "uploadErrorDetailsJson" jsonb,
    "totalPages" integer,
    "exportToChatStatus" varchar(25),
    "exportToChatCurrentPage" integer,
    "exportToChatHasError" boolean,
    "createdAt" timestamp with time zone DEFAULT now()
);
CREATE INDEX "idx_pres_presentation_meetingId" ON "pres_presentation"("meetingId");
CREATE INDEX "idx_pres_presentation_meetingId_curr" ON "pres_presentation"("meetingId") where "current" is true;
CREATE INDEX "idx_pres_presentation_meetingId_uploadUserId" ON "pres_presentation"("meetingId","uploadUserId");

CREATE TABLE "pres_page" (
	"pageId" varchar(100) PRIMARY KEY,
	"presentationId" varchar(100) REFERENCES "pres_presentation"("presentationId") ON DELETE CASCADE,
	"num" integer,
	"urlsJson" jsonb,
	"content" TEXT,
	"slideRevealed" boolean default false,
	"current" boolean,
	"xOffset" NUMERIC,
	"yOffset" NUMERIC,
	"widthRatio" NUMERIC,
	"heightRatio" NUMERIC,
    "width" NUMERIC,
    "height" NUMERIC,
    "viewBoxWidth" NUMERIC,
    "viewBoxHeight" NUMERIC,
    "maxImageWidth" integer,
    "maxImageHeight" integer,
    "uploadCompleted" boolean,
    "infiniteWhiteboard" boolean
);
CREATE INDEX "idx_pres_page_presentationId" ON "pres_page"("presentationId");
CREATE INDEX "idx_pres_page_presentationId_curr" ON "pres_page"("presentationId") where "current" is true;

CREATE OR REPLACE VIEW public.v_pres_presentation AS
SELECT pres_presentation."meetingId",
	pres_presentation."presentationId",
	pres_presentation."name",
	pres_presentation."filenameConverted",
	pres_presentation."isDefault",
	pres_presentation."current",
	pres_presentation."downloadable",
	pres_presentation."downloadFileExtension",
	pres_presentation."downloadFileUri",
	pres_presentation."removable",
    pres_presentation."uploadTemporaryId",
    pres_presentation."uploadInProgress",
    pres_presentation."uploadCompleted",
    pres_presentation."totalPages",
    (   SELECT count(*)
        FROM pres_page
        WHERE pres_page."presentationId" = pres_presentation."presentationId"
        AND "uploadCompleted" is true
    ) as "totalPagesUploaded",
    pres_presentation."uploadErrorMsgKey",
    pres_presentation."uploadErrorDetailsJson",
    case when pres_presentation."exportToChatStatus" is not null
                and pres_presentation."exportToChatStatus" != 'EXPORTED'
                and pres_presentation."exportToChatHasError" is not true
                then true else false end "exportToChatInProgress",
    pres_presentation."exportToChatStatus",
    pres_presentation."exportToChatCurrentPage",
    pres_presentation."exportToChatHasError",
    pres_presentation."createdAt"
   FROM pres_presentation;

CREATE OR REPLACE VIEW public.v_pres_page AS
SELECT pres_presentation."meetingId",
	pres_page."presentationId",
	pres_page."pageId",
    pres_page.num,
    pres_page."urlsJson",
    pres_page.content,
    pres_page."slideRevealed",
    CASE WHEN pres_presentation."current" IS TRUE AND pres_page."current" IS TRUE THEN true ELSE false END AS "isCurrentPage",
    pres_page."xOffset",
    pres_page."yOffset" ,
    pres_page."widthRatio",
    pres_page."heightRatio",
    pres_page."width",
    pres_page."height",
    pres_page."viewBoxWidth",
    pres_page."viewBoxHeight",
    (pres_page."width" * LEAST(pres_page."maxImageWidth" / pres_page."width", pres_page."maxImageHeight" / pres_page."height")) AS "scaledWidth",
    (pres_page."height" * LEAST(pres_page."maxImageWidth" / pres_page."width", pres_page."maxImageHeight" / pres_page."height")) AS "scaledHeight",
    (pres_page."width" * pres_page."widthRatio" / 100 * LEAST(pres_page."maxImageWidth" / pres_page."width", pres_page."maxImageHeight" / pres_page."height")) AS "scaledViewBoxWidth",
    (pres_page."height" * pres_page."heightRatio" / 100 * LEAST(pres_page."maxImageWidth" / pres_page."width", pres_page."maxImageHeight" / pres_page."height")) AS "scaledViewBoxHeight",
    pres_page."uploadCompleted",
    pres_page."infiniteWhiteboard"
FROM pres_page
JOIN pres_presentation ON pres_presentation."presentationId" = pres_page."presentationId";

CREATE OR REPLACE VIEW public.v_pres_page_curr AS
SELECT pres_presentation."meetingId",
	pres_page."presentationId",
	pres_page."pageId",
    pres_presentation."name" as "presentationName",
    pres_presentation."filenameConverted" as "presentationFilenameConverted",
    pres_presentation."isDefault" as "isDefaultPresentation",
	pres_presentation."downloadable",
	case when pres_presentation."downloadable" then pres_presentation."downloadFileExtension" else null end "downloadFileExtension",
	case when pres_presentation."downloadable" then pres_presentation."downloadFileUri" else null end "downloadFileUri",
    pres_presentation."removable",
    pres_presentation."totalPages",
    pres_page.num,
    pres_page."urlsJson",
    pres_page.content,
    pres_page."slideRevealed",
    CASE WHEN pres_presentation."current" IS TRUE AND pres_page."current" IS TRUE THEN true ELSE false END AS "isCurrentPage",
    pres_page."xOffset",
    pres_page."yOffset" ,
    pres_page."widthRatio",
    pres_page."heightRatio",
    pres_page."width",
    pres_page."height",
    pres_page."viewBoxWidth",
    pres_page."viewBoxHeight",
    (pres_page."width" * LEAST(pres_page."maxImageWidth" / pres_page."width", pres_page."maxImageHeight" / pres_page."height")) AS "scaledWidth",
    (pres_page."height" * LEAST(pres_page."maxImageWidth" / pres_page."width", pres_page."maxImageHeight" / pres_page."height")) AS "scaledHeight",
    (pres_page."width" * pres_page."widthRatio" / 100 * LEAST(pres_page."maxImageWidth" / pres_page."width", pres_page."maxImageHeight" / pres_page."height")) AS "scaledViewBoxWidth",
    (pres_page."height" * pres_page."heightRatio" / 100 * LEAST(pres_page."maxImageWidth" / pres_page."width", pres_page."maxImageHeight" / pres_page."height")) AS "scaledViewBoxHeight",
    pres_page."infiniteWhiteboard"
FROM pres_presentation
JOIN pres_page ON pres_presentation."presentationId" = pres_page."presentationId" AND pres_page."current" IS TRUE
and pres_presentation."current" IS TRUE;

CREATE TABLE "pres_annotation" (
	"annotationId" varchar(100) PRIMARY KEY,
	"pageId" varchar(100) REFERENCES "pres_page"("pageId") ON DELETE CASCADE,
	"meetingId" varchar(100),
	"userId" varchar(50),
	"annotationInfo" TEXT,
	"lastHistorySequence" integer,
	"lastUpdatedAt" timestamp with time zone DEFAULT now()
);
CREATE INDEX "idx_pres_annotation_pageId" ON "pres_annotation"("pageId");
CREATE INDEX "idx_pres_annotation_updatedAt" ON "pres_annotation"("pageId","lastUpdatedAt");
create index "idx_pres_annotation_user_meeting" on "pres_annotation" ("userId", "meetingId");

CREATE TABLE "pres_annotation_history" (
	"sequence" serial PRIMARY KEY,
	"annotationId" varchar(100),
	"pageId" varchar(100) REFERENCES "pres_page"("pageId") ON DELETE CASCADE,
	"meetingId" varchar(100),
	"userId" varchar(50),
	"annotationInfo" TEXT
--	"lastUpdatedAt" timestamp with time zone DEFAULT now()
);
CREATE INDEX "idx_pres_annotation_history_pageId" ON "pres_annotation"("pageId");
create index "idx_pres_annotation_history_user_meeting" on "pres_annotation_history" ("userId", "meetingId");

CREATE VIEW "v_pres_annotation_curr" AS
SELECT p."meetingId", pp."presentationId", pa."annotationId", pa."pageId", pa."userId", pa."annotationInfo", pa."lastHistorySequence", pa."lastUpdatedAt"
FROM pres_presentation p
JOIN pres_page pp ON pp."presentationId" = p."presentationId"
JOIN pres_annotation pa ON pa."pageId" = pp."pageId"
WHERE p."current" IS true
AND pp."current" IS true;

CREATE VIEW "v_pres_annotation_history_curr" AS
SELECT p."meetingId", pp."presentationId", pah."pageId", pah."userId", pah."annotationId", pah."annotationInfo", pah."sequence"
FROM pres_presentation p
JOIN pres_page pp ON pp."presentationId" = p."presentationId"
JOIN pres_annotation_history pah ON pah."pageId" = pp."pageId"
WHERE p."current" IS true
AND pp."current" IS true;

CREATE TABLE "pres_page_writers" (
	"pageId" varchar(100)  REFERENCES "pres_page"("pageId") ON DELETE CASCADE,
    "meetingId" varchar(100),
    "userId" varchar(50),
    "changedModeOn" bigint,
    CONSTRAINT "pres_page_writers_pkey" PRIMARY KEY ("pageId","meetingId","userId"),
    FOREIGN KEY ("meetingId", "userId") REFERENCES "user"("meetingId","userId") ON DELETE CASCADE
);
create index "idx_pres_page_writers_userID" on "pres_page_writers"("meetingId", "userId", "pageId");
create index "idx_pres_page_writers_userID_rev" on "pres_page_writers"("userId", "meetingId", "pageId");

CREATE OR REPLACE VIEW "v_pres_page_writers" AS
SELECT
	"pres_presentation"."presentationId",
	"pres_page_writers" .*,
	CASE WHEN pres_presentation."current" IS true AND pres_page."current" IS true THEN true ELSE false END AS "isCurrentPage"
FROM "pres_page_writers"
JOIN "pres_page" ON "pres_page"."pageId" = "pres_page_writers"."pageId"
JOIN "pres_presentation" ON "pres_presentation"."presentationId"  = "pres_page"."presentationId" ;

CREATE OR REPLACE VIEW "v_pres_presentation_uploadToken" AS
SELECT "meetingId", "presentationId", "uploadUserId", "uploadTemporaryId", "uploadToken"
FROM pres_presentation pp
WHERE "uploadInProgress" IS FALSE
AND "uploadCompleted" IS FALSE;

------------------------------------------------------------
-- Triggers to automatically control "user" flag "hasDrawPermissionOnCurrentPage"

CREATE OR REPLACE FUNCTION "update_user_hasDrawPermissionOnCurrentPage"("p_userId" varchar DEFAULT NULL, "p_meetingId" varchar DEFAULT NULL)
RETURNS VOID AS $$
DECLARE
    where_clause TEXT := '';
BEGIN
    IF "p_userId" IS NOT NULL THEN
        where_clause := format(' AND "userId" = %L', "p_userId");
    END IF;
    IF "p_meetingId" IS NOT NULL THEN
        where_clause := format('%s AND "meetingId" = %L', where_clause, "p_meetingId");
    END IF;

    IF where_clause <> '' THEN
        where_clause := substring(where_clause from 6);
        EXECUTE format('UPDATE "user"
						SET "hasDrawPermissionOnCurrentPage" =
						CASE WHEN presenter THEN TRUE
						WHEN EXISTS (
							SELECT 1 FROM "v_pres_page_writers" v
							WHERE v."meetingId" = "user"."meetingId"
							AND v."userId" = "user"."userId"
							AND v."isCurrentPage" IS TRUE
						) THEN TRUE
						ELSE FALSE
						END  WHERE %s', where_clause);
    ELSE
        RAISE EXCEPTION 'No params provided';
    END IF;
END;
$$ LANGUAGE plpgsql;

-- user (on update presenter)
CREATE OR REPLACE FUNCTION update_user_presenter_trigger_func() RETURNS TRIGGER AS $$
BEGIN
    IF OLD."presenter" <> NEW."presenter" THEN
        PERFORM "update_user_hasDrawPermissionOnCurrentPage"(NEW."userId", NEW."meetingId");
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_presenter_trigger AFTER UPDATE OF "presenter" ON "user"
FOR EACH ROW EXECUTE FUNCTION update_user_presenter_trigger_func();

-- pres_presentation (on update current)
CREATE OR REPLACE FUNCTION update_pres_presentation_current_trigger_func() RETURNS TRIGGER AS $$
BEGIN
    IF OLD."current" <> NEW."current" THEN
    	PERFORM "update_user_hasDrawPermissionOnCurrentPage"(NULL, NEW."meetingId");
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_pres_presentation_current_trigger AFTER UPDATE OF "current" ON "pres_presentation"
FOR EACH ROW EXECUTE FUNCTION update_pres_presentation_current_trigger_func();

-- pres_page (on update current)
CREATE OR REPLACE FUNCTION update_pres_page_current_trigger_func()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD."current" <> NEW."current" THEN
    	PERFORM "update_user_hasDrawPermissionOnCurrentPage"(NULL, pres_presentation."meetingId")
        FROM pres_presentation
        WHERE "presentationId" = NEW."presentationId";
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_pres_page_current_trigger AFTER UPDATE OF "current" ON "pres_page"
FOR EACH ROW EXECUTE FUNCTION update_pres_page_current_trigger_func();

-- pres_page_writers (on insert, update or delete)
CREATE OR REPLACE FUNCTION ins_upd_del_pres_page_writers_trigger_func()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'UPDATE' or TG_OP = 'INSERT' THEN
        PERFORM "update_user_hasDrawPermissionOnCurrentPage"(NEW."userId", NEW."meetingId");
    ELSIF TG_OP = 'DELETE' THEN
        PERFORM "update_user_hasDrawPermissionOnCurrentPage"(OLD."userId", NEW."meetingId");
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ins_upd_del_pres_page_writers_trigger AFTER INSERT OR UPDATE OR DELETE ON "pres_page_writers"
FOR EACH ROW EXECUTE FUNCTION ins_upd_del_pres_page_writers_trigger_func();

------------------------------------------------------------



CREATE TABLE "pres_page_cursor" (
	"pageId" varchar(100)  REFERENCES "pres_page"("pageId") ON DELETE CASCADE,
    "meetingId" varchar(100),
    "userId" varchar(50),
    "xPercent" numeric,
    "yPercent" numeric,
    "lastUpdatedAt" timestamp with time zone DEFAULT now(),
    CONSTRAINT "pres_page_cursor_pkey" PRIMARY KEY ("pageId","meetingId","userId"),
    FOREIGN KEY ("meetingId", "userId") REFERENCES "user"("meetingId","userId") ON DELETE CASCADE
);
create index "idx_pres_page_cursor_pageId" on "pres_page_cursor"("pageId");
create index "idx_pres_page_cursor_userID" on "pres_page_cursor"("meetingId","userId");
create index "idx_pres_page_cursor_userID_rev" on "pres_page_cursor"("userId", "meetingId");
create index "idx_pres_page_cursor_lastUpdatedAt" on "pres_page_cursor"("pageId","lastUpdatedAt");

CREATE VIEW "v_pres_page_cursor" AS
SELECT pres_page."presentationId", c.*,
        CASE WHEN pres_presentation."current" IS true AND pres_page."current" IS true THEN true ELSE false END AS "isCurrentPage"
FROM pres_page_cursor c
JOIN pres_page ON pres_page."pageId" = c."pageId"
JOIN pres_presentation ON pres_presentation."presentationId" = pres_page."presentationId";


-------------------------------------------------------------------
---- Polls

CREATE TABLE "poll" (
"pollId" varchar(100) PRIMARY KEY,
"meetingId" varchar(100),
"ownerId" varchar(100),
"questionText" TEXT,
"type" varchar(30),
"secret" boolean,
"multipleResponses" boolean,
"ended" boolean,
"published" boolean,
"publishedAt" timestamp with time zone,
"createdAt" timestamp with time zone not null default current_timestamp,
FOREIGN KEY ("meetingId", "ownerId") REFERENCES "user"("meetingId","userId") ON DELETE CASCADE
);
CREATE INDEX "idx_poll_meetingId" ON "poll"("meetingId");
CREATE INDEX "idx_poll_ownerId" ON "poll"("meetingId","ownerId");
CREATE INDEX "idx_poll_meetingId_active" ON "poll"("meetingId") where ended is false;
CREATE INDEX "idx_poll_meetingId_published" ON "poll"("meetingId") where published is true;

CREATE TABLE "poll_option" (
	"pollId" varchar(100) REFERENCES "poll"("pollId") ON DELETE CASCADE,
	"optionId" integer,
	"optionDesc" TEXT,
	CONSTRAINT "poll_option_pkey" PRIMARY KEY ("pollId", "optionId")
);
CREATE INDEX "idx_poll_option_pollId" ON "poll_option"("pollId");

CREATE TABLE "poll_response" (
	"pollId" varchar(100),
	"optionId" integer,
	"meetingId" varchar(100),
	"userId" varchar(100),
	FOREIGN KEY ("pollId", "optionId") REFERENCES "poll_option"("pollId", "optionId") ON DELETE CASCADE,
	FOREIGN KEY ("meetingId", "userId") REFERENCES "user"("meetingId","userId") ON DELETE CASCADE
);
CREATE INDEX "idx_poll_response_pollId" ON "poll_response"("pollId");
CREATE INDEX "idx_poll_response_userId" ON "poll_response"("meetingId", "userId");
CREATE INDEX "idx_poll_response_userId_reverse" ON "poll_response"("userId", "meetingId");
CREATE INDEX "idx_poll_response_pollId_userId" ON "poll_response"("pollId", "meetingId", "userId");

CREATE OR REPLACE VIEW "v_poll_response" AS
SELECT
poll."meetingId",
poll."pollId",
poll."type",
poll."questionText",
poll."meetingId" AS "pollOwnerMeetingId",
poll."ownerId" AS "pollOwnerId",
poll.published,
o."optionId",
o."optionDesc",
count(r."optionId") AS "optionResponsesCount",
sum(count(r."optionId")) OVER (partition by poll."pollId") "pollResponsesCount"
FROM poll
JOIN poll_option o ON o."pollId" = poll."pollId"
LEFT JOIN poll_response r ON r."pollId" = poll."pollId" AND o."optionId" = r."optionId"
GROUP BY poll."pollId", o."optionId", o."optionDesc"
ORDER BY poll."pollId";

CREATE VIEW "v_poll_user" AS
SELECT
poll."meetingId" AS "pollOwnerMeetingId",
poll."ownerId" AS "pollOwnerId",
u."meetingId",
u."userId",
poll."pollId",
poll."type",
poll."questionText",
array_remove(array_agg(o."optionId"), NULL) AS "optionIds",
array_remove(array_agg(o."optionDesc"), NULL) AS "optionDescIds",
CASE WHEN count(o."optionId") > 0 THEN TRUE ELSE FALSE end responded
FROM poll
JOIN v_user u ON u."meetingId" = poll."meetingId" AND "isDialIn" IS FALSE AND presenter IS FALSE
LEFT JOIN poll_response r ON r."pollId" = poll."pollId" AND r."userId" = u."userId"
LEFT JOIN poll_option o ON o."pollId" = r."pollId" AND o."optionId" = r."optionId"
GROUP BY poll."pollId", u."meetingId", u."userId";

CREATE VIEW "v_poll" AS SELECT * FROM "poll";

CREATE VIEW v_poll_option AS
SELECT poll."meetingId", poll."pollId", o."optionId", o."optionDesc"
FROM poll_option o
JOIN poll using("pollId")
WHERE poll."type" != 'R-';

create view "v_poll_user_current" as
select "user"."meetingId", "user"."userId", "poll"."pollId", case when count(pr.*) > 0 then true else false end as responded
from "user"
join "poll" on "poll"."meetingId" = "user"."meetingId"
left join "poll_response" pr on pr."meetingId" = "user"."meetingId" and
                                pr."userId" = "user"."userId" and
                                pr."pollId" = "poll"."pollId"
group by "user"."meetingId", "user"."userId", "poll"."pollId";

--------------------------------
----External video

create table "externalVideo"(
"externalVideoId" varchar(100) primary key,
"meetingId" varchar(100) REFERENCES "meeting"("meetingId") ON DELETE CASCADE,
"externalVideoUrl" varchar(500),
"startedSharingAt" timestamp with time zone,
"stoppedSharingAt" timestamp with time zone,
"updatedAt" timestamp with time zone,
"playerPlaybackRate" numeric,
"playerCurrentTime" numeric,
"playerPlaying" boolean
);
create index "externalVideo_meetingId_current" on "externalVideo"("meetingId") WHERE "stoppedSharingAt" IS NULL;

CREATE VIEW "v_externalVideo" AS
SELECT * FROM "externalVideo"
WHERE "stoppedSharingAt" IS NULL;

--------------------------------
----Screenshare


create table "screenshare"(
"screenshareId" varchar(50) primary key,
"meetingId" varchar(100) REFERENCES "meeting"("meetingId") ON DELETE CASCADE,
"voiceConf" varchar(50),
"screenshareConf" varchar(50),
"contentType" varchar(50),
"stream" varchar(100),
"vidWidth" integer,
"vidHeight" integer,
"hasAudio" boolean,
"startedAt" timestamp with time zone,
"stoppedAt" timestamp with time zone

);
create index "screenshare_meetingId" on "screenshare"("meetingId");
create index "screenshare_meetingId_current" on "screenshare"("meetingId") WHERE "stoppedAt" IS NULL;

CREATE VIEW "v_screenshare" AS
SELECT * FROM "screenshare"
WHERE "stoppedAt" IS NULL;

--------------------------------
----Timer

CREATE TABLE "timer" (
	"meetingId" varchar(100) PRIMARY KEY REFERENCES "meeting"("meetingId") ON DELETE CASCADE,
	"stopwatch" boolean,
	"running" boolean,
	"active" boolean,
	"time" bigint,
	"accumulated" bigint,
	"startedOn" bigint,
	"songTrack" varchar(50)
);

ALTER TABLE "timer" ADD COLUMN "startedAt" timestamp with time zone GENERATED ALWAYS AS (CASE WHEN "startedOn" = 0 THEN NULL ELSE to_timestamp("startedOn"::double precision / 1000) END) STORED;

CREATE OR REPLACE VIEW "v_timer" AS
SELECT
     "meetingId",
     "stopwatch",
     case
        when "stopwatch" is true or "running" is false then "running"
        when "startedAt" + (("time" - coalesce("accumulated",0)) * interval '1 milliseconds') >= current_timestamp then true
        else false
     end "running",
     "active",
     "time",
     "accumulated",
     "startedAt",
     "startedOn",
     "songTrack"
 FROM "timer";

------------------------------------
----breakoutRoom


CREATE TABLE "breakoutRoom" (
	"breakoutRoomId" varchar(100) NOT NULL PRIMARY KEY,
	"parentMeetingId" varchar(100) REFERENCES "meeting"("meetingId") ON DELETE CASCADE,
	"externalId" varchar(100),
	"sequence" numeric,
	"name" varchar(100),
	"shortName" varchar(100),
	"isDefaultName" bool,
	"freeJoin" bool,
	"startedAt" timestamp with time zone,
	"endedAt" timestamp with time zone,
	"durationInSeconds" int4,
	"sendInvitationToModerators" bool,
	"captureNotes" bool,
	"captureSlides" bool
);

CREATE INDEX "idx_breakoutRoom_parentMeetingId" ON "breakoutRoom"("parentMeetingId", "externalId");

CREATE TABLE "breakoutRoom_user" (
	"breakoutRoomId" varchar(100) NOT NULL REFERENCES "breakoutRoom"("breakoutRoomId") ON DELETE CASCADE,
	"meetingId" varchar(100),
    "userId" varchar(50),
	"joinURL" text,
	"assignedAt" timestamp with time zone,
	"joinedAt" timestamp with time zone,
	"inviteDismissedAt" timestamp with time zone,
	"userJoinedSomeRoomAt" timestamp with time zone,
	"isLastAssignedRoom" boolean,
	"isLastJoinedRoom" boolean,
	"isUserCurrentlyInRoom" boolean,
	CONSTRAINT "breakoutRoom_user_pkey" PRIMARY KEY ("breakoutRoomId", "meetingId", "userId"),
	FOREIGN KEY ("meetingId", "userId") REFERENCES "user"("meetingId","userId") ON DELETE CASCADE
);
create index "idx_breakoutRoom_user_meeting_user" on "breakoutRoom_user" ("meetingId", "userId");
create index "idx_breakoutRoom_user_user_meeting" on "breakoutRoom_user" ("userId", "meetingId");

ALTER TABLE "breakoutRoom_user" ADD COLUMN "showInvitation" boolean GENERATED ALWAYS AS (
    CASE WHEN
            "isLastAssignedRoom" IS true
            and "isUserCurrentlyInRoom" is null
            AND ("joinedAt" is null or "assignedAt" > "joinedAt")
            AND ("userJoinedSomeRoomAt" is null or "assignedAt" > "userJoinedSomeRoomAt")
            AND ("inviteDismissedAt" is null or "assignedAt" > "inviteDismissedAt")
        THEN true
        ELSE false
        END) STORED;
       --AND ("isModerator" is false OR "sendInvitationToModerators")

--Trigger to populate `isLastAssignedRoom` and `isLastJoinedRoom`
CREATE OR REPLACE FUNCTION "ins_upd_del_breakoutRoom_user_trigger_func"() RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        -- Determine the latest assigned room and latest joined room for the remaining rows
        PERFORM
            set_last_room(OLD."meetingId", OLD."userId");
    ELSE
        -- For INSERT or UPDATE
        PERFORM
            set_last_room(NEW."meetingId", NEW."userId");
    END IF;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION set_last_room(meetingId varchar(100), userId varchar(50)) RETURNS VOID AS $$
DECLARE
    "latestAssignedRoomId" varchar(100);
    "latestJoinedRoomId" varchar(100);
    "latestJoinedAt" timestamp with time zone;
BEGIN
    SELECT "breakoutRoomId"
    INTO "latestAssignedRoomId"
    FROM "breakoutRoom_user"
    WHERE "meetingId" = meetingId
      AND "userId" = userId
      AND "assignedAt" IS NOT NULL
    ORDER BY "assignedAt" DESC NULLS LAST
    LIMIT 1;

    SELECT "breakoutRoomId"
    INTO "latestJoinedRoomId"
    FROM "breakoutRoom_user"
    WHERE "meetingId" = meetingId
      AND "userId" = userId
      AND "joinedAt" IS NOT NULL
    ORDER BY "joinedAt" DESC NULLS LAST
    LIMIT 1;

    UPDATE "breakoutRoom_user" bu
    SET "isLastAssignedRoom" = CASE
            WHEN "latestAssignedRoomId" IS NOT NULL AND bu."breakoutRoomId" = "latestAssignedRoomId" THEN TRUE
            ELSE FALSE
        END,
        "isLastJoinedRoom" = CASE
            WHEN "latestJoinedRoomId" IS NOT NULL AND bu."breakoutRoomId" = "latestJoinedRoomId" THEN TRUE
            ELSE FALSE
        END
    WHERE bu."meetingId" = meetingId
      AND bu."userId" = userId
      AND (bu."isLastAssignedRoom" IS DISTINCT FROM (CASE WHEN "latestAssignedRoomId" IS NOT NULL AND bu."breakoutRoomId" = "latestAssignedRoomId" THEN TRUE ELSE FALSE END)
       OR bu."isLastJoinedRoom" IS DISTINCT FROM (CASE WHEN "latestJoinedRoomId" IS NOT NULL AND bu."breakoutRoomId" = "latestJoinedRoomId" THEN TRUE ELSE FALSE END));

       --userJoinedSomeRoomAt
       SELECT max("joinedAt")
           INTO "latestJoinedAt"
           from "breakoutRoom_user" bru
           where bru."meetingId" = meetingId
           and bru."userId" = userId;

       update "breakoutRoom_user" set "userJoinedSomeRoomAt" = "latestJoinedAt"
          where "breakoutRoom_user"."meetingId" = meetingId
          and "breakoutRoom_user"."userId" = userId
          and "breakoutRoom_user"."userJoinedSomeRoomAt" != "latestJoinedAt";
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "ins_upd_del_breakoutRoom_user_trigger"
AFTER INSERT OR UPDATE OR DELETE ON "breakoutRoom_user"
FOR EACH ROW EXECUTE FUNCTION "ins_upd_del_breakoutRoom_user_trigger_func"();


CREATE OR REPLACE FUNCTION "update_bkroom_isUserCurrentlyInRoom_trigger_func"()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW."isOnline" <> OLD."isOnline" THEN
        update "breakoutRoom_user" set "isUserCurrentlyInRoom" = a."isOnline"
	   from (
		   select
		   bru."breakoutRoomId", bru."userId", bkroom_user."isOnline"
		   from "user" bkroom_user
		   join meeting_breakout mb on mb."meetingId" = bkroom_user."meetingId"
		   join "breakoutRoom" br on br."parentMeetingId" = mb."parentId" and mb."sequence" = br."sequence"
		   join "user" u on u."meetingId" = br."parentMeetingId"  and bkroom_user."extId" = u."extId" || '-' || br."sequence"
		   join "breakoutRoom_user" bru on bru."userId" = u."userId" and bru."breakoutRoomId" = br."breakoutRoomId"
		   where bkroom_user."userId" = NEW."userId"
	   ) a
		where "breakoutRoom_user"."breakoutRoomId" = a."breakoutRoomId"
		and "breakoutRoom_user"."userId" = a."userId";
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "update_bkroom_isUserCurrentlyInRoom_trigger" AFTER UPDATE OF "isOnline" ON "user"
    FOR EACH ROW EXECUTE FUNCTION "update_bkroom_isUserCurrentlyInRoom_trigger_func"();

CREATE OR REPLACE VIEW "v_breakoutRoom" AS
SELECT u."meetingId" as "userMeetingId", u."userId", b."parentMeetingId", b."breakoutRoomId", b."freeJoin",
            b."sequence", b."name", b."isDefaultName",
            b."shortName", b."startedAt", b."endedAt", b."durationInSeconds", b."sendInvitationToModerators",
            bu."assignedAt", bu."joinURL", bu."inviteDismissedAt", u."role" = 'MODERATOR' as "isModerator",
            bu."isLastAssignedRoom", bu."isLastJoinedRoom", bu."isUserCurrentlyInRoom", bu."showInvitation",
            bu."joinedAt" is not null as "hasJoined"
    FROM "user" u
    JOIN "breakoutRoom" b ON b."parentMeetingId" = u."meetingId"
    LEFT JOIN "breakoutRoom_user" bu ON bu."meetingId" = u."meetingId" AND bu."userId" = u."userId" AND bu."breakoutRoomId" = b."breakoutRoomId"
    WHERE (bu."assignedAt" IS NOT NULL
            OR b."freeJoin" IS TRUE
            OR u."role" = 'MODERATOR')
    AND b."endedAt" IS NULL;

CREATE OR REPLACE VIEW "v_breakoutRoom_assignedUser" AS
SELECT "parentMeetingId", "breakoutRoomId", "userMeetingId", "userId"
FROM "v_breakoutRoom"
WHERE "assignedAt" IS NOT NULL;

--TODO improve performance (and handle two users with same extId)
CREATE OR REPLACE VIEW "v_breakoutRoom_participant" as
SELECT DISTINCT
        "parentMeetingId",
        "breakoutRoomId",
        "userMeetingId",
        "userId",
        false as "isAudioOnly"
FROM "v_breakoutRoom"
WHERE "isUserCurrentlyInRoom" IS TRUE
union --include users that joined only with audio
select parent_user."meetingId" as "parentMeetingId",
        bk_user."meetingId" as "breakoutRoomId",
        parent_user."meetingId" as "userMeetingId",
        parent_user."userId",
        true as "isAudioOnly"
from "user" bk_user
join "user" parent_user on parent_user."userId" = bk_user."userId" and parent_user."transferredFromParentMeeting" is false
where bk_user."transferredFromParentMeeting" is true
and bk_user."loggedOut" is false;

--SELECT DISTINCT br."parentMeetingId", br."breakoutRoomId", "user"."meetingId", "user"."userId"
--FROM v_user "user"
--JOIN "meeting" m using("meetingId")
--JOIN "v_meeting_breakoutPolicies" vmbp using("meetingId")
--JOIN "breakoutRoom" br ON br."parentMeetingId" = vmbp."parentId" AND br."externalId" = m."extId";

--User to update "inviteDismissedAt" via Mutation
CREATE OR REPLACE VIEW "v_breakoutRoom_user" AS
SELECT bu.*
FROM "breakoutRoom_user" bu
where bu."breakoutRoomId" in (
    select b."breakoutRoomId"
    from "user" u
    join "breakoutRoom" b on b."parentMeetingId" = u."meetingId" and b."endedAt" is null
    where u."meetingId" = bu."meetingId"
    and u."userId" = bu."userId"
);

------------------------------------
----sharedNotes

create table "sharedNotes" (
    "meetingId" varchar(100) references "meeting"("meetingId") ON DELETE CASCADE,
    "sharedNotesExtId" varchar(25),
    "padId" varchar(25),
    "model" varchar(25),
    "name" varchar(25),
    "pinned" boolean,
    constraint "pk_sharedNotes" primary key ("meetingId", "sharedNotesExtId")
);
create index "idx_sharedNotes_pk_reverse" on "sharedNotes"("sharedNotesExtId", "meetingId");

create table "sharedNotes_rev" (
	"meetingId" varchar(100) references "meeting"("meetingId") ON DELETE CASCADE,
	"sharedNotesExtId" varchar(25),
	"rev" integer,
	"userId" varchar(50),
	"changeset" text,
	"start" integer,
	"end" integer,
	"diff" TEXT,
	"createdAt" timestamp with time zone,
	constraint "pk_sharedNotes_rev" primary key ("meetingId", "sharedNotesExtId", "rev"),
	FOREIGN KEY ("meetingId", "userId") REFERENCES "user"("meetingId","userId") ON DELETE SET NULL
);
create index "idx_sharedNotes_rev_pk_reverse" on "sharedNotes_rev"("sharedNotesExtId", "meetingId");
create index "idx_sharedNotes_rev_user_meeting" on "sharedNotes_rev"("userId", "meetingId");
--create view "v_sharedNotes_rev" as select * from "sharedNotes_rev";

create view "v_sharedNotes_diff" as
select "meetingId", "sharedNotesExtId", "userId", "start", "end", "diff", "rev"
from "sharedNotes_rev"
where "diff" is not null;

create table "sharedNotes_session" (
    "meetingId" varchar(100) references "meeting"("meetingId") ON DELETE CASCADE,
    "sharedNotesExtId" varchar(25),
    "userId" varchar(50),
    "sessionId" varchar(50),
    constraint "pk_sharedNotes_session" primary key ("meetingId", "sharedNotesExtId", "userId"),
    FOREIGN KEY ("meetingId", "userId") REFERENCES "user"("meetingId","userId") ON DELETE CASCADE
);
create index "sharedNotes_session_userId" on "sharedNotes_session"("meetingId", "userId");
create index "sharedNotes_session_userId_rev" on "sharedNotes_session"("userId", "meetingId");

create view "v_sharedNotes" as
SELECT sn.*, max(snr.rev) "lastRev"
FROM "sharedNotes" sn
LEFT JOIN "sharedNotes_rev" snr ON snr."meetingId" = sn."meetingId" AND snr."sharedNotesExtId" = sn."sharedNotesExtId"
GROUP BY sn."meetingId", sn."sharedNotesExtId";

create view "v_sharedNotes_session" as
SELECT sns.*, sn."padId"
FROM "sharedNotes_session" sns
JOIN "sharedNotes" sn ON sn."meetingId" = sns."meetingId" AND sn."sharedNotesExtId" = sn."sharedNotesExtId";

----------------------

CREATE OR REPLACE VIEW "v_current_time" AS
SELECT
	current_timestamp AS "currentTimestamp",
	FLOOR(EXTRACT(EPOCH FROM current_timestamp) * 1000)::bigint AS "currentTimeMillis";

------------------------------------
----caption

CREATE TABLE "caption_locale" (
    "meetingId" varchar(100) NOT NULL REFERENCES "meeting"("meetingId") ON DELETE CASCADE,
    "locale" varchar(15) NOT NULL,
    "captionType" varchar(100) NOT NULL, --Audio Transcription or Typed Caption
    "createdBy" varchar(50),
    "createdAt" timestamp with time zone default current_timestamp,
    "updatedAt" timestamp with time zone,
    CONSTRAINT "caption_locale_pk" primary key ("meetingId","locale","captionType"),
    FOREIGN KEY ("meetingId", "createdBy") REFERENCES "user"("meetingId","userId") ON DELETE CASCADE
);
create index "idx_caption_locale_pk_reverse" on "caption_locale"("locale","meetingId","captionType");
create index "idx_caption_locale_pk_reverse_b" on "caption_locale"("captionType","meetingId","locale");

CREATE TABLE "caption" (
    "captionId" varchar(100) NOT NULL PRIMARY KEY,
    "meetingId" varchar(100) NOT NULL REFERENCES "meeting"("meetingId") ON DELETE CASCADE,
    "captionType" varchar(100) NOT NULL, --Audio Transcription or Typed Caption
    "userId" varchar(50),
    "locale" varchar(15),
    "captionText" text,
    "createdAt" timestamp with time zone,
    FOREIGN KEY ("meetingId", "userId") REFERENCES "user"("meetingId","userId") ON DELETE CASCADE
);
create index "idx_caption_pk_reverse" on "caption"("userId","meetingId");

CREATE OR REPLACE FUNCTION "update_caption_locale_owner_func"() RETURNS TRIGGER AS $$
BEGIN
    WITH upsert AS (
        UPDATE "caption_locale" SET
        "createdBy" = NEW."userId",
        "updatedAt" = current_timestamp
        WHERE "meetingId"=NEW."meetingId" AND "locale"=NEW."locale" AND "captionType"= NEW."captionType"
    RETURNING *)
    INSERT INTO "caption_locale"("meetingId","locale","captionType","createdBy")
    SELECT NEW."meetingId", NEW."locale", NEW."captionType", NEW."userId"
    WHERE NOT EXISTS (SELECT * FROM upsert);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "insert_caption_trigger" BEFORE INSERT ON "caption" FOR EACH ROW
EXECUTE FUNCTION "update_caption_locale_owner_func"();

create index idx_caption on caption("meetingId","locale","createdAt");
create index idx_caption_captionType on caption("meetingId","locale","captionType","createdAt");

CREATE OR REPLACE VIEW "v_caption" AS
SELECT *
FROM "caption"
WHERE "createdAt" > current_timestamp - INTERVAL '5 seconds';

CREATE OR REPLACE VIEW "v_caption_activeLocales" AS
select distinct "meetingId", "locale", "createdBy", "captionType"
from "caption_locale";

create index "idx_caption_typed_activeLocales" on "caption"("meetingId","locale","userId") where "captionType" = 'TYPED';

------------------------------------
----

CREATE TABLE "layout" (
	"meetingId" 			varchar(100) primary key references "meeting"("meetingId") ON DELETE CASCADE,
	"currentLayoutType"     varchar(100),
	"presentationMinimized" boolean,
	"cameraDockIsResizing"	boolean,
	"cameraDockPlacement" 	varchar(100),
	"cameraDockAspectRatio" numeric,
	"cameraWithFocus" 		varchar(100),
	"propagateLayout" 		boolean,
	"updatedAt" 			timestamp with time zone
);

CREATE VIEW "v_layout" AS
SELECT * FROM "layout";

------------------------------------
----

CREATE TABLE "notification" (
	"notificationId"        serial primary key,
	"meetingId" 			varchar(100) references "meeting"("meetingId") ON DELETE CASCADE,
	"notificationType"      varchar(100),
	"icon"                  varchar(100),
	"messageId"             varchar(100),
	"messageDescription"    varchar(100),
	"messageValues"         jsonb,
	"role"                  varchar(100), --MODERATOR, PRESENTER, VIEWER
	"userMeetingId"         varchar(100),
	"userId"                varchar(50),
	"createdAt"             timestamp with time zone DEFAULT current_timestamp,
	FOREIGN KEY ("userMeetingId", "userId") REFERENCES "user"("meetingId","userId") ON DELETE CASCADE
);
create index "idx_notification_user_meeting" on "notification" ("userId", "meetingId", "createdAt");
create index "idx_notification_meeting_user" on "notification" ("meetingId", "userId", "createdAt");

create or replace VIEW "v_notification" AS
select 	u."meetingId",
        u."userId",
		n."notificationId",
		n."notificationType",
		n."icon",
		n."messageId",
		n."messageDescription",
		n."messageValues",
		n."role",
		case when n."userId" = u."userId" then true else false end "isSingleUserNotification",
		n."createdAt"
from notification n
join "user" u on n."meetingId" = u."meetingId" and (n."userId" is null or n."userId" = u."userId")
where  (
            n."role" is null or
            n."role" = u."role" or
            (n."role" = 'PRESENTER' and u.presenter is true)
		)
and n."createdAt" > u."registeredAt"
and n."createdAt" > current_timestamp - '5 seconds'::interval;

create index idx_notification on notification("meetingId","userId","role","createdAt");


--------------------------------
---Plugins Data Channel
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE "pluginDataChannelEntry" (
	"meetingId" varchar(100) references "meeting"("meetingId") ON DELETE CASCADE,
	"pluginName" varchar(255),
	"channelName" varchar(255),
	"entryId" varchar(50) DEFAULT uuid_generate_v4(),
    "subChannelName" varchar(255),
	"payloadJson" jsonb,
	"createdBy" varchar(50),
	"toRoles" varchar[], --MODERATOR, VIEWER, PRESENTER
	"toUserIds" varchar[],
	"createdAt" timestamp with time zone DEFAULT current_timestamp,
	"deletedAt" timestamp with time zone,
	CONSTRAINT "pluginDataChannel_pkey" PRIMARY KEY ("meetingId","pluginName","channelName","entryId", "subChannelName"),
	FOREIGN KEY ("meetingId", "createdBy") REFERENCES "user"("meetingId","userId") ON DELETE CASCADE
);
create index "idx_pluginDataChannelEntry_pk_reverse" on "pluginDataChannelEntry"("pluginName", "meetingId", "channelName", "subChannelName");
create index "idx_pluginDataChannelEntry_pk_reverse_b" on "pluginDataChannelEntry"("channelName", "pluginName", "meetingId", "subChannelName");
create index "idx_pluginDataChannelEntry_pk_reverse_c" on "pluginDataChannelEntry"("subChannelName", "channelName", "pluginName", "meetingId");
create index "idx_pluginDataChannelEntry_channelName" on "pluginDataChannelEntry"("meetingId", "pluginName", "channelName", "toRoles", "toUserIds", "subChannelName", "createdAt") where "deletedAt" is null;
create index "idx_pluginDataChannelEntry_roles" on "pluginDataChannelEntry"("meetingId", "toRoles", "toUserIds", "createdAt") where "deletedAt" is null;

CREATE OR REPLACE VIEW "v_pluginDataChannelEntry" AS
SELECT u."meetingId", u."userId", m."pluginName", m."channelName", m."subChannelName", m."entryId", m."payloadJson", m."createdBy", m."toRoles", m."createdAt"
FROM "user" u
JOIN "pluginDataChannelEntry" m ON m."meetingId" = u."meetingId"
			AND ((m."toRoles" IS NULL AND m."toUserIds" IS NULL)
				OR u."userId" = ANY(m."toUserIds")
				OR u."role" = ANY(m."toRoles")
				OR (u."presenter" AND 'PRESENTER' = ANY(m."toRoles"))
				)
WHERE "deletedAt" is null
ORDER BY m."createdAt";

------------------------


create view "v_meeting_componentsFlags" as
select "meeting"."meetingId",
        (case
            when NULLIF("durationInSeconds",0) is null then false
            when current_timestamp + '30 minutes'::interval > ("createdAt" + ("durationInSeconds" * '1 second'::interval)) then true
            else false
        end) "showRemainingTime",
        exists (
            select 1
            from "breakoutRoom"
            where "breakoutRoom"."parentMeetingId" = "meeting"."meetingId"
            and "endedAt" is null
        ) as "hasBreakoutRoom",
        exists (
            select 1
            from "poll"
            where "poll"."meetingId" = "meeting"."meetingId"
            and "ended" is false
            and "published" is false
        ) as "hasPoll",
        exists (
            select 1
            from "timer"
            where "timer"."meetingId" = "meeting"."meetingId"
            and "active" is true
        ) as "hasTimer",
        exists (
            select 1
            from "v_screenshare"
            where "v_screenshare"."meetingId" = "meeting"."meetingId"
            and "contentType" = 'screenshare'
        ) as "hasScreenshare",
        exists (
            select 1
            from "v_screenshare"
            where "v_screenshare"."meetingId" = "meeting"."meetingId"
            and "contentType" = 'camera'
        ) as "hasCameraAsContent",
        exists (
            select 1
            from "v_externalVideo"
            where "v_externalVideo"."meetingId" = "meeting"."meetingId"
        ) as "hasExternalVideo",
        exists (
            select 1
            from "v_caption_activeLocales"
            where "v_caption_activeLocales"."meetingId" = "meeting"."meetingId"
        ) as "hasCaption"
from "meeting";
