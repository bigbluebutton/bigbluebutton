package org.bigbluebutton.common2.msgs

object Routing {
  val MSG_TYPE = "msgType"
  val MEETING_ID = "meetingId"
  val USER_ID = "userId"
  val HTML5_INSTANCE_ID = "html5InstanceId"

  def addMsgToClientRouting(msgType: String, meetingId: String, userId: String): collection.immutable.Map[String, String] = {
    Map(MSG_TYPE -> msgType, MEETING_ID -> meetingId, USER_ID -> userId)
  }

  def addMsgFromClientRouting(meetingId: String, userId: String): collection.immutable.Map[String, String] = {
    Map(MEETING_ID -> meetingId, USER_ID -> userId)
  }

  def addMsgToHtml5InstanceIdRouting(meetingId: String, html5InstanceId: String): collection.immutable.Map[String, String] = {
    Map(MEETING_ID -> meetingId, HTML5_INSTANCE_ID -> html5InstanceId)
  }
}

class Routing {

}
