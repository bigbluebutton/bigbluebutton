package org.bigbluebutton.service

import com.typesafe.config.Config
import org.apache.commons.codec.digest.DigestUtils
import org.apache.commons.lang3.RandomStringUtils
import org.bigbluebutton.common2.domain._
import org.bigbluebutton.model.CreateParams
import org.bigbluebutton.service.{ParamsUtils, Utils}

import scala.collection.mutable
import scala.language.postfixOps
import scala.util.Try


object welcomeMesssageKeywords {
  val SERVER_URL = "%%SERVERURL%%"
  val DIAL_NUM = "%%DIAL_NUM%%"
  val CONF_NUM = "%%CONF_NUM%%"
  val CONF_NAME = "%%CONF_NAME%%"
}

object CreateService {

  def createDefaultProp(
                        meetingId: String,
                         params: Map[String, String],
                         config: Config
                       ): DefaultProps = {
    println("createDefaultProp")
    println(params)

    val paramsUtils = ParamsUtils(meetingId, params)


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

    //CreateParams.NAME

    val meetingName = Utils.stripControlChars(params.getOrElse(CreateParams.NAME, ""))

    //Disabled Features (add all from config + received from url param)
    //Clear list (unique and non-null)
    val disabledFeatures: Vector[String] = {
      Try(config.getString("defaultDisabledFeatures")).getOrElse("").split(",") ++
        paramsUtils.getParamAsString(CreateParams.DISABLED_FEATURES).split(",")
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
    val isBreakout = paramsUtils.getParamAsBoolean(CreateParams.IS_BREAKOUT,"",false)

    var externalMeetingId = paramsUtils.getParamAsString(CreateParams.MEETING_ID)


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
    val html5InstanceId = paramsUtils.getParamAsString(CreateParams.HTML5_INSTANCE_ID)


    var parentMeetingId = ""
    if (isBreakout) {
      internalMeetingId = paramsUtils.getParamAsString(CreateParams.MEETING_ID)
      parentMeetingId = paramsUtils.getParamAsString(CreateParams.PARENT_MEETING_ID)
      // We rebuild the the external meeting using the has of the parent
      // meeting, the shared timestamp and the sequence number
      val timeStamp: String = internalMeetingId.split("\\-")(1)
      val externalHash = DigestUtils.sha1Hex(parentMeetingId + "-" + timeStamp + "-" + paramsUtils.getParamAsString(CreateParams.SEQUENCE))
      externalMeetingId = externalHash + "-" + timeStamp
    }

    val meetingProp = MeetingProp(
      name = meetingName,
      extId = externalMeetingId,
      intId = internalMeetingId,
      meetingCameraCap = paramsUtils.getParamAsInt(CreateParams.MEETING_CAMERA_CAP,"meetingCameraCap",0),
      maxPinnedCameras = paramsUtils.getParamAsInt(CreateParams.MAX_PINNED_CAMERAS,"maxPinnedCameras",3),
      isBreakout = false,
      disabledFeatures = disabledFeatures,
      notifyRecordingIsOn = paramsUtils.getParamAsBoolean(CreateParams.NOTIFY_RECORDING_IS_ON,"notifyRecordingIsOn",false)
    )




//      params.getOrElse(CreateParams.RECORD, {
//        RandomStringUtils.randomNumeric(
//          Try(config.getInt("defaultNumDigitsForTelVoice")).getOrElse(5)
//        )
//      })



    val logoutTimer = paramsUtils.getParamAsInt(CreateParams.LOGOUT_TIMER,"clientLogoutTimerInMinutes",0)
    val bannerText = paramsUtils.getParamAsString(CreateParams.BANNER_TEXT)
    val bannerColor = paramsUtils.getParamAsString(CreateParams.BANNER_COLOR)


    //val createDatetime = DateTime.now(DateTimeZone).getMillis()


    val durationProps = DurationProps(
      duration = paramsUtils.getParamAsInt(CreateParams.DURATION,"defaultMeetingDuration",-1),
      createDatetime,
      (new java.util.Date(createDatetime)).toString,
      meetingExpireIfNoUserJoinedInMinutes = paramsUtils.getParamAsInt(CreateParams.MEETING_EXPIRE_IF_NO_USER_JOINED_IN_MINUTES,"meetingExpireIfNoUserJoinedInMinutes",5),
      meetingExpireWhenLastUserLeftInMinutes = paramsUtils.getParamAsInt(CreateParams.MEETING_EXPIRE_WHEN_LAST_USER_LEFT_IN_MINUTES,"meetingExpireWhenLastUserLeftInMinutes",1),
      userInactivityInspectTimerInMinutes = Try(config.getInt("userInactivityInspectTimerInMinutes")).getOrElse(120),
      userInactivityThresholdInMinutes = Try(config.getInt("userInactivityThresholdInMinutes")).getOrElse(30),
      userActivitySignResponseDelayInMinutes = Try(config.getInt("userActivitySignResponseDelayInMinutes")).getOrElse(5),
      endWhenNoModerator = paramsUtils.getParamAsBoolean(CreateParams.END_WHEN_NO_MODERATOR,"endWhenNoModerator",false),
      endWhenNoModeratorDelayInMinutes = paramsUtils.getParamAsInt(CreateParams.END_WHEN_NO_MODERATOR_DELAY_IN_MINUTES,"endWhenNoModeratorDelayInMinutes",1),
    )

      //Generate token to access Activity Report
      val learningDashboardAccessToken = {
        if (!disabledFeatures.contains("learningDashboard")) RandomStringUtils.randomAlphanumeric(12).toLowerCase
        else ""
      }

    val password = PasswordProp(
      moderatorPass = paramsUtils.getParamAsString(CreateParams.MODERATOR_PW),
      viewerPass = paramsUtils.getParamAsString(CreateParams.ATTENDEE_PW),
      learningDashboardAccessToken = learningDashboardAccessToken)


    val record : Boolean = {
      Try(config.getBoolean("disableRecordingDefault")).getOrElse(false) match {
        case true => {
          //log.info("Recording is turned OFF by default.")
          false
        }
        case false => paramsUtils.getParamAsBoolean(CreateParams.RECORD,"",false)
      }
    }

    val recordProp = RecordProp(
      record = record,
      autoStartRecording = paramsUtils.getParamAsBoolean(CreateParams.AUTO_START_RECORDING,"autoStartRecording",false),
      allowStartStopRecording = paramsUtils.getParamAsBoolean(CreateParams.ALLOW_START_STOP_RECORDING,"allowStartStopRecording",true),
      keepEvents = paramsUtils.getParamAsBoolean(CreateParams.MEETING_KEEP_EVENTS,"defaultKeepEvents",false)
    )


    val breakoutProps = {
      if (isBreakout) {
        BreakoutProps(
          parentId = parentMeetingId,
          sequence = paramsUtils.getParamAsInt(CreateParams.SEQUENCE,"",0),
          freeJoin = paramsUtils.getParamAsBoolean(CreateParams.FREE_JOIN,"",false),
          breakoutRooms = Vector(),
          record = paramsUtils.getParamAsBoolean(CreateParams.BREAKOUT_ROOMS_RECORD,"breakoutRoomsRecord",false),
          privateChatEnabled = paramsUtils.getParamAsBoolean(CreateParams.BREAKOUT_ROOMS_PRIVATE_CHAT_ENABLED,"breakoutRoomsPrivateChatEnabled", true)
        )
      } else {
        BreakoutProps(
          parentId = "bbb-none",
          sequence = 0,
          freeJoin = false,
          breakoutRooms = Vector(),
          record = paramsUtils.getParamAsBoolean(CreateParams.BREAKOUT_ROOMS_RECORD,"breakoutRoomsRecord",false),
          privateChatEnabled = paramsUtils.getParamAsBoolean(CreateParams.BREAKOUT_ROOMS_PRIVATE_CHAT_ENABLED,"breakoutRoomsPrivateChatEnabled", true)
        )
      }
    }


    val voiceBridge = params.getOrElse(CreateParams.VOICE_BRIDGE, {
      RandomStringUtils.randomNumeric(
        Try(config.getInt("defaultNumDigitsForTelVoice")).getOrElse(5)
      )
    })

    //WEB_VOICE ?

    //val dialNumber =
    //webvoice?

//    val dialNumber = params.getOrElse(CreateParams.DIAL_NUMBER, {
//      Try(config.getString("defaultDialAccessNumber")).getOrElse("")
//    })

    val logoutUrl:String = params.getOrElse(CreateParams.LOGOUT_URL, {
      Try(config.getString("bigbluebutton.web.logoutURL")).getOrElse("") match {
        case "" | "default" => Try(config.getString("bigbluebutton.web.serverURL")).getOrElse("")
        case logoutUrl => logoutUrl
      }
    })


    val voiceProp = VoiceProp(
      telVoice = voiceBridge,
      voiceConf = voiceBridge,
      dialNumber = paramsUtils.getParamAsString(CreateParams.DIAL_NUMBER, "defaultDialAccessNumber", ""),
      // when a moderator joins in a breakout room only with the audio, and the muteOnStart is set to true,
      // the moderator is unable to unmute himself, because they don't have an icon to do so
      muteOnStart = if (isBreakout) false else paramsUtils.getParamAsBoolean(CreateParams.MUTE_ON_START, "muteOnStart", false)
    )



    var welcomeMessageTemplate = paramsUtils.getParamAsString(CreateParams.WELCOME,"defaultWelcomeMessage","")

    //Append footer if it's not breakoutRoom
    welcomeMessageTemplate = welcomeMessageTemplate + {
      Try(config.getString("defaultWelcomeMessageFooter")).getOrElse("true") match {
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
      modOnlyMessage = replaceKeywords(paramsUtils.getParamAsString(CreateParams.MODERATOR_ONLY_MESSAGE)))



//    val maxUsers : String = params.getOrElse(CreateParams.MAX_PARTICIPANTS, {
//        Try(config.getInt("defaultMaxUsers")).getOrElse("20")
//    })

    val usersProp = UsersProp(
      maxUsers = paramsUtils.getParamAsInt(CreateParams.MAX_PARTICIPANTS, "defaultMaxUsers", 20),
      webcamsOnlyForModerator = paramsUtils.getParamAsBoolean(CreateParams.WEBCAMS_ONLY_FOR_MODERATOR, "webcamsOnlyForModerator", false),
      userCameraCap = paramsUtils.getParamAsInt(CreateParams.USER_CAMERA_CAP, "userCameraCap", 3),
      guestPolicy = paramsUtils.getParamAsString(CreateParams.GUEST_POLICY, "defaultGuestPolicy", "ALWAYS_ACCEPT"),
      meetingLayout = paramsUtils.getParamAsString(CreateParams.MEETING_LAYOUT, "defaultMeetingLayout", "CUSTOM_LAYOUT"),
      allowModsToUnmuteUsers = paramsUtils.getParamAsBoolean(CreateParams.ALLOW_MODS_TO_UNMUTE_USERS,"allowModsToUnmuteUsers",false),
      allowModsToEjectCameras = paramsUtils.getParamAsBoolean(CreateParams.ALLOW_MODS_TO_EJECT_CAMERAS,"allowModsToEjectCameras",false),
      authenticatedGuest = Try(config.getString("authenticatedGuest")).getOrElse("true") == "true")


    // Collect metadata for this meeting that the third-party app wants to
    // store if meeting is recorded.
    //TODO migrate processMetaParam from ParamsProcessorUtil
    val metadataProp = MetadataProp(Map())


    val lockSettingsProps = LockSettingsProps(
      disableCam = paramsUtils.getParamAsBoolean(CreateParams.LOCK_SETTINGS_DISABLE_CAM,"lockSettingsDisableCam",false),
      disableMic = paramsUtils.getParamAsBoolean(CreateParams.LOCK_SETTINGS_DISABLE_MIC,"lockSettingsDisableMic",false),
      disablePrivateChat = paramsUtils.getParamAsBoolean(CreateParams.LOCK_SETTINGS_DISABLE_PRIVATE_CHAT,"lockSettingsDisablePrivateChat",false),
      disablePublicChat = paramsUtils.getParamAsBoolean(CreateParams.LOCK_SETTINGS_DISABLE_PUBLIC_CHAT,"lockSettingsDisablePublicChat",false),
      disableNotes = paramsUtils.getParamAsBoolean(CreateParams.LOCK_SETTINGS_DISABLE_NOTES,"lockSettingsDisableNotes",false),
      //TODO need?
      //DEPRECATED_LOCK_SETTINGS_DISABLE_NOTES
//      lockSettingsDisableNotesParam = params.get(ApiParams.DEPRECATED_LOCK_SETTINGS_DISABLE_NOTES);
//    if (!StringUtils.isEmpty(lockSettingsDisableNotesParam)) {
//      log.warn("[DEPRECATION] use lockSettingsDisableNotes instead of lockSettingsDisableNote");
//      lockSettingsDisableNotes = Boolean.parseBoolean(lockSettingsDisableNotesParam);
//    }
      hideUserList = paramsUtils.getParamAsBoolean(CreateParams.LOCK_SETTINGS_HIDE_USER_LIST,"lockSettingsHideUserList",false),
      lockedLayout = paramsUtils.getParamAsBoolean(CreateParams.LOCK_SETTINGS_LOCKED_LAYOUT,"lockSettingsLockedLayout",false),
      lockOnJoin = paramsUtils.getParamAsBoolean(CreateParams.LOCK_SETTINGS_LOCK_ON_JOIN,"lockSettingsLockOnJoin",true),
      lockOnJoinConfigurable = paramsUtils.getParamAsBoolean(CreateParams.LOCK_SETTINGS_LOCK_ON_JOIN_CONFIGURABLE,"lockSettingsLockOnJoinConfigurable",false),
      hideViewersCursor = paramsUtils.getParamAsBoolean(CreateParams.LOCK_SETTINGS_HIDE_VIEWERS_CURSOR,"lockSettingsHideViewersCursor",false)
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
      processGroupsParams(paramsUtils.getParamAsString(CreateParams.GROUPS))
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
