package org.bigbluebutton.api.meeting.join

import org.apache.commons.lang3.RandomStringUtils
import org.bigbluebutton.api.meeting.{ParamsUtils, Utils}
import org.bigbluebutton.api.meeting.create.CreateParams



case class RegisterUser(meetingId: String, intUserId: String, name: String, role: String,
                        extUserId: String, authToken: String, avatarURL: String,
                        guest: Boolean, authed: Boolean, guestStatus: String, excludeFromDashboard: Boolean)

object Roles {
  val ROLE_MODERATOR = "MODERATOR"
  val ROLE_ATTENDEE = "VIEWER"

  val LIST = List(ROLE_MODERATOR, ROLE_ATTENDEE)
}

object Join {
  def createRegisterUser(
                          meetingId:            String,
                          params: Map[String, String],
//
//      intUserId:            String,
//      name:                 String,
//      role:                 String,
//      extUserId:            String,
//      authToken:            String,
//      avatarURL:            String,
//      guest:                Boolean,
//      authed:               Boolean,
//      guestStatus:          String,
//      excludeFromDashboard: Boolean
  ): RegisterUser = {
    // val disabledFeaturesAsVector: Vector[String] = disabledFeatures.asScala.toVector

    val paramsUtils = ParamsUtils(meetingId, params)

    // We preprend "w_" to our internal meeting Id to indicate that this is a web user.
    // For users joining using the phone, we will prepend "v_" so it will be easier
    // to distinguish users who doesn't have a web client. (ralam june 12, 2017)
    val internalUserID = "w_" + RandomStringUtils.randomAlphanumeric(12).toLowerCase
    val externUserID = params.getOrElse(CreateParams.ROLE, internalUserID)
    val authToken = RandomStringUtils.randomAlphanumeric(12).toLowerCase

    // Now determine if this user is a moderator or a viewer.
    val role : String = {
      if(!params.getOrElse(CreateParams.ROLE, "").isEmpty && Roles.LIST.contains(params.getOrElse(CreateParams.ROLE, "").toUpperCase)) {
        params.getOrElse(CreateParams.ROLE, "").toUpperCase
      } else if(!params.getOrElse(CreateParams.PASSWORD, "").isEmpty) {
        //TODO not sure if it will be imported since it is DEPRECATED
        ""
      } else {
        ""
      }
    }
    if(role.isBlank) {
      throw new Exception("Param 'role' is required.")
    }



    val guest = paramsUtils.getParamAsBoolean("guest","",false);

    val authenticated = {
      if (!paramsUtils.hasParam(JoinParams.AUTH)) {
        paramsUtils.getParamAsBoolean(JoinParams.AUTH,"",false)
      } else if(paramsUtils.hasParam(JoinParams.GUEST)) {
        // guest param has not been passed. Make user as
        // authenticated by default. (ralam july 3, 2018)
        true
      } else {
        false
      }
    }

    //TODO move to akka-apps
//    String guestStatusVal = meeting.calcGuestStatus(role, guest, authenticated)
    val guestStatusVal = "ALLOW"

    val regUser = RegisterUser(
      meetingId = meetingId,
      intUserId = internalUserID,
      name = Utils.stripControlChars(params.getOrElse(CreateParams.FULL_NAME, "")),
      role = role,
      extUserId = externUserID,
      authToken = authToken,
      avatarURL = paramsUtils.getParamAsString("avatarURL","defaultAvatarURL",""),
      guest = guest,
      authed = authenticated,
      guestStatus = guestStatusVal,
      excludeFromDashboard = paramsUtils.getParamAsBoolean("excludeFromDashboard","",false)
    )

    regUser
  }
}
