package org.bigbluebutton.core.domain

case class BreakoutRoom2x(
    id:            String,
    externalId:    String,
    name:          String,
    parentId:      String,
    sequence:      Int,
    freeJoin:      Boolean,
    voiceConf:     String,
    assignedUsers: Vector[String],
    users:         Vector[BreakoutUser],
    voiceUsers:    Vector[BreakoutVoiceUser],
    startedOn:     Option[Long],
    started:       Boolean
) {

}

case class BreakoutUser(id: String, name: String)
case class BreakoutVoiceUser(id: String, extId: String, voiceUserId: String)