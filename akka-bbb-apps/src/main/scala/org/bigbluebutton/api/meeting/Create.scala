package org.bigbluebutton.api.meeting

import akka.http.scaladsl.model.DateTime
import com.typesafe.config.Config
import org.apache.commons.codec.digest.DigestUtils
import org.apache.commons.lang3.RandomStringUtils
import org.bigbluebutton.common2.domain.{BreakoutProps, DefaultProps, DurationProps, GroupProps, LockSettingsProps, MeetingProp, MetadataProp, PasswordProp, RecordProp, SystemProps, UsersProp, VoiceProp, WelcomeProp}

import scala.collection.mutable
import scala.language.postfixOps
import scala.util.Try

object ApiCreateParams {
  val ALLOW_START_STOP_RECORDING = "allowStartStopRecording"
  val ATTENDEE_PW = "attendeePW"
  val AUTO_START_RECORDING = "autoStartRecording"
  val BANNER_COLOR = "bannerColor"
  val BANNER_TEXT = "bannerText"
  val CHECKSUM = "checksum"
  val COPYRIGHT = "copyright"
  val DIAL_NUMBER = "dialNumber"
  val DURATION = "duration"
  val FREE_JOIN = "freeJoin"
  val FULL_NAME = "fullName"
  val GUEST_POLICY = "guestPolicy"
  val MEETING_LAYOUT = "meetingLayout"
  val IS_BREAKOUT = "isBreakout"
  val LOGO = "logo"
  val LOGOUT_TIMER = "logoutTimer"
  val LOGOUT_URL = "logoutURL"
  val MAX_PARTICIPANTS = "maxParticipants"
  val MEETING_ID = "meetingID"
  val META = "meta"
  val MODERATOR_ONLY_MESSAGE = "moderatorOnlyMessage"
  val MODERATOR_PW = "moderatorPW"
  val MUTE_ON_START = "muteOnStart"
  val MEETING_KEEP_EVENTS = "meetingKeepEvents"
  val ALLOW_MODS_TO_UNMUTE_USERS = "allowModsToUnmuteUsers"
  val ALLOW_REQUESTS_WITHOUT_SESSION = "allowRequestsWithoutSession"
  val ALLOW_MODS_TO_EJECT_CAMERAS = "allowModsToEjectCameras"
  val NAME = "name"
  val PARENT_MEETING_ID = "parentMeetingID"
  val PASSWORD = "password"
  val RECORD = "record"
  val RECORD_ID = "recordID"
  val REDIRECT = "redirect"
  val SEQUENCE = "sequence"
  val VOICE_BRIDGE = "voiceBridge"
  val WEB_VOICE = "webVoice"
  val LEARNING_DASHBOARD_ENABLED = "learningDashboardEnabled"
  val LEARNING_DASHBOARD_CLEANUP_DELAY_IN_MINUTES = "learningDashboardCleanupDelayInMinutes"
  val VIRTUAL_BACKGROUNDS_DISABLED = "virtualBackgroundsDisabled"
  val WEBCAMS_ONLY_FOR_MODERATOR = "webcamsOnlyForModerator"
  val MEETING_CAMERA_CAP = "meetingCameraCap"
  val USER_CAMERA_CAP = "userCameraCap"
  val MAX_PINNED_CAMERAS = "maxPinnedCameras"
  val MEETING_EXPIRE_IF_NO_USER_JOINED_IN_MINUTES = "meetingExpireIfNoUserJoinedInMinutes"
  val MEETING_EXPIRE_WHEN_LAST_USER_LEFT_IN_MINUTES = "meetingExpireWhenLastUserLeftInMinutes"
  val WELCOME = "welcome"
  val HTML5_INSTANCE_ID = "html5InstanceId"
  val ROLE = "role"
  val GROUPS = "groups"
  val DISABLED_FEATURES = "disabledFeatures"
  val NOTIFY_RECORDING_IS_ON = "notifyRecordingIsOn"

