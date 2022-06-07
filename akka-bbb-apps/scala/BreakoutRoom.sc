import com.google.gson.Gson
import org.bigbluebutton.messages.BreakoutRoomJoinURL

object BreakoutRoom {
  val gson = new Gson                             //> gson  : com.google.gson.Gson = {serializeNulls:falsefactories:[Factory[typeH
                                                  //| ierarchy=com.google.gson.JsonElement,adapter=com.google.gson.internal.bind.T
                                                  //| ypeAdapters$29@6979e8cb], com.google.gson.internal.bind.ObjectTypeAdapter$1@
                                                  //| 763d9750, com.google.gson.internal.Excluder@5c0369c4, Factory[type=java.lang
                                                  //| .String,adapter=com.google.gson.internal.bind.TypeAdapters$16@2be94b0f], Fac
                                                  //| tory[type=java.lang.Integer+int,adapter=com.google.gson.internal.bind.TypeAd
                                                  //| apters$7@d70c109], Factory[type=java.lang.Boolean+boolean,adapter=com.google
                                                  //| .gson.internal.bind.TypeAdapters$3@17ed40e0], Factory[type=java.lang.Byte+by
                                                  //| te,adapter=com.google.gson.internal.bind.TypeAdapters$5@50675690], Factory[t
                                                  //| ype=java.lang.Short+short,adapter=com.google.gson.internal.bind.TypeAdapters
                                                  //| $6@31b7dea0], Factory[type=java.lang.Long+long,adapter=com.google.gson.inter
                                                  //| nal.bind.TypeAdapters$11@3ac42916], Factory[type=java.lang.Double+double,ada
                                                  //| pter=com.google.gson.Gso
                                                  //| Output exceeds cutoff limit.

  val string = "{\"payload\":{\"redirectJoinUrl\":\"alink\",\"breakoutMeetingId\":\"4455e780b6f62cd5fcf09367aef62d9bc5108375-1479728671031\",\"redirectToHtml5JoinUrl\":\"http://bbb.riadvice.com/bigbluebutton/api/join?fullName\u003dOpera\u0026isBreakout\u003dtrue\u0026meetingID\u003d4455e780b6f62cd5fcf09367aef62d9bc5108375-1479728671031\u0026password\u003dmp\u0026redirect\u003dfalse\u0026userID\u003d6pt0vfeaxdze_1-1\u0026checksum\u003d51c4a1398b88170c25f1a71521bca604e784ab23\",\"parentMeetingId\":\"183f0bf3a0982a127bdb8161e0c44eb696b3e75c-1479728593178\",\"userId\":\"6pt0vfeaxdze_1\"},\"header\":{\"name\":\"BreakoutRoomJoinURL\",\"version\":\"0.0.1\",\"current_time\":1479728673586,\"timestamp\":8549632}}"
                                                  //> string  : String = {"payload":{"redirectJoinUrl":"alink","breakoutMeetingId"
                                                  //| :"4455e780b6f62cd5fcf09367aef62d9bc5108375-1479728671031","noRedirectJoinUrl
                                                  //| ":"http://bbb.riadvice.com/bigbluebutton/api/join?fullName=Opera&isBreakout=
                                                  //| true&meetingID=4455e780b6f62cd5fcf09367aef62d9bc5108375-1479728671031&passwo
                                                  //| rd=mp&redirect=false&userID=6pt0vfeaxdze_1-1&checksum=51c4a1398b88170c25f1a7
                                                  //| 1521bca604e784ab23","parentMeetingId":"183f0bf3a0982a127bdb8161e0c44eb696b3e
                                                  //| 75c-1479728593178","userId":"6pt0vfeaxdze_1"},"header":{"name":"BreakoutRoom
                                                  //| JoinURL","version":"0.0.1","current_time":1479728673586,"timestamp":8549632}
                                                  //| }
  val brjum: BreakoutRoomJoinURL = gson.fromJson(string, classOf[BreakoutRoomJoinURL])
                                                  //> brjum  : org.bigbluebutton.messages.BreakoutRoomJoinURL = org.bigbluebutton.
                                                  //| messages.BreakoutRoomJoinURL@3327bd23

  println(brjum.payload.userId)                   //> 6pt0vfeaxdze_1
  println(brjum.payload.parentMeetingId)          //> 183f0bf3a0982a127bdb8161e0c44eb696b3e75c-1479728593178
  println(brjum.payload.breakoutMeetingId)        //> 4455e780b6f62cd5fcf09367aef62d9bc5108375-1479728671031
  println(brjum.payload.redirectJoinURL)          //> null
  println(brjum.payload.redirectToHtml5JoinURL)        //> null
}