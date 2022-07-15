package org.bigbluebutton.api.meeting

case class RegisterUser(meetingId: String, intUserId: String, name: String, role: String,
                        extUserId: String, authToken: String, avatarURL: String,
                        guest: Boolean, authed: Boolean, guestStatus: String, excludeFromDashboard: Boolean)

object Join {
  def createRegisterUser(
      meetingId:            String,
      intUserId:            String,
      name:                 String,
      role:                 String,
      extUserId:            String,
      authToken:            String,
      avatarURL:            String,
      guest:                Boolean,
      authed:               Boolean,
      guestStatus:          String,
      excludeFromDashboard: Boolean
  ): RegisterUser = {
    // val disabledFeaturesAsVector: Vector[String] = disabledFeatures.asScala.toVector

    val regUser = RegisterUser(
      meetingId,
      intUserId,
      name,
      role,
      extUserId,
      authToken,
      avatarURL,
      guest,
      authed,
      guestStatus,
      excludeFromDashboard
    )

    regUser
  }
}
