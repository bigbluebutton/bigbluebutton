import org.bigbluebutton.core.api._
import scala.util.{Try, Success, Failure}
//import org.bigbluebutton.core.JsonMessageDecoder

object JsonTest {
  import org.bigbluebutton.core.UserMessagesProtocol._
  import spray.json._
  
  println("Welcome to the Scala worksheet")       //> Welcome to the Scala worksheet
   
  val xroom1 = new BreakoutRoomInPayload("foo", Vector("a", "b", "c"))
                                                  //> xroom1  : org.bigbluebutton.core.api.BreakoutRoomInPayload = BreakoutRoomInP
                                                  //| ayload(foo,Vector(a, b, c))
  val xroom2 = new BreakoutRoomInPayload("bar", Vector("x", "y", "z"))
                                                  //> xroom2  : org.bigbluebutton.core.api.BreakoutRoomInPayload = BreakoutRoomInP
                                                  //| ayload(bar,Vector(x, y, z))
  val xroom3 = new BreakoutRoomInPayload("baz", Vector("q", "r", "s"))
                                                  //> xroom3  : org.bigbluebutton.core.api.BreakoutRoomInPayload = BreakoutRoomInP
                                                  //| ayload(baz,Vector(q, r, s))

  val xmsg = new CreateBreakoutRooms("test-meeting", 10, Vector(xroom1, xroom2, xroom3))
                                                  //> xmsg  : org.bigbluebutton.core.api.CreateBreakoutRooms = CreateBreakoutRooms
                                                  //| (test-meeting,10,Vector(BreakoutRoomInPayload(foo,Vector(a, b, c)), Breakout
                                                  //| RoomInPayload(bar,Vector(x, y, z)), BreakoutRoomInPayload(baz,Vector(q, r, s
                                                  //| ))))
     
  val xjsonAst = xmsg.toJson                      //> xjsonAst  : spray.json.JsValue = {"meetingId":"test-meeting","durationInMinu
                                                  //| tes":10,"rooms":[{"name":"foo","users":["a","b","c"]},{"name":"bar","users":
                                                  //| ["x","y","z"]},{"name":"baz","users":["q","r","s"]}]}
  val xjson = xjsonAst.asJsObject                 //> xjson  : spray.json.JsObject = {"meetingId":"test-meeting","durationInMinute
                                                  //| s":10,"rooms":[{"name":"foo","users":["a","b","c"]},{"name":"bar","users":["
                                                  //| x","y","z"]},{"name":"baz","users":["q","r","s"]}]}
  val meetingId = for {
   meetingId <-  xjson.fields.get("meetingId")
  } yield meetingId                               //> meetingId  : Option[spray.json.JsValue] = Some("test-meeting")
   
  println(meetingId)                              //> Some("test-meeting")
  

  val cbrm = """
  {"header":{"name":"CreateBreakoutRoomsRequest"},"payload":{"meetingId":"abc123","rooms":[{"name":"room1","users":["Tidora","Nidora","Tinidora"]},{"name":"room2","users":["Jose","Wally","Paolo"]},{"name":"room3","users":["Alden","Yaya Dub"]}],"durationInMinutes":20}}
 """                                              //> cbrm  : String = "
                                                  //|   {"header":{"name":"CreateBreakoutRoomsRequest"},"payload":{"meetingId":"a
                                                  //| bc123","rooms":[{"name":"room1","users":["Tidora","Nidora","Tinidora"]},{"n
                                                  //| ame":"room2","users":["Jose","Wally","Paolo"]},{"name":"room3","users":["Al
                                                  //| den","Yaya Dub"]}],"durationInMinutes":20}}
                                                  //|  "
 
  println(cbrm)                                   //> 
                                                  //|   {"header":{"name":"CreateBreakoutRoomsRequest"},"payload":{"meetingId":"a
                                                  //| bc123","rooms":[{"name":"room1","users":["Tidora","Nidora","Tinidora"]},{"n
                                                  //| ame":"room2","users":["Jose","Wally","Paolo"]},{"name":"room3","users":["Al
                                                  //| den","Yaya Dub"]}],"durationInMinutes":20}}
                                                  //|  
 
//  JsonMessageDecoder.unmarshall(cbrm) match {
//    case Success(validMsg) => println(validMsg)
//    case Failure(ex) => println("Unhandled message: [{}]")
//  }
 
}