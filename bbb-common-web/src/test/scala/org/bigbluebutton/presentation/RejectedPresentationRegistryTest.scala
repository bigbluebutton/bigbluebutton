package org.bigbluebutton.presentation

import java.io.File
import java.nio.file.Files

import org.bigbluebutton.api.util.UnitSpec
import org.bigbluebutton.api2.meeting.OldMeetingMsgHdlrActor
import org.bigbluebutton.common2.msgs.{ BbbClientMsgHeader, PresentationConversionRejectedSysMsg, PresentationConversionRejectedSysMsgBody }

class RejectedPresentationRegistryTest extends UnitSpec {

  private val meetingId = "183f0bf3a0982a127bdb8161e0c44eb696b3e75c-1700000000000"
  private val presId = "a1b2c3d4e5f60718293a4b5c6d7e8f9012345678-1700000000001"

  // Lays out <base>/<meetingId>/<meetingId>/<presId>/ with a converted file inside, as
  // api.Util.createPresentationDir does.
  private def presentationDirUnder(base: File): File = {
    val dir = new File(base, s"$meetingId/$meetingId/$presId")
    assert(dir.mkdirs())
    Files.writeString(new File(dir, "slide-1.svg").toPath, "<svg/>")
    dir
  }

  private def registry(base: File): RejectedPresentationRegistry = {
    val r = new RejectedPresentationRegistry
    r.setPresentationDir(base.getAbsolutePath)
    r.start()
    r
  }

  it should "report a rejected presentation as rejected, scoped to its meeting" in {
    val r = registry(Files.createTempDirectory("rejected").toFile)
    try {
      assert(!r.isRejected(meetingId, presId))
      r.reject(meetingId, presId)
      assert(r.isRejected(meetingId, presId))
      assert(!r.isRejected("another-meeting", presId))
    } finally r.stop()
  }

  it should "ignore ids that could escape the presentation directory" in {
    val r = registry(Files.createTempDirectory("rejected").toFile)
    try {
      r.reject(meetingId, "../../etc")
      r.reject("../x", presId)
      r.reject(null, presId)
      r.reject(meetingId, null)
      assert(!r.isRejected(meetingId, "../../etc"))
      assert(!r.isRejected("../x", presId))
    } finally r.stop()
  }

  it should "delete the presentation directory and forget the presentation" in {
    val base = Files.createTempDirectory("rejected").toFile
    val dir = presentationDirUnder(base)
    val r = registry(base)
    try {
      r.reject(meetingId, presId)
      r.deleteFiles(meetingId, presId)
      assert(!dir.exists())
      assert(new File(base, s"$meetingId/$meetingId").exists(), "sibling presentations must be kept")
      assert(!r.isRejected(meetingId, presId))
    } finally r.stop()
  }

  it should "tolerate a presentation directory that no longer exists" in {
    val r = registry(Files.createTempDirectory("rejected").toFile)
    try {
      r.reject(meetingId, presId)
      r.deleteFiles(meetingId, presId)
      assert(!r.isRejected(meetingId, presId))
    } finally r.stop()
  }

  it should "map the akka rejection message onto the bbb-web message" in {
    val msg = PresentationConversionRejectedSysMsg(
      BbbClientMsgHeader(PresentationConversionRejectedSysMsg.NAME, meetingId, "w_user"),
      PresentationConversionRejectedSysMsgBody(meetingId, "DEFAULT_PRESENTATION_POD", presId, "PRESENTATION_UPLOAD_POD_LIMIT_REACHED")
    )
    val converted = OldMeetingMsgHdlrActor.toPresentationConversionRejected(msg)
    assert(converted.meetingId == meetingId)
    assert(converted.podId == "DEFAULT_PRESENTATION_POD")
    assert(converted.presentationId == presId)
    assert(converted.reason == "PRESENTATION_UPLOAD_POD_LIMIT_REACHED")
  }
}
