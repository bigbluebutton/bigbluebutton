package org.bigbluebutton.core

import scala.util.Success
import scala.util.Failure
import org.scalatest._
import org.bigbluebutton.core.api.CreateBreakoutRooms

class JsonMessageDecoderTests extends UnitSpec with JsonMessageFixtures {

  it should "fail to decode CreateBreakoutRoomsRequestMessage" in {
    JsonMessageDecoder.decode(invalidCreateBreakoutRoomsRequestMessage) match {
      case Some(validMsg) => fail("Should have failed to decode message")
      case None => assert(true)
    }
  }

}