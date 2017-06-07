package org.bigbluebutton.api.util

import java.io.File
import java.util

import org.apache.commons.io.FileUtils
import org.bigbluebutton.api.domain.{Meeting, RecordingMetadata, User}
import org.scalatest._

class ResponseBuilderTest extends UnitSpec {

  it should "find template" in {
    val current = new java.io.File( "." ).getCanonicalPath()
    println("Current dir:"+current)



    val meetingInfo = new util.TreeMap[String, String]()
    meetingInfo.put("foo", "foo")
    meetingInfo.put("bar", "baz")

    val meeting: Meeting = new Meeting.Builder("extMid", "intMid", System.currentTimeMillis())
      .withName("Demo Meeting").withMaxUsers(25)
      .withModeratorPass("mp").withViewerPass("ap")
      .withRecording(true).withDuration(600)
      .withLogoutUrl("/logoutUrl").withTelVoice("85115").withWebVoice("85115")
      .withDialNumber("6135551234").withDefaultAvatarURL("/avatar")
      .withAutoStartRecording(false).withAllowStartStopRecording(true)
      .withWebcamsOnlyForModerator(false).withMetadata(meetingInfo)
      .withWelcomeMessageTemplate("hello").withWelcomeMessage("hello")
      .isBreakout(false).build

    meeting.setParentMeetingId("ParentMeetingId")
    meeting.setSequence(0);

    meeting.addBreakoutRoom("breakout-room-id-1")
    meeting.addBreakoutRoom("breakout-room-id-2")
    meeting.addBreakoutRoom("breakout-room-id-3")

    val user: User = new User("uid1", "extuid1", "Richard", "moderator", "/aygwapo", false, false)
    meeting.userJoined(user)

    val user2: User = new User("uid2", "extuid2", "Richard 2", "moderator", "/aygwapo", false, false)
    meeting.userJoined(user2)

    val user3: User = new User("uid3", "extuid3", "Richard 3", "moderator", "/aygwapo", false, false)
    meeting.userJoined(user2)

    val custData = new util.HashMap[String, String]()
    custData.put("gwapo", "totoo")

    meeting.addUserCustomData("extuid1", custData)

    val templateLoc = new File("src/test/resources")
    val builder = new ResponseBuilder(templateLoc)
    def response = builder.buildGetMeetingInfoResponse(meeting, "success")
//    println(response)

    assert(templateLoc.exists())
  }

