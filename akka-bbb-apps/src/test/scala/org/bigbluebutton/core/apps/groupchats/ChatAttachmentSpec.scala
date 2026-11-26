package org.bigbluebutton.core.apps.groupchats

import org.scalatest.flatspec.AnyFlatSpec

// The attachment a client puts in a chat message's metadata is kept only when it
// describes an upload of this meeting that bbb-file-upload could have produced.
//
// NOTE: extends AnyFlatSpec directly rather than the shared UnitSpec, which does not
// compile against the resolved ScalaTest 3.2.x. Mirrors MarkdownUtilSpec.
class ChatAttachmentSpec extends AnyFlatSpec {

  private val meetingId = "a1b2c3-1700000000000"
  private val maxSize = 5120L * 1024
  private val allowed = ChatAttachment.DefaultAllowedMimeTypes

  private val mp4 = Map[String, Any](
    "url" -> s"/bigbluebutton/fileUpload/$meetingId/0a1b2c3d-4e5f.mp4",
    "name" -> "Lecture 1.mp4",
    "size" -> 1048576,
    "mime" -> "video/mp4"
  )

  private def sanitize(attachment: Any, allowedMimeTypes: List[String] = allowed): Map[String, Any] =
    ChatAttachment.sanitize(Map("attachment" -> attachment, "other" -> "kept"), meetingId, allowedMimeTypes, maxSize)

  private def dropped(attachment: Any, allowedMimeTypes: List[String] = allowed): Boolean = {
    val result = sanitize(attachment, allowedMimeTypes)
    !result.contains("attachment") && result.get("other").contains("kept")
  }

  "ChatAttachment.sanitize" should "keep a valid attachment, normalized to its four fields" in {
    val result = sanitize(mp4 + ("extra" -> "ignored"))
    assert(result("attachment") == mp4.updated("size", 1048576L))
    assert(result("other") == "kept")
  }

  it should "accept the attachment as a Java map too (Jackson may bind either)" in {
    val javaMap = new java.util.HashMap[String, Any]()
    mp4.foreach { case (k, v) => javaMap.put(k, v) }
    assert(sanitize(javaMap).contains("attachment"))
  }

  it should "leave metadata without an attachment untouched" in {
    val metadata = Map[String, Any]("pluginName" -> "x")
    assert(ChatAttachment.sanitize(metadata, meetingId, allowed, maxSize) == metadata)
    assert(ChatAttachment.sanitize(null, meetingId, allowed, maxSize) == Map.empty)
  }

  it should "drop an upload url of another meeting" in {
    assert(dropped(mp4.updated("url", "/bigbluebutton/fileUpload/other-meeting/0a1b2c3d-4e5f.mp4")))
  }

  it should "not read the meeting id as a pattern" in {
    // A meeting id is plain, but quoting it means one with regex characters could
    // never widen the url check.
    val result = ChatAttachment.sanitize(Map("attachment" -> mp4), "a1b2c3-.*", allowed, maxSize)
    assert(!result.contains("attachment"))
  }

  it should "drop urls that are not the exact serving shape" in {
    List(
      "https://evil.example/0a1b2c3d.mp4",
      s"//evil.example/bigbluebutton/fileUpload/$meetingId/0a1b2c3d.mp4",
      s"/\\evil.example/bigbluebutton/fileUpload/$meetingId/0a1b2c3d.mp4",
      s"/bigbluebutton/fileUpload/$meetingId/../x/0a1b2c3d.mp4",
      s"/bigbluebutton/fileUpload/$meetingId/0A1B.mp4",
      s"/bigbluebutton/fileUpload/$meetingId/0a1b2c3d.mp4?x=1"
    ).foreach(url => assert(dropped(mp4.updated("url", url)), url))
  }

  it should "drop a url whose extension does not match the mime" in {
    assert(dropped(mp4.updated("url", s"/bigbluebutton/fileUpload/$meetingId/0a1b2c3d.pdf")))
  }

  it should "drop a mime outside the meeting allowlist or without a signature" in {
    assert(dropped(mp4, allowedMimeTypes = List("image/png")))
    val html = mp4 ++ Map("mime" -> "text/html", "name" -> "a.html",
      "url" -> s"/bigbluebutton/fileUpload/$meetingId/0a1b2c3d.html")
    assert(dropped(html, allowedMimeTypes = allowed :+ "text/html"))
  }

  it should "drop a size that is not a whole number within the limit" in {
    List[Any]("1048576", -1, 1.5, maxSize + 1, Double.NaN, Double.PositiveInfinity, null)
      .foreach(size => assert(dropped(mp4.updated("size", size)), s"size $size"))
    assert(!dropped(mp4.updated("size", 1048576.0)))
    assert(!dropped(mp4.updated("size", maxSize)))
  }

  it should "drop a name that is not a bare file name of the type" in {
    List[Any]("page.html", ".mp4", "a/b.mp4", "a\\b.mp4", "bad\u0000.mp4", "x" * 300 + ".mp4", 42, null)
      .foreach(name => assert(dropped(mp4.updated("name", name)), s"name $name"))
    assert(!dropped(mp4.updated("name", "LECTURE.MP4")))
  }

  it should "accept both jpeg name extensions" in {
    val jpeg = Map[String, Any](
      "url" -> s"/bigbluebutton/fileUpload/$meetingId/0a1b2c3d.jpg",
      "name" -> "photo.jpeg",
      "size" -> 10,
      "mime" -> "image/jpeg"
    )
    assert(!dropped(jpeg))
  }

  it should "drop anything that is not an object" in {
    List[Any]("x", 1, List(mp4), null).foreach(raw => assert(dropped(raw), s"$raw"))
  }
}
