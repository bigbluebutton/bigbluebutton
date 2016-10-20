package org.bigbluebutton.core

trait JsonMessageFixtures {
  val createBreakoutRoomsRequestMessage = """
  {"header":{"name":"CreateBreakoutRoomsRequest"},"payload":{"meetingId":"abc123","rooms":[{"name":"room1","users":["Tidora","Nidora","Tinidora"]},{"name":"room2","users":["Jose","Wally","Paolo"]},{"name":"room3","users":["Alden","Yaya Dub"]}],"durationInMinutes":20}}
 """

  val invalidCreateBreakoutRoomsRequestMessage = """
  {"header":{"name":"CreateBreakoutRoomsRequest"},"payload":{"meetingId2":"abc123","rooms":[{"name":"room1","users":["Tidora","Nidora","Tinidora"]},{"name":"room2","users":["Jose","Wally","Paolo"]},{"name":"room3","users":["Alden","Yaya Dub"]}],"durationInMinutes":20}}
 """
}