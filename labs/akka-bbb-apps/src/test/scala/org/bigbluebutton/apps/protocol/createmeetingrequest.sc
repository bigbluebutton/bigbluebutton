package org.bigbluebutton.apps.protocol

import spray.json._
import spray.json.JsonParser
import org.bigbluebutton.apps.models.MeetingConfig
import org.bigbluebutton.apps.protocol._
import org.bigbluebutton.apps.models.MeetingSession
import org.bigbluebutton.apps.models.UsersConfig
import org.bigbluebutton.apps.models.DurationConfig
import org.bigbluebutton.apps.models.VoiceConfig
import org.bigbluebutton.apps.models.PhoneNumberConfig
import spray.json.DefaultJsonProtocol

object createmeetingrequestWS {
  val createMeetingRequestMsg = """
{
    "header": {
        "name": "CreateMeeting",
        "timestamp": 123456,
        "correlation": "123abc",
        "source": "web-api"
    },
    "payload": {
        "meeting": {
            "name": "English 101",
            "externalId": "english_101",
            "record": true,
            "welcomeMessage": "Welcome to English 101",
            "logoutUrl": "http://www.bigbluebutton.org",
            "avatarUrl": "http://www.gravatar.com/bigbluebutton",
            "users": {
                "max": 20,
                "hardLimit": false
            },
            "duration": {
                "length": 120,
                "allowExtend": false,
                "warnBefore": 30
            },
            "voiceConf": {
                "pin": 123456,
                "number": 85115
            },
            "phoneNumbers": [
                {
                    "number": "613-520-7600",
                    "description": "Ottawa"
                },
                {
                    "number": "1-888-555-7890",
                    "description": "NA Toll-Free"
                }
            ],
            "metadata": {
                "customerId": "acme-customer",
                "customerName": "ACME"
            }
        }
    }
}
    """                                           //> createMeetingRequestMsg  : String = "
                                                  //| {
                                                  //|     "header": {
                                                  //|         "name": "CreateMeeting",
                                                  //|         "timestamp": 123456,
                                                  //|         "correlation": "123abc",
                                                  //|         "source": "web-api"
                                                  //|     },
                                                  //|     "payload": {
                                                  //|         "meeting": {
                                                  //|             "name": "English 101",
                                                  //|             "externalId": "english_101",
                                                  //|             "record": true,
                                                  //|             "welcomeMessage": "Welcome to English 101",
                                                  //|             "logoutUrl": "http://www.bigbluebutton.org",
                                                  //|             "avatarUrl": "http://www.gravatar.com/bigbluebutton",
                                                  //|             "users": {
                                                  //|                 "max": 20,
                                                  //|                 "hardLimit": false
                                                  //|             },
                                                  //|             "duration": {
                                                  //|                 "length": 120,
                                                  //|                 "allowExtend": false,
                                                  //|                 "warnBefore": 30
                                                  //|             },
                                                  //|             "voiceConf": {
                                                  //|                 "pin": 123456,
                                                  //|                 "number": 85115
                                                  //|             },

    import CreateMeetingRequestJsonProtocol1._
    
