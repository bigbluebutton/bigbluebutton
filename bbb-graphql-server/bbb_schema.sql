drop table if exists "user";

CREATE TABLE public."user" (
	"userId" varchar(255) NOT NULL,
	"extId" varchar(255) NULL,
	"meetingId" varchar(255) NULL,
	"name" varchar(255) NULL,
	"avatar" varchar(255) NULL,
	"color" varchar(7) null,
	"emoji" varchar,
	"guest" bool NULL,
	"guestStatus" varchar(255),
	"mobile" bool null,
--	"excludeFromDashboard" bool NULL,
	"role" varchar(255) NULL,
	"authed" bool NULL,
	"joined" bool NULL,
	"leftFlag" bool null,
	"ejected" bool null,
	"ejectReason" varchar(255),
	"banned" bool NULL,
	"loggedOut" bool NULL,
	"registeredOn" int8 NULL,
	"presenter" bool null,
	"pinned" bool NULL,
	"locked" bool null,
	CONSTRAINT user_pkey PRIMARY KEY ("userId")
);

create index "user_meetingId" on "user"("meetingId");

drop view if exists "v_user_microphone";
drop table if exists "user_microphone";

create table "user_microphone" (
	"voiceUserId" varchar(255) primary key,
	"userId" varchar(255) references "user"("userId"),
	"callerName" varchar(255),
	"callerNum" varchar(255),
	"callingWith" varchar(255),
	"joined" boolean null,
	"listenOnly" boolean null,
	"muted" boolean null,
	"spoke" boolean null,
	"talking" boolean null,
	"floor" boolean null,
	"lastFloorTime" varchar(25),
	"voiceConf" varchar(255),
	"color" varchar(7),
	"endTime" bigint null,
	"startTime" bigint null
);

create index "user_microphone_userId" on "user_microphone"("userId");

create or replace view "v_user_microphone" as
select u."meetingId", "user_microphone".*
from "user_microphone"
join "user" u on u."userId" = "user_microphone"."userId";

drop view if exists "v_user_camera";
drop table if exists "user_camera";

create table "user_camera" (
	"streamId" varchar(255) primary key,
	"userId" varchar(255) NOT NULL references "user"("userId")
);

create index "user_camera_userId" on "user_camera"("userId");

create or replace view "v_user_camera" as
select u."meetingId", "user_camera".*
from "user_camera"
join "user" u on u."userId" = user_camera."userId";