  val BREAKOUT_ROOMS_ENABLED = "breakoutRoomsEnabled"
  val BREAKOUT_ROOMS_RECORD = "breakoutRoomsRecord"
  val BREAKOUT_ROOMS_PRIVATE_CHAT_ENABLED = "breakoutRoomsPrivateChatEnabled"

  val LOCK_SETTINGS_DISABLE_CAM = "lockSettingsDisableCam"
  val LOCK_SETTINGS_DISABLE_MIC = "lockSettingsDisableMic"
  val LOCK_SETTINGS_DISABLE_PRIVATE_CHAT = "lockSettingsDisablePrivateChat"
  val LOCK_SETTINGS_DISABLE_PUBLIC_CHAT = "lockSettingsDisablePublicChat"
  val DEPRECATED_LOCK_SETTINGS_DISABLE_NOTES = "lockSettingsDisableNote"
  val LOCK_SETTINGS_DISABLE_NOTES = "lockSettingsDisableNotes"
  val LOCK_SETTINGS_HIDE_USER_LIST = "lockSettingsHideUserList"
  val LOCK_SETTINGS_LOCKED_LAYOUT = "lockSettingsLockedLayout"
  val LOCK_SETTINGS_LOCK_ON_JOIN = "lockSettingsLockOnJoin"
  val LOCK_SETTINGS_LOCK_ON_JOIN_CONFIGURABLE = "lockSettingsLockOnJoinConfigurable"
  val LOCK_SETTINGS_HIDE_VIEWERS_CURSOR = "lockSettingsHideViewersCursor"

  // New param passed on create call to callback when meeting ends.
  // This is a duplicate of the endCallbackUrl meta param as we want this
  // param to stay on the server and not propagated to client and recordings.
  val MEETING_ENDED_CALLBACK_URL = "meetingEndedURL"

  // Param to end the meeting when there are no moderators after a certain period of time.
  // Needed for classes where teacher gets disconnected and can't get back in. Prevents
  // students from running amok.
  val END_WHEN_NO_MODERATOR = "endWhenNoModerator"
  val END_WHEN_NO_MODERATOR_DELAY_IN_MINUTES = "endWhenNoModeratorDelayInMinutes"

}

object welcomeMesssageKeywords {
  val SERVER_URL = "%%SERVERURL%%"
  val DIAL_NUM = "%%DIAL_NUM%%"
  val CONF_NUM = "%%CONF_NUM%%"
  val CONF_NAME = "%%CONF_NAME%%"
}

object Create {

