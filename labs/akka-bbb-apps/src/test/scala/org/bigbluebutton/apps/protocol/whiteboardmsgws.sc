package org.bigbluebutton.apps.protocol

import spray.json._
import org.bigbluebutton.apps.models._


  
object whiteboardmsgws {
  val wbmsg = """
{

        "id": "user1-shape-1",
        "correlationId": "q779ogycfmxk-13-1383262166102",
        "type": "text",
        "data": {
            "coordinate": {
                "firstX": 0.016025641025641028,
                "firstY": 0.982905982905983,
                "lastX": 1.33,
                "lastY": 2.45
            },
            "font": {
                "color": 0,
                "size": 18
            },
            "background": true,
            "backgroundColor": 16777215,
            "text": "He"
        },
        "by": {
            "id": "user1",
            "name": "Guga"
        }

}
  """                                             //> wbmsg  : String = "
                                                  //| {
                                                  //| 
                                                  //|         "id": "user1-shape-1",
                                                  //|         "correlationId": "q779ogycfmxk-13-1383262166102",
                                                  //|         "type": "text",
                                                  //|         "data": {
                                                  //|             "coordinate": {
                                                  //|                 "firstX": 0.016025641025641028,
                                                  //|                 "firstY": 0.982905982905983,
                                                  //|                 "lastX": 1.33,
                                                  //|                 "lastY": 2.45
                                                  //|             },
                                                  //|             "font": {
                                                  //|                 "color": 0,
                                                  //|                 "size": 18
                                                  //|             },
                                                  //|             "background": true,
                                                  //|             "backgroundColor": 16777215,
                                                  //|             "text": "He"
                                                  //|         },
                                                  //|         "by": {
                                                  //|             "id": "user1",
                                                  //|             "name": "Guga"
                                                  //|         }
                                                  //| 
                                                  //| }
                                                  //|   "
  
  case class Shape(id: String, correlationId: String, data: Map[String, String], by: Map[String, String])

	object ShapeJsonProtocol extends DefaultJsonProtocol {
	  implicit val shapeFormat = jsonFormat4(Shape)
	}
	
	import ShapeJsonProtocol._
	
	val jsonAst = JsonParser(wbmsg)           //> jsonAst  : spray.json.JsValue = {"id":"user1-shape-1","correlationId":"q779
                                                  //| ogycfmxk-13-1383262166102","type":"text","data":{"coordinate":{"firstX":0.0
                                                  //| 16025641025641028,"firstY":0.982905982905983,"lastX":1.33,"lastY":2.45},"fo
                                                  //| nt":{"color":0,"size":18},"background":true,"backgroundColor":16777215,"tex
                                                  //| t":"He"},"by":{"id":"user1","name":"Guga"}}
  val jsonObj = jsonAst.asJsObject                //> jsonObj  : spray.json.JsObject = {"id":"user1-shape-1","correlationId":"q77
                                                  //| 9ogycfmxk-13-1383262166102","type":"text","data":{"coordinate":{"firstX":0.
                                                  //| 016025641025641028,"firstY":0.982905982905983,"lastX":1.33,"lastY":2.45},"f
                                                  //| ont":{"color":0,"size":18},"background":true,"backgroundColor":16777215,"te
                                                  //| xt":"He"},"by":{"id":"user1","name":"Guga"}}
  val typeObj = jsonObj.fields.get("type").get    //> typeObj  : spray.json.JsValue = "text"
  val dataObj = jsonObj.fields.get("data").get.asJsObject
                                                  //> dataObj  : spray.json.JsObject = {"coordinate":{"firstX":0.0160256410256410
                                                  //| 28,"firstY":0.982905982905983,"lastX":1.33,"lastY":2.45},"font":{"color":0,
                                                  //| "size":18},"background":true,"backgroundColor":16777215,"text":"He"}
  
  val userJoinMessage = """
  {
      "name": "user_join",
      "timestamp": 123456,
      "meeting": {
          "id": "english_101",
          "name": "English 101",
          "session": "183f0bf3a0982a127bdb8161e0c44eb696b3e75c-1383210136298"
      },
      "payload": {
          "token": "user1-token-1"
      }
  }
  
  """                                             //> userJoinMessage  : String = "
                                                  //|   {
                                                  //|       "name": "user_join",
                                                  //|       "timestamp": 123456,
                                                  //|       "meeting": {
                                                  //|           "id": "english_101",
                                                  //|           "name": "English 101",
                                                  //|           "session": "183f0bf3a0982a127bdb8161e0c44eb696b3e75c-138321013629
                                                  //| 8"
                                                  //|       },
                                                  //|       "payload": {
                                                  //|           "token": "user1-token-1"
                                                  //|       }
                                                  //|   }
                                                  //|   
                                                  //|   "
  val userJoinAst =  JsonParser(userJoinMessage).asJsObject
                                                  //> userJoinAst  : spray.json.JsObject = {"name":"user_join","timestamp":123456
                                                  //| ,"meeting":{"id":"english_101","name":"English 101","session":"183f0bf3a098
                                                  //| 2a127bdb8161e0c44eb696b3e75c-1383210136298"},"payload":{"token":"user1-toke
                                                  //| n-1"}}
  val tokenObj =  userJoinAst.fields.get("payload").get.asJsObject
                                                  //> tokenObj  : spray.json.JsObject = {"token":"user1-token-1"}
  val tokenVal =  tokenObj.fields.get("token").get.prettyPrint
                                                  //> tokenVal  : String = "user1-token-1"
  





}