    val jsonAst = JsonParser(createMeetingRequestMsg)
                                                  //> jsonAst  : spray.json.JsValue = {"header":{"name":"CreateMeeting","timestam
                                                  //| p":123456,"correlation":"123abc","source":"web-api"},"payload":{"meeting":{
                                                  //| "name":"English 101","externalId":"english_101","record":true,"welcomeMessa
                                                  //| ge":"Welcome to English 101","logoutUrl":"http://www.bigbluebutton.org","av
                                                  //| atarUrl":"http://www.gravatar.com/bigbluebutton","users":{"max":20,"hardLim
                                                  //| it":false},"duration":{"length":120,"allowExtend":false,"warnBefore":30},"v
                                                  //| oiceConf":{"pin":123456,"number":85115},"phoneNumbers":[{"number":"613-520-
                                                  //| 7600","description":"Ottawa"},{"number":"1-888-555-7890","description":"NA 
                                                  //| Toll-Free"}],"metadata":{"customerId":"acme-customer","customerName":"ACME"
                                                  //| }}}}
    val jsonObj = jsonAst.asJsObject              //> jsonObj  : spray.json.JsObject = {"header":{"name":"CreateMeeting","timesta
                                                  //| mp":123456,"correlation":"123abc","source":"web-api"},"payload":{"meeting":
                                                  //| {"name":"English 101","externalId":"english_101","record":true,"welcomeMess
                                                  //| age":"Welcome to English 101","logoutUrl":"http://www.bigbluebutton.org","a
                                                  //| vatarUrl":"http://www.gravatar.com/bigbluebutton","users":{"max":20,"hardLi
                                                  //| mit":false},"duration":{"length":120,"allowExtend":false,"warnBefore":30},"
                                                  //| voiceConf":{"pin":123456,"number":85115},"phoneNumbers":[{"number":"613-520
                                                  //| -7600","description":"Ottawa"},{"number":"1-888-555-7890","description":"NA
                                                  //|  Toll-Free"}],"metadata":{"customerId":"acme-customer","customerName":"ACME
                                                  //| "}}}}
      val payloadObj = jsonObj.fields.get("payload").get.asJsObject
                                                  //> payloadObj  : spray.json.JsObject = {"meeting":{"name":"English 101","exter
                                                  //| nalId":"english_101","record":true,"welcomeMessage":"Welcome to English 101
                                                  //| ","logoutUrl":"http://www.bigbluebutton.org","avatarUrl":"http://www.gravat
                                                  //| ar.com/bigbluebutton","users":{"max":20,"hardLimit":false},"duration":{"len
                                                  //| gth":120,"allowExtend":false,"warnBefore":30},"voiceConf":{"pin":123456,"nu
                                                  //| mber":85115},"phoneNumbers":[{"number":"613-520-7600","description":"Ottawa
                                                  //| "},{"number":"1-888-555-7890","description":"NA Toll-Free"}],"metadata":{"c
                                                  //| ustomerId":"acme-customer","customerName":"ACME"}}}
      val headerObj = jsonObj.fields.get("header").get.asJsObject
                                                  //> headerObj  : spray.json.JsObject = {"name":"CreateMeeting","timestamp":1234
                                                  //| 56,"correlation":"123abc","source":"web-api"}
        val meeting = payloadObj.fields.get("meeting")
                                                  //> meeting  : Option[spray.json.JsValue] = Some({"name":"English 101","externa
                                                  //| lId":"english_101","record":true,"welcomeMessage":"Welcome to English 101",
                                                  //| "logoutUrl":"http://www.bigbluebutton.org","avatarUrl":"http://www.gravatar
                                                  //| .com/bigbluebutton","users":{"max":20,"hardLimit":false},"duration":{"lengt
                                                  //| h":120,"allowExtend":false,"warnBefore":30},"voiceConf":{"pin":123456,"numb
                                                  //| er":85115},"phoneNumbers":[{"number":"613-520-7600","description":"Ottawa"}
                                                  //| ,{"number":"1-888-555-7890","description":"NA Toll-Free"}],"metadata":{"cus
                                                  //| tomerId":"acme-customer","customerName":"ACME"}})
    if (meeting != None) {
        val m = meeting.get.convertTo[MeetingConfig]
    } else {
      None
    }                                             //> res0: Any = ()
    
case class Color(name: String, red: Int, green: Int, blue: Int)

object MyJsonProtocol extends DefaultJsonProtocol {
  implicit val colorFormat = jsonFormat4(Color)
}

import MyJsonProtocol._

val json = Color("CadetBlue", 95, 158, 160).toJson//> json  : spray.json.JsValue = {"name":"CadetBlue","red":95,"green":158,"blue
                                                  //| ":160}
val color = json.convertTo[Color]                 //> color  : org.bigbluebutton.apps.protocol.createmeetingrequestWS.Color = Col
                                                  //| or(CadetBlue,95,158,160)
                           