  def createDefaultProp(
                        meetingId: String,
                         params: Map[String, String],
                         config: Config
                       ): DefaultProps = {
    println("createDefaultProp")
    println(params)


    def getParamAsString(apiName: String, configName: String = "", defaultValue: String = ""): String = {
      val value = params.getOrElse(apiName, {
        if(configName equals "") defaultValue
        else Try(config.getString(configName)).getOrElse(defaultValue)
      })

      value
    }

    def getParamAsInt(apiName: String, configName: String, defaultValue: Int): Int = {
      val value = getParamAsString(apiName, configName, "")

      if(value == "") defaultValue
      else value.toInt
    }

    def getParamAsBoolean(apiName: String, configName: String = "", defaultValue: Boolean): Boolean = {
      val value = getParamAsString(apiName, configName, "")

      value.toLowerCase match {
        case "true" => true
        case "false" => true
        case "" => defaultValue
        case _ => {
          println(s"Invalid param [$apiName] for meeting=[$meetingId]")
          defaultValue
        }
      }
    }

    def formatConfNum(s: String): String = {
      if (s.length > 5) {
        /* Reverse conference number.
               * Put a whitespace every third char.
               * Reverse it again to display it correctly.
               * Trim leading whitespaces.
               * */ val confNumReversed: String = new mutable.StringBuilder(s).reverse.toString
        val confNumSplit: String = confNumReversed.replaceAll("(.{3})", "$1 ")
        val confNumL: String = new mutable.StringBuilder(confNumSplit).reverse.toString.trim
        return confNumL
      }
      s
    }

    //ApiCreateParams.NAME

    val meetingName = Utils.stripControlChars(params.getOrElse(ApiCreateParams.NAME, ""))

    //Disabled Features (add all from config + received from url param)
    //Clear list (unique and non-null)
    val disabledFeatures: Vector[String] = {
      Try(config.getString("defaultDisabledFeatures")).getOrElse("").split(",") ++
        getParamAsString(ApiCreateParams.DISABLED_FEATURES).split(",")
        .distinct
        .filter(feat => feat.trim != "")
    }.toVector


    //TODO check if need
//      if (!StringUtils.isEmpty(params.get(ApiParams.VIRTUAL_BACKGROUNDS_DISABLED))) {
//        boolean virtualBackgroundsDisabled = Boolean.valueOf(params.get(ApiParams.VIRTUAL_BACKGROUNDS_DISABLED));
//        if(virtualBackgroundsDisabled == true && !listOfDisabledFeatures.contains("virtualBackgrounds")) {
//          log.warn("[DEPRECATION] use disabledFeatures=virtualBackgrounds instead of virtualBackgroundsDisabled=true");
//          listOfDisabledFeatures.add("virtualBackgrounds");
//        }
//      }

      //TODO check if need
//      boolean learningDashboardEn = learningDashboardEnabled;
//      if (!StringUtils.isEmpty(params.get(ApiParams.LEARNING_DASHBOARD_ENABLED))) {
//        try {
//          learningDashboardEn = Boolean.parseBoolean(params.get(ApiParams.LEARNING_DASHBOARD_ENABLED));
//        } catch (Exception ex) {
//          log.warn("Invalid param [learningDashboardEnabled] for meeting=[{}]",internalMeetingId);
//        }
//      }
//      if(learningDashboardEn == false && !listOfDisabledFeatures.contains("learningDashboard")) {
//        log.warn("[DEPRECATION] use disabledFeatures=learningDashboard instead of learningDashboardEnabled=false");
//        listOfDisabledFeatures.add("learningDashboard");
//      }

    //TODO check if need
//    Boolean breakoutRoomsEnabled = defaultBreakoutRoomsEnabled;
//    String breakoutRoomsEnabledParam = params.get(ApiParams.BREAKOUT_ROOMS_ENABLED);
//    if (!StringUtils.isEmpty(breakoutRoomsEnabledParam)) {
//      breakoutRoomsEnabled = Boolean.parseBoolean(breakoutRoomsEnabledParam);
//    }
//    if(breakoutRoomsEnabled == false && !listOfDisabledFeatures.contains("breakoutRooms")) {
//      log.warn("[DEPRECATION] use disabledFeatures=breakoutRooms instead of breakoutRoomsEnabled=false");
//      listOfDisabledFeatures.add("breakoutRooms");
//    }


      //TODO organize when migrate learningDashboard to new API
//      int learningDashboardCleanupMins = 0;

      // Learning Dashboard not allowed for Breakout Rooms
//      if(!isBreakout) {
//        learningDashboardCleanupMins = learningDashboardCleanupDelayInMinutes;
//        if (!StringUtils.isEmpty(params.get(ApiParams.LEARNING_DASHBOARD_CLEANUP_DELAY_IN_MINUTES))) {
//          try {
//            learningDashboardCleanupMins = Integer.parseInt(params
//              .get(ApiParams.LEARNING_DASHBOARD_CLEANUP_DELAY_IN_MINUTES));
//          } catch (Exception ex) {
//            log.warn(
//              "Invalid param [learningDashboardCleanupDelayInMinutes] for meeting=[{}]",
//              internalMeetingId);
//          }
//        }
//      }

    val createDatetime = System.currentTimeMillis()
    val isBreakout = getParamAsBoolean(ApiCreateParams.IS_BREAKOUT,"",false)

    var externalMeetingId = getParamAsString(ApiCreateParams.MEETING_ID)


    //INTERNAL ID CREATION
    // Create a unique internal id by appending the current time. This way, the 3rd-party
    // app can reuse the external meeting id.
    //start prepend extId
    var internalMeetingId = DigestUtils.sha1Hex(externalMeetingId)
    //concat createDate
    internalMeetingId += "-" + createDatetime.toString

    //TODO check it (change internalId case using testVoiceBridge)
//    // Check if this is a test meeting. NOTE: This should not belong here.
//    // Extract this out.
//    if ((testVoiceBridge != null) && (testVoiceBridge.equals(telVoice))
//      && StringUtils.isEmpty(testConferenceMock)) {
//      internalMeetingId = testConferenceMock;
//    }

    //TODO what to do with it?
    val avatarURL = if(Try(config.getInt("useDefaultAvatar")).getOrElse("false") == "true") {
      Try(config.getInt("defaultAvatarURL")).getOrElse("")
    } else ""
    val html5InstanceId = getParamAsString(ApiCreateParams.HTML5_INSTANCE_ID)


    var parentMeetingId = ""
    if (isBreakout) {
      internalMeetingId = getParamAsString(ApiCreateParams.MEETING_ID)
      parentMeetingId = getParamAsString(ApiCreateParams.PARENT_MEETING_ID)
      // We rebuild the the external meeting using the has of the parent
      // meeting, the shared timestamp and the sequence number
      val timeStamp: String = internalMeetingId.split("\\-")(1)
      val externalHash = DigestUtils.sha1Hex(parentMeetingId + "-" + timeStamp + "-" + getParamAsString(ApiCreateParams.SEQUENCE))
      externalMeetingId = externalHash + "-" + timeStamp
    }

    val meetingProp = MeetingProp(
      name = meetingName,
      extId = externalMeetingId,
      intId = internalMeetingId,
      meetingCameraCap = getParamAsInt(ApiCreateParams.MEETING_CAMERA_CAP,"meetingCameraCap",0),
      maxPinnedCameras = getParamAsInt(ApiCreateParams.MAX_PINNED_CAMERAS,"maxPinnedCameras",3),
      isBreakout = false,
      disabledFeatures = disabledFeatures,
      notifyRecordingIsOn = getParamAsBoolean(ApiCreateParams.NOTIFY_RECORDING_IS_ON,"notifyRecordingIsOn",false)
    )




//      params.getOrElse(ApiCreateParams.RECORD, {
//        RandomStringUtils.randomNumeric(
//          Try(config.getInt("defaultNumDigitsForTelVoice")).getOrElse(5)
//        )
//      })



    val logoutTimer = getParamAsInt(ApiCreateParams.LOGOUT_TIMER,"clientLogoutTimerInMinutes",0)
    val bannerText = getParamAsString(ApiCreateParams.BANNER_TEXT)
    val bannerColor = getParamAsString(ApiCreateParams.BANNER_COLOR)


    //val createDatetime = DateTime.now(DateTimeZone).getMillis()


    val durationProps = DurationProps(
      duration = getParamAsInt(ApiCreateParams.DURATION,"defaultMeetingDuration",-1),
      createDatetime,
      (new java.util.Date(createDatetime)).toString,
      meetingExpireIfNoUserJoinedInMinutes = getParamAsInt(ApiCreateParams.MEETING_EXPIRE_IF_NO_USER_JOINED_IN_MINUTES,"meetingExpireIfNoUserJoinedInMinutes",5),
      meetingExpireWhenLastUserLeftInMinutes = getParamAsInt(ApiCreateParams.MEETING_EXPIRE_WHEN_LAST_USER_LEFT_IN_MINUTES,"meetingExpireWhenLastUserLeftInMinutes",1),
      userInactivityInspectTimerInMinutes = Try(config.getInt("userInactivityInspectTimerInMinutes")).getOrElse(120),
      userInactivityThresholdInMinutes = Try(config.getInt("userInactivityThresholdInMinutes")).getOrElse(30),
      userActivitySignResponseDelayInMinutes = Try(config.getInt("userActivitySignResponseDelayInMinutes")).getOrElse(5),
      endWhenNoModerator = getParamAsBoolean(ApiCreateParams.END_WHEN_NO_MODERATOR,"endWhenNoModerator",false),
      endWhenNoModeratorDelayInMinutes = getParamAsInt(ApiCreateParams.END_WHEN_NO_MODERATOR_DELAY_IN_MINUTES,"endWhenNoModeratorDelayInMinutes",1),
    )

      //Generate token to access Activity Report
      val learningDashboardAccessToken = {
        if (!disabledFeatures.contains("learningDashboard")) RandomStringUtils.randomAlphanumeric(12).toLowerCase
        else ""
      }

    val password = PasswordProp(
      moderatorPass = getParamAsString(ApiCreateParams.MODERATOR_PW),
      viewerPass = getParamAsString(ApiCreateParams.ATTENDEE_PW),
      learningDashboardAccessToken = learningDashboardAccessToken)


    val record : Boolean = {
      Try(config.getBoolean("disableRecordingDefault")).getOrElse(false) match {
        case true => {
          //log.info("Recording is turned OFF by default.")
          false
        }
        case false => getParamAsBoolean(ApiCreateParams.RECORD,"",false)
      }
    }

    val recordProp = RecordProp(
      record = record,
      autoStartRecording = getParamAsBoolean(ApiCreateParams.AUTO_START_RECORDING,"autoStartRecording",false),
      allowStartStopRecording = getParamAsBoolean(ApiCreateParams.ALLOW_START_STOP_RECORDING,"allowStartStopRecording",true),
      keepEvents = getParamAsBoolean(ApiCreateParams.MEETING_KEEP_EVENTS,"defaultKeepEvents",false)
    )


    val breakoutProps = {
      if (isBreakout) {
        BreakoutProps(
          parentId = parentMeetingId,
          sequence = getParamAsInt(ApiCreateParams.SEQUENCE,"",0),
          freeJoin = getParamAsBoolean(ApiCreateParams.FREE_JOIN,"",false),
          breakoutRooms = Vector(),
          record = getParamAsBoolean(ApiCreateParams.BREAKOUT_ROOMS_RECORD,"breakoutRoomsRecord",false),
          privateChatEnabled = getParamAsBoolean(ApiCreateParams.BREAKOUT_ROOMS_PRIVATE_CHAT_ENABLED,"breakoutRoomsPrivateChatEnabled", true)
        )
      } else {
        BreakoutProps(
          parentId = "bbb-none",
          sequence = 0,
          freeJoin = false,
          breakoutRooms = Vector(),
          record = getParamAsBoolean(ApiCreateParams.BREAKOUT_ROOMS_RECORD,"breakoutRoomsRecord",false),
          privateChatEnabled = getParamAsBoolean(ApiCreateParams.BREAKOUT_ROOMS_PRIVATE_CHAT_ENABLED,"breakoutRoomsPrivateChatEnabled", true)
        )
      }
    }


    val voiceBridge = params.getOrElse(ApiCreateParams.VOICE_BRIDGE, {
      RandomStringUtils.randomNumeric(
        Try(config.getInt("defaultNumDigitsForTelVoice")).getOrElse(5)
      )
    })

    //WEB_VOICE ?

    //val dialNumber =
    //webvoice?

//    val dialNumber = params.getOrElse(ApiCreateParams.DIAL_NUMBER, {
//      Try(config.getString("defaultDialAccessNumber")).getOrElse("")
//    })

    val logoutUrl:String = params.getOrElse(ApiCreateParams.LOGOUT_URL, {
      Try(config.getString("bigbluebutton.web.logoutURL")).getOrElse("") match {
        case "" | "default" => Try(config.getString("bigbluebutton.web.serverURL")).getOrElse("")
        case logoutUrl => logoutUrl
      }
    })


    val voiceProp = VoiceProp(
      telVoice = voiceBridge,
      voiceConf = voiceBridge,
      dialNumber = getParamAsString(ApiCreateParams.DIAL_NUMBER, "defaultDialAccessNumber", ""),
      // when a moderator joins in a breakout room only with the audio, and the muteOnStart is set to true,
      // the moderator is unable to unmute himself, because they don't have an icon to do so
      muteOnStart = if (isBreakout) false else getParamAsBoolean(ApiCreateParams.MUTE_ON_START, "muteOnStart", false)
    )



    var welcomeMessageTemplate = getParamAsString(ApiCreateParams.WELCOME,"defaultWelcomeMessage","")

    //Append footer if it's not breakoutRoom
    welcomeMessageTemplate = welcomeMessageTemplate + {
      config.getString("defaultWelcomeMessageFooter") match {
        case "" => ""
        case footerMsg => if(isBreakout) "" else "<br><br>" + footerMsg
      }
    }

//    val defaultWelcomeMessageFooter = Try(config.getString("defaultWelcomeMessageFooter")).getOrElse("")
//    if(!defaultWelcomeMessageFooter.isBlank && !isBreakout) {
//      welcomeMessageTemplate += "<br><br>" + defaultWelcomeMessageFooter;
//    }

    //Replace keywords
    def replaceKeywords(message: String): String = {
      var newMessage = message
      //TODO provavelmente nao funcionando
      newMessage = newMessage.replaceAll(welcomeMesssageKeywords.DIAL_NUM,voiceProp.dialNumber)
      newMessage = newMessage.replaceAll(welcomeMesssageKeywords.CONF_NUM,formatConfNum(voiceProp.telVoice))
      // TODO escapeHTMLTags

      newMessage = newMessage.replaceAll(welcomeMesssageKeywords.CONF_NAME,meetingProp.name)
      newMessage = newMessage.replaceAll(welcomeMesssageKeywords.SERVER_URL,voiceProp.telVoice)

      newMessage
    }


    //TODO  MEETING_ENDED_CALLBACK_URL
//    if (!StringUtils.isEmpty(params.get(ApiParams.MEETING_ENDED_CALLBACK_URL))) {
//      String meetingEndedCallbackURL = params.get(ApiParams.MEETING_ENDED_CALLBACK_URL);
//      meeting.setMeetingEndedCallbackURL(meetingEndedCallbackURL);
//    }


    val welcomeProp = WelcomeProp(
      welcomeMsgTemplate = replaceKeywords(welcomeMessageTemplate),
      welcomeMsg = "Hello!!",
      modOnlyMessage = replaceKeywords(getParamAsString(ApiCreateParams.MODERATOR_ONLY_MESSAGE)))



//    val maxUsers : String = params.getOrElse(ApiCreateParams.MAX_PARTICIPANTS, {
//        Try(config.getInt("defaultMaxUsers")).getOrElse("20")
//    })

    val usersProp = UsersProp(
      maxUsers = getParamAsInt(ApiCreateParams.MAX_PARTICIPANTS, "defaultMaxUsers", 20),
      webcamsOnlyForModerator = getParamAsBoolean(ApiCreateParams.WEBCAMS_ONLY_FOR_MODERATOR, "webcamsOnlyForModerator", false),
      userCameraCap = getParamAsInt(ApiCreateParams.USER_CAMERA_CAP, "userCameraCap", 3),
      guestPolicy = getParamAsString(ApiCreateParams.GUEST_POLICY, "defaultGuestPolicy", "ALWAYS_ACCEPT"),
      meetingLayout = getParamAsString(ApiCreateParams.MEETING_LAYOUT, "defaultMeetingLayout", "CUSTOM_LAYOUT"),
      allowModsToUnmuteUsers = getParamAsBoolean(ApiCreateParams.ALLOW_MODS_TO_UNMUTE_USERS,"allowModsToUnmuteUsers",false),
      allowModsToEjectCameras = getParamAsBoolean(ApiCreateParams.ALLOW_MODS_TO_EJECT_CAMERAS,"allowModsToEjectCameras",false),
      authenticatedGuest = Try(config.getString("authenticatedGuest")).getOrElse("true") == "true")


    // Collect metadata for this meeting that the third-party app wants to
    // store if meeting is recorded.
    //TODO migrate processMetaParam from ParamsProcessorUtil
    val metadataProp = MetadataProp(Map())


    val lockSettingsProps = LockSettingsProps(
      disableCam = getParamAsBoolean(ApiCreateParams.LOCK_SETTINGS_DISABLE_CAM,"lockSettingsDisableCam",false),
      disableMic = getParamAsBoolean(ApiCreateParams.LOCK_SETTINGS_DISABLE_MIC,"lockSettingsDisableMic",false),
      disablePrivateChat = getParamAsBoolean(ApiCreateParams.LOCK_SETTINGS_DISABLE_PRIVATE_CHAT,"lockSettingsDisablePrivateChat",false),
      disablePublicChat = getParamAsBoolean(ApiCreateParams.LOCK_SETTINGS_DISABLE_PUBLIC_CHAT,"lockSettingsDisablePublicChat",false),
      disableNotes = getParamAsBoolean(ApiCreateParams.LOCK_SETTINGS_DISABLE_NOTES,"lockSettingsDisableNotes",false),
      //TODO need?
      //DEPRECATED_LOCK_SETTINGS_DISABLE_NOTES
//      lockSettingsDisableNotesParam = params.get(ApiParams.DEPRECATED_LOCK_SETTINGS_DISABLE_NOTES);
//    if (!StringUtils.isEmpty(lockSettingsDisableNotesParam)) {
//      log.warn("[DEPRECATION] use lockSettingsDisableNotes instead of lockSettingsDisableNote");
//      lockSettingsDisableNotes = Boolean.parseBoolean(lockSettingsDisableNotesParam);
//    }
      hideUserList = getParamAsBoolean(ApiCreateParams.LOCK_SETTINGS_HIDE_USER_LIST,"lockSettingsHideUserList",false),
      lockedLayout = getParamAsBoolean(ApiCreateParams.LOCK_SETTINGS_LOCKED_LAYOUT,"lockSettingsLockedLayout",false),
      lockOnJoin = getParamAsBoolean(ApiCreateParams.LOCK_SETTINGS_LOCK_ON_JOIN,"lockSettingsLockOnJoin",true),
      lockOnJoinConfigurable = getParamAsBoolean(ApiCreateParams.LOCK_SETTINGS_LOCK_ON_JOIN_CONFIGURABLE,"lockSettingsLockOnJoinConfigurable",false),
      hideViewersCursor = getParamAsBoolean(ApiCreateParams.LOCK_SETTINGS_HIDE_VIEWERS_CURSOR,"lockSettingsHideViewersCursor",false)
    )

    val systemProps = SystemProps(
      html5InstanceId = 1
    )

    val defaultProps = DefaultProps(
      meetingProp,
      breakoutProps,
      durationProps,
      password,
      recordProp,
      welcomeProp,
      voiceProp,
      usersProp,
      metadataProp,
      lockSettingsProps,
      systemProps,
      processGroupsParams(getParamAsString(ApiCreateParams.GROUPS))
    )

    defaultProps

  }

