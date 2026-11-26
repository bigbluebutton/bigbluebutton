package org.bigbluebutton.presentation.imp

import java.io.File
import java.nio.charset.StandardCharsets
import java.nio.file.Files
import javax.crypto.Mac
import javax.crypto.spec.SecretKeySpec

import org.apache.commons.io.FileUtils
import org.bigbluebutton.api.MeetingService
import org.bigbluebutton.api.domain.Meeting
import org.bigbluebutton.api.service.ServiceUtils
import org.bigbluebutton.api2.MsgBuilder
import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.presentation.{ InsertPagesIntent, RejectedPresentationRegistry, UploadedPresentation }
import org.bigbluebutton.presentation.messages.DocPageCompletedProgress
import org.scalatest.BeforeAndAfterEach
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers

import scala.jdk.CollectionConverters._

// The delivery of the pages of an insert (Ac-B 17): the files of each page move from the upload into the
// directory of the target, and the result is one Page message per page then the Ready.
class InsertPagesDeliveryTest extends AnyFlatSpec with Matchers with BeforeAndAfterEach {

  private val meetingId = "183f0bf3a0982a127bdb8161e0c44eb696b3e75c-1700000000000"
  private val uploadId = "a1b2c3d4e5f60718293a4b5c6d7e8f9012345678-1700000000001"
  private val targetId = "0123456789abcdef0123456789abcdef01234567-1700000000002"
  private val baseUrl = "https://bbb.example.com/bigbluebutton/presentation"
  private val secret = "page-token-secret"
  private val podId = "DEFAULT_PRESENTATION_POD"
  private val userId = "w_abcdefghijkl"

  private class StubMeetingService(meeting: Meeting) extends MeetingService {
    override def getMeeting(id: String): Meeting = meeting
  }

  // Records each reject with the files of the target at that moment.
  private class RecordingRegistry extends RejectedPresentationRegistry {
    val calls = new java.util.concurrent.CopyOnWriteArrayList[(String, String, Set[String])]()
    override def reject(meetingId: String, presentationId: String): Unit =
      calls.add((meetingId, presentationId, filesUnder(targetDir)))
  }

  private var presentationDir: File = _
  private var meeting: Meeting = _
  private var registry: RecordingRegistry = _
  private var service: InsertPagesDeliveryService = _

  private def meetingDir = new File(new File(presentationDir, meetingId), meetingId)
  private def uploadDir = new File(meetingDir, uploadId)
  private def targetDir = new File(meetingDir, targetId)

  override def beforeEach(): Unit = {
    presentationDir = Files.createTempDirectory("insert-delivery").toFile
    meeting = new Meeting.Builder(meetingId, meetingId, System.currentTimeMillis()).build()
    meeting.setMaxNumPages(200)
    new ServiceUtils().setMeetingService(new StubMeetingService(meeting))
    registry = new RecordingRegistry
    service = new InsertPagesDeliveryService
    service.setPresentationDir(presentationDir.getAbsolutePath)
    service.setPageTokenSecret(secret)
    service.setRejectedPresentationRegistry(registry)
  }

  override def afterEach(): Unit = {
    new ServiceUtils().setMeetingService(null)
    FileUtils.deleteQuietly(presentationDir)
  }

  private def filesUnder(dir: File): Set[String] =
    if (!dir.exists()) Set.empty
    else FileUtils.listFiles(dir, null, true).asScala.map(f => dir.toPath.relativize(f.toPath).toString).toSet

  private def write(file: File, content: String): Unit =
    FileUtils.writeStringToFile(file, content, StandardCharsets.UTF_8)

  private def svg(w: Int, h: Int) = s"""<svg xmlns="http://www.w3.org/2000/svg" width="$w" height="$h"></svg>"""

  // The upload: its file, and the artifacts of each page in its directory.
  private def registerUpload(pages: Int, withPng: Boolean = true, withPdf: Boolean = true,
                             text: Int => String = i => s"text of page $i"): UploadedPresentation = {
    uploadDir.mkdirs()
    val file = new File(uploadDir, s"$uploadId.pdf")
    Files.write(file.toPath, BlankPagePdf.bytes(612, 792))
    val start = service.startFromFile(podId, meetingId, uploadId, "insert.pdf", file, baseUrl, "authz",
      new InsertPagesIntent(targetId, 2, 3, true, "req-page"), userId)
    val pres = start.pres
    pres.mintPageIds(pages)
    for ((id, i) <- pres.getPageIds.asScala.zipWithIndex) {
      write(PageArtifacts.Type.SVG.file(uploadDir, id), svg(800 + i, 600 + i))
      write(PageArtifacts.Type.THUMBNAIL.file(uploadDir, id), s"thumb $id")
      write(PageArtifacts.Type.TEXT.file(uploadDir, id), text(i + 1))
      if (withPng) write(PageArtifacts.Type.PNG.file(uploadDir, id), s"png $id")
      if (withPdf) write(PageArtifacts.Type.PDF.file(uploadDir, id), s"pdf $id")
    }
    pres
  }

