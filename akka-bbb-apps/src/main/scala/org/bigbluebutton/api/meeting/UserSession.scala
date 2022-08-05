package org.bigbluebutton.api.meeting

import com.softwaremill.session.{ MultiValueSessionSerializer, SessionSerializer, SingleValueSessionSerializer }

import scala.util.Try

//case class UserSession()

case class UserSession(meetingId: String, userId: String)

//case class UserSession(sessionTokens: Array[String])
//
//object UserSession {
//  implicit val serializer: SessionSerializer[UserSession, String] = new MultiValueSessionSerializer[UserSession](
//    (t: UserSession) => Map("sessionTokens" -> t.sessionTokens.mkString(",")),
//    m => Try { UserSession(m("sessionTokens").split(",")) }
//  )
//}

//case class UserSession(intId: String, accessTokens: Array[String])
//
//object UserSession {
//  implicit def serializer: SessionSerializer[UserSession, String] =
//    new MultiValueSessionSerializer[UserSession](
//      (session => Map(
//        "intId" -> session.intId,
//        "accessTokens" -> session.accessTokens.mkString(",")
//      )),
//      (uSessionmap => Try {
//        UserSession(
//          uSessionmap.get("intId").get,
//          uSessionmap.get("accessTokens").get.split(",")
//        )
//      })
//    )
//}