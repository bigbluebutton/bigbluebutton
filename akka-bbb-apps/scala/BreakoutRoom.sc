import org.bigbluebutton.core.apps.BreakoutRoomModel
import org.bigbluebutton.core.apps.BreakoutRoomApp

object BreakoutRoom {
  val breakoutModel = new BreakoutRoomModel       //> breakoutModel  : org.bigbluebutton.core.apps.BreakoutRoomModel = org.bigblue
                                                  //| button.core.apps.BreakoutRoomModel@721d4bd9

  breakoutModel.createBreakoutRoom("1", "Room 1", "voice-1", Vector("user-1"), "default.pdf")
                                                  //> res0: org.bigbluebutton.core.apps.BreakoutRoom = BreakoutRoom(1,Room 1,voice
                                                  //| -1,Vector(user-1),Vector(),default.pdf)
  breakoutModel.createBreakoutRoom("2", "Room 2", "voice-2", Vector("user-2"), "default.pdf")
                                                  //> res1: org.bigbluebutton.core.apps.BreakoutRoom = BreakoutRoom(2,Room 2,voice
                                                  //| -2,Vector(user-2),Vector(),default.pdf)
  breakoutModel.getAssignedUsers("1")             //> res2: Option[Vector[String]] = Some(Vector(user-1))
  breakoutModel.getAssignedUsers("2")             //> res3: Option[Vector[String]] = Some(Vector(user-2))

  var breakoutRoomId = "1"                        //> breakoutRoomId  : String = 1

  breakoutModel.getAssignedUsers(breakoutRoomId) foreach { users =>
    users.foreach { u =>
      println(Vector(u, breakoutRoomId))
    }                                             //> Vector(user-1, 1)
  }

  breakoutRoomId = "2"

  breakoutModel.getAssignedUsers(breakoutRoomId) foreach { users =>
    users.foreach { u =>
      println(Vector(u, breakoutRoomId))
    }                                             //> Vector(user-2, 2)
  }
}