  private def makeTarget(withPages: Boolean = true): Unit = {
    targetDir.mkdirs()
    write(new File(targetDir, s"$targetId.pdf"), "target file")
    if (withPages) new File(targetDir, "pages").mkdirs()
  }

  private def completed(pres: UploadedPresentation) =
    new DocPageCompletedProgress(podId, meetingId, uploadId, uploadId, "instance", "insert.pdf", userId, "authz",
      false, false, "CONVERSION_COMPLETED", pres.getPageIds.size, baseUrl, false, false, "insert.pdf", pres.getPageIds)

  private def deliver(pres: UploadedPresentation) = service.outcomeFor(completed(pres)).asScala.toList

  private def artifacts(id: String, withPng: Boolean = true): Set[String] =
    PageArtifacts.Type.values().toSet.filter(t => withPng || t != PageArtifacts.Type.PNG)
      .map(t => s"${t.directory}/${t.fileName(id)}")

  private val targetBaseline = Set(s"$targetId.pdf")

  private def failedOf(msgs: List[BbbCommonEnvCoreMsg]): PresentationInsertPagesFailedSysMsgBody = {
    msgs should have size 1
    msgs.head.core shouldBe a[PresentationInsertPagesFailedSysMsg]
    msgs.head.core.asInstanceOf[PresentationInsertPagesFailedSysMsg].body
  }

  // The page token binds the page to its meeting (conference and room, both the meeting id here) and presentation.
  private def hmac(presId: String, pageId: String): String = {
    val mac = Mac.getInstance("HmacSHA256")
    mac.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"))
    mac.doFinal(s"$meetingId|$meetingId|$presId|$pageId".getBytes(StandardCharsets.UTF_8)).map("%02x".format(_)).mkString
  }

  "Delivering the pages of an insert" should "move the five artifacts of each page into the target" in {
    makeTarget()
    val pres = registerUpload(2)
    val ids = pres.getPageIds.asScala.toList
    deliver(pres) should have size 3

    filesUnder(targetDir) shouldBe targetBaseline ++ ids.flatMap(id => artifacts(id))
    for (id <- ids) {
      FileUtils.readFileToString(PageArtifacts.Type.PDF.file(targetDir, id), StandardCharsets.UTF_8) shouldBe s"pdf $id"
      for (t <- PageArtifacts.Type.values()) t.file(uploadDir, id).exists() shouldBe false
    }
  }

  it should "tolerate a page without its png" in {
    makeTarget()
    val pres = registerUpload(2, withPng = false)
    val ids = pres.getPageIds.asScala.toList
    val msgs = deliver(pres)
    msgs.last.core shouldBe a[PresentationInsertPagesReadySysMsg]
    filesUnder(targetDir) shouldBe targetBaseline ++ ids.flatMap(id => artifacts(id, withPng = false))
  }

  it should "fail on a collision and leave nothing of the upload in the target" in {
    makeTarget()
    val pres = registerUpload(2)
    val second = pres.getPageIds.get(1)
    // Already in the target: the text of the second page, reached after the first page has moved.
    write(PageArtifacts.Type.TEXT.file(targetDir, second), "already here")
    val before = filesUnder(targetDir)

    failedOf(deliver(pres)).errorKey shouldBe InsertPagesDeliveryService.ERROR_FAILED
    filesUnder(targetDir) shouldBe before
    FileUtils.readFileToString(PageArtifacts.Type.TEXT.file(targetDir, second), StandardCharsets.UTF_8) shouldBe "already here"
  }

  it should "fail with unsupportedFile when a page has no PDF, moving nothing" in {
    makeTarget()
    val pres = registerUpload(2, withPdf = false)
    failedOf(deliver(pres)).errorKey shouldBe InsertPagesDeliveryService.ERROR_UNSUPPORTED_FILE
    filesUnder(targetDir) shouldBe targetBaseline
  }

  it should "fail with unsupportedTarget when the target has no pages/, moving nothing" in {
    makeTarget(withPages = false)
    val pres = registerUpload(1)
    failedOf(deliver(pres)).errorKey shouldBe InsertPagesDeliveryService.ERROR_UNSUPPORTED_TARGET
    filesUnder(targetDir) shouldBe targetBaseline
  }

