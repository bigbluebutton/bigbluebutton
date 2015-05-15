package org.bigbluebutton.apps.protocol

import org.bigbluebutton.apps.protocol._

object extractorsws {

  case class Header1(name: String, timestamp: Long,
                     correlation: String, source: String,
                     meeting: Option[HeaderMeeting1])
                 
  case class HeaderMeeting1(name: String, externalId: String, sessionId: String)

  val headerMeeting = HeaderMeeting1("English 101", "english_101", "english_101-123456")
                                                  //> headerMeeting  : org.bigbluebutton.apps.protocol.extractorsws.HeaderMeeting1
                                                  //|  = HeaderMeeting1(English 101,english_101,english_101-123456)
  val header1 = Header1("RegisterUserRequest", 1234567L, "123abc", "bbb-apps", Some(headerMeeting))
                                                  //> header1  : org.bigbluebutton.apps.protocol.extractorsws.Header1 = Header1(Re
                                                  //| gisterUserRequest,1234567,123abc,bbb-apps,Some(HeaderMeeting1(English 101,en
                                                  //| glish_101,english_101-123456)))
  header1 match {
     case Header1(name, _, _, _, Some(meeting)) => println(meeting)
     case Header1(name, _, _, _, None) => println("no meeting")
  }                                               //> HeaderMeeting1(English 101,english_101,english_101-123456)
  
  val header2 = Header1("RegisterUserRequest", 1234567L, "123abc", "bbb-apps", None)
                                                  //> header2  : org.bigbluebutton.apps.protocol.extractorsws.Header1 = Header1(Re
                                                  //| gisterUserRequest,1234567,123abc,bbb-apps,None)
  
  header2 match {
     case Header1(name, _, _, _, Some(meeting)) => println(meeting)
     case Header1(name, _, _, _, None) => println("no meeting")
  }                                               //> no meeting
  
  val from = "abc"                                //> from  : String = abc
  val to = "abd"                                  //> to  : String = abd
  val from1 = new scala.collection.immutable.StringOps(from)
                                                  //> from1  : scala.collection.immutable.StringOps = abc
  val to1 = new scala.collection.immutable.StringOps(to)
                                                  //> to1  : scala.collection.immutable.StringOps = abd
  
  from1 < to1                                     //> res0: Boolean = true
  
}