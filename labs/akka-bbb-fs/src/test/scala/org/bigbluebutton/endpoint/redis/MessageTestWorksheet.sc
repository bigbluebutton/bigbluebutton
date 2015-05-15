package org.bigbluebutton.endpoint.redis

import spray.json._
import spray.json.DefaultJsonProtocol._
import org.bigbluebutton.apps.users.protocol.UserMessagesProtocol._
import org.bigbluebutton.apps.users.protocol.UserJoinResponseJsonMessage
import spray.json.lenses.JsonLenses._
import spray.json.lenses._

object MessageTestWorksheet extends UsersMessageTestFixtures
             with UsersMessageJsonTestFixtures {



}