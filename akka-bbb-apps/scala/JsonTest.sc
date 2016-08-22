import org.bigbluebutton.core.api._
import scala.util.{ Try, Success, Failure }
import org.bigbluebutton.core.JsonMessageDecoder
import org.bigbluebutton.messages.BreakoutRoomsList
import org.bigbluebutton.messages.payload.BreakoutRoomsListPayload
import java.util.ArrayList
import org.bigbluebutton.core.messaging.Util
import org.bigbluebutton.messages.payload.BreakoutRoomPayload
import org.bigbluebutton.core.pubsub.senders.MeetingMessageToJsonConverter
import spray.json._
import DefaultJsonProtocol._
import com.google.gson.JsonArray
import scala.collection.mutable.ListBuffer

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

  val xmsg = new CreateBreakoutRooms("test-meeting", 10, false, Vector(xroom1, xroom2, xroom3))
                                                  //> xmsg  : org.bigbluebutton.core.api.CreateBreakoutRooms = CreateBreakoutRoom
                                                  //| s(test-meeting,10,false,Vector(BreakoutRoomInPayload(foo,Vector(a, b, c)), 
                                                  //| BreakoutRoomInPayload(bar,Vector(x, y, z)), BreakoutRoomInPayload(baz,Vecto
                                                  //| r(q, r, s))))

  val xjsonAst = xmsg.toJson                      //> xjsonAst  : spray.json.JsValue = {"meetingId":"test-meeting","durationInMin
                                                  //| utes":10,"record":false,"rooms":[{"name":"foo","users":["a","b","c"]},{"nam
                                                  //| e":"bar","users":["x","y","z"]},{"name":"baz","users":["q","r","s"]}]}
  val xjson = xjsonAst.asJsObject                 //> xjson  : spray.json.JsObject = {"meetingId":"test-meeting","durationInMinut
                                                  //| es":10,"record":false,"rooms":[{"name":"foo","users":["a","b","c"]},{"name"
                                                  //| :"bar","users":["x","y","z"]},{"name":"baz","users":["q","r","s"]}]}
  val meetingId = for {
    meetingId <- xjson.fields.get("meetingId")
  } yield meetingId                               //> meetingId  : Option[spray.json.JsValue] = Some("test-meeting")

  val cbrm = """
  {"header":{"name":"CreateBreakoutRoomsRequest"},"payload":{"meetingId":"abc123","rooms":[{"name":"room1","users":["Tidora","Nidora","Tinidora"]},{"name":"room2","users":["Jose","Wally","Paolo"]},{"name":"room3","users":["Alden","Yaya Dub"]}],"durationInMinutes":20}}
 """                                              //> cbrm  : String = "
                                                  //|   {"header":{"name":"CreateBreakoutRoomsRequest"},"payload":{"meetingId":"a
                                                  //| bc123","rooms":[{"name":"room1","users":["Tidora","Nidora","Tinidora"]},{"n
                                                  //| ame":"room2","users":["Jose","Wally","Paolo"]},{"name":"room3","users":["Al
                                                  //| den","Yaya Dub"]}],"durationInMinutes":20}}
                                                  //|  "

  JsonMessageDecoder.decode(cbrm)                 //> res0: Option[org.bigbluebutton.core.api.InMessage] = None
  val rbju = """
  {"header":{"name":"RequestBreakoutJoinURL"},"payload":{"userId":"id6pa5t8m1c9_1","meetingId":"183f0bf3a0982a127bdb8161e0c44eb696b3e75c-1452692983357","breakoutId":"183f0bf3a0982a127bdb8161e0c44eb696b3e75c-1452692983357-2"}}
 """                                              //> rbju  : String = "
                                                  //|   {"header":{"name":"RequestBreakoutJoinURL"},"payload":{"userId":"id6pa5t8
                                                  //| m1c9_1","meetingId":"183f0bf3a0982a127bdb8161e0c44eb696b3e75c-1452692983357
                                                  //| ","breakoutId":"183f0bf3a0982a127bdb8161e0c44eb696b3e75c-1452692983357-2"}}
                                                  //| 
                                                  //|  "

  JsonMessageDecoder.decode(rbju)                 //> res1: Option[org.bigbluebutton.core.api.InMessage] = Some(RequestBreakoutJo
                                                  //| inURLInMessage(183f0bf3a0982a127bdb8161e0c44eb696b3e75c-1452692983357,183f0
                                                  //| bf3a0982a127bdb8161e0c44eb696b3e75c-1452692983357-2,id6pa5t8m1c9_1))

  val brl = """
  {"payload":{"meetingId":"183f0bf3a0982a127bdb8161e0c44eb696b3e75c-1452849036428","rooms":{"startIndex":0,"endIndex":0,"focus":0,"dirty":false,"depth":0}},"header":{"timestamp":33619724,"name":"BreakoutRoomsList","current_time":1452849043547,"version":"0.0.1"}}
  """                                             //> brl  : String = "
                                                  //|   {"payload":{"meetingId":"183f0bf3a0982a127bdb8161e0c44eb696b3e75c-1452849
                                                  //| 036428","rooms":{"startIndex":0,"endIndex":0,"focus":0,"dirty":false,"depth
                                                  //| ":0}},"header":{"timestamp":33619724,"name":"BreakoutRoomsList","current_ti
                                                  //| me":1452849043547,"version":"0.0.1"}}
                                                  //|   "

  val brb = new BreakoutRoomBody("Breakout Room", "br-id-1");
                                                  //> brb  : org.bigbluebutton.core.api.BreakoutRoomBody = BreakoutRoomBody(Break
                                                  //| out Room,br-id-1)

  val jsObj = JsObject(
    "name" -> JsString(brb.name),
    "breakoutId" -> JsString(brb.breakoutId))     //> jsObj  : spray.json.JsObject = {"name":"Breakout Room","breakoutId":"br-id-
                                                  //| 1"}

  val vector = Vector(jsObj)                      //> vector  : scala.collection.immutable.Vector[spray.json.JsObject] = Vector({
                                                  //| "name":"Breakout Room","breakoutId":"br-id-1"})

  val brlum = new BreakoutRoomsListOutMessage("main-meeting-1", Vector(brb), false)
                                                  //> brlum  : org.bigbluebutton.core.api.BreakoutRoomsListOutMessage = BreakoutR
                                                  //| oomsListOutMessage(main-meeting-1,Vector(BreakoutRoomBody(Breakout Room,br-
                                                  //| id-1)),false)
  var roomsJsVector: ListBuffer[JsObject] = new ListBuffer[JsObject]()
                                                  //> roomsJsVector  : scala.collection.mutable.ListBuffer[spray.json.JsObject] =
                                                  //|  ListBuffer()
  brlum.rooms.foreach { r =>
    roomsJsVector.append(JsObject("name" -> JsString(r.name), "breakoutId" -> JsString(r.breakoutId)))
  }

  roomsJsVector.length                            //> res2: Int = 1

  val jsonAst = List(1, 2, 3).toJson              //> jsonAst  : spray.json.JsValue = [1,2,3]

  roomsJsVector.toList.toJson                     //> res3: spray.json.JsValue = [{"name":"Breakout Room","breakoutId":"br-id-1"}
                                                  //| ]
  JsArray(roomsJsVector.toVector)                 //> res4: spray.json.JsArray = [{"name":"Breakout Room","breakoutId":"br-id-1"}
                                                  //| ]

  MeetingMessageToJsonConverter.breakoutRoomsListOutMessageToJson(brlum);
                                                  //> res5: String = {"payload":{"meetingId":"main-meeting-1","roomsReady":false,
                                                  //| "rooms":[{"name":"Breakout Room","breakoutId":"br-id-1"}]},"header":{"times
                                                  //| tamp":9652644,"name":"BreakoutRoomsList","current_time":1471504366540,"vers
                                                  //| ion":"0.0.1"}}

  //  JsonMessageDecoder.unmarshall(cbrm) match {
  //    case Success(validMsg) => println(validMsg)
  //    case Failure(ex) => println("Unhandled message: [{}]")
  //  }

}