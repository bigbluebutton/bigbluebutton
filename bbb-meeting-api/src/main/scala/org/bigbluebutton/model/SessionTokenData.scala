package org.bigbluebutton.model

import com.google.gson.Gson

//case class UserSession()

case class SessionTokenData(meetingId: String, userId: String) {
  def toJson = {
    val gson = new Gson
    gson.toJson(this)
  }
}
