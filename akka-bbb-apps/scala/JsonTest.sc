package org.bigbluebutton.core

import scala.util.{Try, Success, Failure}

object JsonTest {
  import org.bigbluebutton.core.UserMessagesProtocol._
  import spray.json._

  println("Welcome to the Scala worksheet")       //> Welcome to the Scala worksheet

  val envHeader = new OutMsgEnvelopeHeader(MessageType.BROADCAST, "bar")
                                                  //> envHeader  : org.bigbluebutton.core.OutMsgEnvelopeHeader = OutMsgEnvelopeHea
                                                  //| der(broadcast,bar)
                                                  
  val header = new OutMsgHeader("foo")            //> header  : org.bigbluebutton.core.OutMsgHeader = OutMsgHeader(foo)
  val payload = new CreateBreakoutRoomOutMsgPayload("breakoutId", "name", "parentId",
                      "voiceConfId", 20,
                      "moderatorPassword", "viewerPassword",
                      "defaultPresentationUrl")   //> payload  : org.bigbluebutton.core.CreateBreakoutRoomOutMsgPayload = CreateBr
                                                  //| eakoutRoomOutMsgPayload(breakoutId,name,parentId,voiceConfId,20,moderatorPas
                                                  //| sword,viewerPassword,defaultPresentationUrl)
                            
  val envPayload = new CreateBreakoutRoomOutMsgEnvelopePayload(header, payload)
                                                  //> envPayload  : org.bigbluebutton.core.CreateBreakoutRoomOutMsgEnvelopePayload
                                                  //|  = CreateBreakoutRoomOutMsgEnvelopePayload(OutMsgHeader(foo),CreateBreakoutR
                                                  //| oomOutMsgPayload(breakoutId,name,parentId,voiceConfId,20,moderatorPassword,v
                                                  //| iewerPassword,defaultPresentationUrl))
                                                  
  val msg = new CreateBreakoutRoomOutMsgEnvelope(envHeader, envPayload)
                                                  //> msg  : org.bigbluebutton.core.CreateBreakoutRoomOutMsgEnvelope = CreateBreak
                                                  //| outRoomOutMsgEnvelope(OutMsgEnvelopeHeader(broadcast,bar),CreateBreakoutRoom
                                                  //| OutMsgEnvelopePayload(OutMsgHeader(foo),CreateBreakoutRoomOutMsgPayload(brea
                                                  //| koutId,name,parentId,voiceConfId,20,moderatorPassword,viewerPassword,default
                                                  //| PresentationUrl)))
                                                 
  msg.toJson.prettyPrint                          //> res0: String = {
                                                  //|   "header": {
                                                  //|     "type": "broadcast",
                                                  //|     "address": "bar"
                                                  //|   },
                                                  //|   "payload": {
                                                  //|     "header": {
                                                  //|       "name": "foo"
                                                  //|     },
                                                  //|     "payload": {
                                                  //|       "name": "name",
                                                  //|       "viewerPassword": "viewerPassword",
                                                  //|       "defaultPresentationUrl": "defaultPresentationUrl",
                                                  //|       "moderatorPassword": "moderatorPassword",
                                                  //|       "durationInMinutes": 20,
                                                  //|       "voiceConfId": "voiceConfId",
                                                  //|       "parentId": "parentId",
                                                  //|       "breakoutId": "breakoutId"
                                                  //|     }
                                                  //|   }
                                                  //| }
 
 
 
}