  it should "leave nothing moved when a move after the first one fails" in {
    makeTarget()
    // thumbnails is a regular file: the svg of the first page moves, then its thumbnail cannot.
    write(new File(targetDir, "thumbnails"), "not a directory")
    val before = filesUnder(targetDir)
    val pres = registerUpload(2)

    failedOf(deliver(pres)).errorKey shouldBe InsertPagesDeliveryService.ERROR_FAILED
    filesUnder(targetDir) shouldBe before
  }

  it should "move nothing and return no message when the meeting ended" in {
    makeTarget()
    meeting.setForciblyEnded(true)
    val pres = registerUpload(2)
    val uploadBefore = filesUnder(uploadDir)

    deliver(pres) shouldBe empty
    filesUnder(targetDir) shouldBe targetBaseline
    filesUnder(uploadDir) shouldBe uploadBefore
    registry.calls.asScala shouldBe empty
  }

  it should "build each page from the moved files, with the URLs and page token of the target" in {
    makeTarget()
    val pres = registerUpload(2, text = i => s"page\u0000 $i\u0000")
    val ids = pres.getPageIds.asScala.toList
    val msgs = deliver(pres)
    val pages = msgs.init.map(_.core.asInstanceOf[PresentationInsertPagesPageSysMsg].body)
    val presBaseUrl = s"$baseUrl/$meetingId/$meetingId/$targetId"

    for (((body, id), i) <- pages.zip(ids).zipWithIndex) {
      body.podId shouldBe podId
      body.uploadPresentationId shouldBe uploadId
      val page = body.page
      page.id shouldBe id
      page.num shouldBe i + 1
      page.width shouldBe (800 + i).toDouble
      page.height shouldBe (600 + i).toDouble
      page.content shouldBe s"page ${i + 1}"
      page.pageToken shouldBe hmac(targetId, id)
      page.urls("svg") shouldBe s"$presBaseUrl/svg/$id?pageToken=${hmac(targetId, id)}"
      val expected = MsgBuilder.generatePresentationPage(meetingId, meetingId, targetId, presBaseUrl,
        targetDir.getAbsolutePath, id, i + 1, secret)
      page shouldBe expected.copy(content = expected.content.replace("\u0000", ""))
    }
  }

  it should "return one Page message per page in order, then the Ready with the page ids" in {
    makeTarget()
    val pres = registerUpload(3)
    val ids = pres.getPageIds.asScala.toList
    val msgs = deliver(pres)

    msgs should have size 4
    msgs.init.map(_.core.asInstanceOf[PresentationInsertPagesPageSysMsg].body.page.id) shouldBe ids
    msgs.init.foreach(_.core.asInstanceOf[PresentationInsertPagesPageSysMsg].header.meetingId shouldBe meetingId)
    val ready = msgs.last.core.asInstanceOf[PresentationInsertPagesReadySysMsg]
    ready.header.meetingId shouldBe meetingId
    ready.header.userId shouldBe userId
    ready.body.podId shouldBe podId
    ready.body.insertIntoPresentationId shouldBe targetId
    ready.body.uploadPresentationId shouldBe uploadId
    ready.body.maxNumPages shouldBe meeting.getMaxNumPages
    ready.body.pageIds shouldBe ids.toVector
  }

  "The registry of a delivery" should "be called once on success, after the last move" in {
    makeTarget()
    val pres = registerUpload(2)
    val ids = pres.getPageIds.asScala.toList
    deliver(pres)

    registry.calls.asScala.toList shouldBe List((meetingId, uploadId, targetBaseline ++ ids.flatMap(id => artifacts(id))))
  }

  it should "be called once for a page without its PDF, with nothing in the target" in {
    makeTarget()
    deliver(registerUpload(2, withPdf = false))
    registry.calls.asScala.toList shouldBe List((meetingId, uploadId, targetBaseline))
  }

  it should "be called once for a target without pages/, with nothing in the target" in {
    makeTarget(withPages = false)
    deliver(registerUpload(1))
    registry.calls.asScala.toList shouldBe List((meetingId, uploadId, targetBaseline))
  }

  it should "be called once after the cleanup of a failure after the first move" in {
    makeTarget()
    write(new File(targetDir, "thumbnails"), "not a directory")
    val before = filesUnder(targetDir)
    deliver(registerUpload(2))
    registry.calls.asScala.toList shouldBe List((meetingId, uploadId, before))
  }

  it should "not be called when the meeting ended" in {
    makeTarget()
    meeting.setForciblyEnded(true)
    deliver(registerUpload(1))
    registry.calls.asScala shouldBe empty
  }

  "A second completion of a delivered upload" should "return no message and move nothing" in {
    makeTarget()
    val pres = registerUpload(1)
    deliver(pres) should have size 2
    val after = filesUnder(targetDir)
    deliver(pres) shouldBe empty
    filesUnder(targetDir) shouldBe after
    registry.calls.asScala should have size 1
  }
}