    val session = MeetingSession("English 101", "english_101", "english101-123456")
                                                  //> session  : org.bigbluebutton.apps.models.MeetingSession = MeetingSession(En
                                                  //| glish 101,english_101,english101-123456)
    
    val usersConfig = UsersConfig(20, true)       //> usersConfig  : org.bigbluebutton.apps.models.UsersConfig = UsersConfig(20,t
                                                  //| rue)
    val durationConfig = DurationConfig(320, true, 30)
                                                  //> durationConfig  : org.bigbluebutton.apps.models.DurationConfig = DurationCo
                                                  //| nfig(320,true,30)
    val voiceConfig = VoiceConfig(12345, 85115)   //> voiceConfig  : org.bigbluebutton.apps.models.VoiceConfig = VoiceConfig(1234
                                                  //| 5,85115)
    val phone1 = PhoneNumberConfig("613-520-5555", "Ottawa")
                                                  //> phone1  : org.bigbluebutton.apps.models.PhoneNumberConfig = PhoneNumberConf
                                                  //| ig(613-520-5555,Ottawa)
    val phone2 = PhoneNumberConfig("1-800-bbb-conf", "Toll Free")
                                                  //> phone2  : org.bigbluebutton.apps.models.PhoneNumberConfig = PhoneNumberConf
                                                  //| ig(1-800-bbb-conf,Toll Free)
    val metadata = Map("customerId" -> "acme-customer", "customerName" -> "ACME")
                                                  //> metadata  : scala.collection.immutable.Map[String,String] = Map(customerId 
                                                  //| -> acme-customer, customerName -> ACME)
    
    val meetingConfig = MeetingConfig("English 101", "english_101", true,
                "Welcome to English 101", "http://www.bigbluebutton.org",
                "http://www.gravatar.com/bigbluebutton",
                usersConfig, durationConfig, voiceConfig,
                Seq(phone1, phone2), metadata)    //> meetingConfig  : org.bigbluebutton.apps.models.MeetingConfig = MeetingConfi
                                                  //| g(English 101,english_101,true,Welcome to English 101,http://www.bigbluebut
                                                  //| ton.org,http://www.gravatar.com/bigbluebutton,UsersConfig(20,true),Duration
                                                  //| Config(320,true,30),VoiceConfig(12345,85115),List(PhoneNumberConfig(613-520
                                                  //| -5555,Ottawa), PhoneNumberConfig(1-800-bbb-conf,Toll Free)),Map(customerId 
                                                  //| -> acme-customer, customerName -> ACME))
    
    import org.bigbluebutton.apps.protocol.MyJsonProtocol._
    val reply = CreateMeetingRequestReply(session, meetingConfig).toJson
                                                  //> reply  : spray.json.JsValue = {"session":{"name":"English 101","externalId"
                                                  //| :"english_101","session":"english101-123456"},"meeting":{"name":"English 10
                                                  //| 1","externalId":"english_101","record":true,"welcomeMessage":"Welcome to En
                                                  //| glish 101","logoutUrl":"http://www.bigbluebutton.org","avatarUrl":"http://w
                                                  //| ww.gravatar.com/bigbluebutton","users":{"max":20,"hardLimit":true},"duratio
                                                  //| n":{"length":320,"allowExtend":true,"warnBefore":30},"voiceConf":{"pin":123
                                                  //| 45,"number":85115},"phoneNumbers":[{"number":"613-520-5555","description":"
                                                  //| Ottawa"},{"number":"1-800-bbb-conf","description":"Toll Free"}],"metadata":
                                                  //| {"customerId":"acme-customer","customerName":"ACME"}}}

    
}