    def processGroupsParams(groupParam: String) = {
      val groups = Vector()

      //TODO parse groups
//      val groupsParam = params.get(ApiParams.GROUPS)
//      if (!StringUtils.isEmpty(groupsParam)) {
//        val groupParamsJson = new Gson().fromJson(groupsParam, classOf[JsonElement])
//        if (groupParamsJson != null && groupParamsJson.isJsonArray) {
//          val groupsJson = groupParamsJson.getAsJsonArray
//          import scala.collection.JavaConversions._
//          for (groupJson <- groupsJson) {
//            if (groupJson.isJsonObject) {
//              val groupJsonObj = groupJson.getAsJsonObject
//              if (groupJsonObj.has("id")) {
//                val groupId = groupJsonObj.get("id").getAsString
//                var groupName = ""
//                if (groupJsonObj.has("name")) groupName = groupJsonObj.get("name").getAsString
//                val groupUsers = new Vector[String]
//                if (groupJsonObj.has("roster") && groupJsonObj.get("roster").isJsonArray) {
//                  import scala.collection.JavaConversions._
//                  for (userExtId <- groupJsonObj.get("roster").getAsJsonArray) {
//                    groupUsers.add(userExtId.getAsString)
//                  }
//                }
//                groups.add(new Group(groupId, groupName, groupUsers))
//              }
//            }
//          }
//        }
//      }
      groups
    }

}