  it should "return meetings" in {
    val meetingInfo1 = new util.TreeMap[String, String]()
    meetingInfo1.put("foo", "foo")
    meetingInfo1.put("bar", "baz")

    val meeting1: Meeting = new Meeting.Builder("extMid1", "intMid1", System.currentTimeMillis())
      .withName("Demo Meeting 1").withMaxUsers(25)
      .withModeratorPass("mp").withViewerPass("ap")
      .withRecording(true).withDuration(600)
      .withLogoutUrl("/logoutUrl").withTelVoice("85115").withWebVoice("85115")
      .withDialNumber("6135551234").withDefaultAvatarURL("/avatar")
      .withAutoStartRecording(false).withAllowStartStopRecording(true)
      .withWebcamsOnlyForModerator(false).withMetadata(meetingInfo1)
      .withWelcomeMessageTemplate("hello").withWelcomeMessage("hello")
      .isBreakout(false).build

    meeting1.setParentMeetingId("ParentMeetingId")
    meeting1.setSequence(0);

    meeting1.addBreakoutRoom("breakout-room-id-1")
    meeting1.addBreakoutRoom("breakout-room-id-2")
    meeting1.addBreakoutRoom("breakout-room-id-3")

    val userm11: User = new User("uid1", "extuid1", "Richard", "moderator", "/aygwapo", false, false)
    meeting1.userJoined(userm11)

    val userm12: User = new User("uid2", "extuid2", "Richard 2", "moderator", "/aygwapo", false, false)
    meeting1.userJoined(userm12)

    val userm13: User = new User("uid3", "extuid3", "Richard 3", "moderator", "/aygwapo", false, false)
    meeting1.userJoined(userm13)

    val custDatam1 = new util.HashMap[String, String]()
    custDatam1.put("gwapo", "totoo")

    meeting1.addUserCustomData("extuid1", custDatam1)

    val meetingInfo2 = new util.TreeMap[String, String]()
    meetingInfo2.put("foo", "foo")
    meetingInfo2.put("bar", "baz")

    val meeting2: Meeting = new Meeting.Builder("extMid2", "intMid2", System.currentTimeMillis())
      .withName("Demo Meeting 2").withMaxUsers(25)
      .withModeratorPass("mp").withViewerPass("ap")
      .withRecording(true).withDuration(600)
      .withLogoutUrl("/logoutUrl").withTelVoice("85115").withWebVoice("85115")
      .withDialNumber("6135551234").withDefaultAvatarURL("/avatar")
      .withAutoStartRecording(false).withAllowStartStopRecording(true)
      .withWebcamsOnlyForModerator(false).withMetadata(meetingInfo2)
      .withWelcomeMessageTemplate("hello").withWelcomeMessage("hello")
      .isBreakout(false).build

    meeting2.setParentMeetingId("ParentMeetingId")
    meeting2.setSequence(0);

    meeting2.addBreakoutRoom("breakout-room-id-1")
    meeting2.addBreakoutRoom("breakout-room-id-2")
    meeting2.addBreakoutRoom("breakout-room-id-3")

    val userm21: User = new User("uid1", "extuid1", "Richard", "moderator", "/aygwapo", false, false)
    meeting2.userJoined(userm21)

    val userm22: User = new User("uid2", "extuid2", "Richard 2", "moderator", "/aygwapo", false, false)
    meeting2.userJoined(userm22)

    val userm23: User = new User("uid3", "extuid3", "Richard 3", "moderator", "/aygwapo", false, false)
    meeting2.userJoined(userm23)

    val custDatam2 = new util.HashMap[String, String]()
    custDatam2.put("gwapo", "totoo")

    meeting2.addUserCustomData("extuid1", custDatam2)


    val meetingInfo3 = new util.TreeMap[String, String]()
    meetingInfo3.put("foo", "foo")
    meetingInfo3.put("bar", "baz")

    val meeting3: Meeting = new Meeting.Builder("extMid", "intMid", System.currentTimeMillis())
      .withName("Demo Meeting").withMaxUsers(25)
      .withModeratorPass("mp").withViewerPass("ap")
      .withRecording(true).withDuration(600)
      .withLogoutUrl("/logoutUrl").withTelVoice("85115").withWebVoice("85115")
      .withDialNumber("6135551234").withDefaultAvatarURL("/avatar")
      .withAutoStartRecording(false).withAllowStartStopRecording(true)
      .withWebcamsOnlyForModerator(false).withMetadata(meetingInfo3)
      .withWelcomeMessageTemplate("hello").withWelcomeMessage("hello")
      .isBreakout(false).build

    meeting3.setParentMeetingId("ParentMeetingId")
    meeting3.setSequence(0);

    meeting3.addBreakoutRoom("breakout-room-id-1")
    meeting3.addBreakoutRoom("breakout-room-id-2")
    meeting3.addBreakoutRoom("breakout-room-id-3")

    val user: User = new User("uid1", "extuid1", "Richard", "moderator", "/aygwapo", false, false)
    meeting3.userJoined(user)

    val user2: User = new User("uid2", "extuid2", "Richard 2", "moderator", "/aygwapo", false, false)
    meeting3.userJoined(user2)

    val user3: User = new User("uid3", "extuid3", "Richard 3", "moderator", "/aygwapo", false, false)
    meeting3.userJoined(user2)

    val custData = new util.HashMap[String, String]()
    custData.put("gwapo", "totoo")

    meeting3.addUserCustomData("extuid1", custData)



    val meetings = new util.ArrayList[Meeting]()
    meetings.add(meeting1)
    meetings.add(meeting2)
    meetings.add(meeting3)

    val templateLoc = new File("src/test/resources")
    val builder = new ResponseBuilder(templateLoc)
    def response = builder.buildGetMeetingsResponse(meetings, "success")
//    println(response)

    assert(templateLoc.exists())
  }

  it should "reply to getRecordings api call" in {
    val templateLoc = new File("src/test/resources")
    val builder = new ResponseBuilder(templateLoc)

    val metadataXml = new File("src/test/resources/breakout-room-metadata.xml")
    val recMeta = RecordingMetadataReaderHelper.getRecordingMetadata(metadataXml);
    val recList = new util.ArrayList[RecordingMetadata]()
    recList.add(recMeta)
    def response = builder.buildGetRecordingsResponse(recList, "success")
    println(response)

    assert(templateLoc.exists())
  }

  /**
  it should "support old metadata.xml in getRecordings api call" in {
    val templateLoc = new File("src/test/resources")
    val builder = new ResponseBuilder(templateLoc)

    // Make a copy of our sample recording
    val destDir = new File("target/recording-metadata/presentation")
    if (destDir.exists()) FileUtils.deleteDirectory(destDir)

    val srcDir = new File("src/test/resources/recording-metadata/presentation")
    FileUtils.copyDirectory(srcDir, destDir)

    val recDirs = destDir.listFiles()
    val recList = new util.ArrayList[RecordingMetadata]()
    println("START **********************")

    recDirs.map {rec =>
      val metadataXml = new File(rec.getAbsolutePath + File.separatorChar + "metadata.xml")
    //  println(metadataXml.getAbsolutePath)
      val recMeta = RecordingMetadataReaderHelper.getRecordingMetadata(metadataXml);
    //  val recList = new util.ArrayList[RecordingMetadata]()
    //  println("START **********************")
      if (recMeta != null) recList.add(recMeta)
    //  val response = builder.buildGetRecordingsResponse(recList, "success")
    //  println(response)
    //  println("END **********************")
    }

    val response = builder.buildGetRecordingsResponse(recList, "success")
    println(response)
    println("END **********************")

    assert(templateLoc.exists())
  }
    **/
}