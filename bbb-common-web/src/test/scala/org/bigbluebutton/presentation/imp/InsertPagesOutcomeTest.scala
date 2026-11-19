package org.bigbluebutton.presentation.imp

import java.io.File
import java.nio.charset.StandardCharsets
import java.nio.file.Files
import java.util.{ ArrayList, Arrays }

import org.apache.commons.io.FileUtils
import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.presentation.InsertPagesIntent
import org.bigbluebutton.presentation.messages._
import org.scalatest.BeforeAndAfterEach
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers

import scala.jdk.CollectionConverters._

// The mapping of the conversion messages of a registered insert upload (Ac-B 18), the start from a file,
// the discard of delivered pages and the registrations of an ended meeting.
class InsertPagesOutcomeTest extends AnyFlatSpec with Matchers with BeforeAndAfterEach {

  private val meetingId = "183f0bf3a0982a127bdb8161e0c44eb696b3e75c-1700000000000"
  private val otherMeetingId = "283f0bf3a0982a127bdb8161e0c44eb696b3e75c-1700000000000"
  private val uploadId = "a1b2c3d4e5f60718293a4b5c6d7e8f9012345678-1700000000001"
  private val otherUploadId = "b1b2c3d4e5f60718293a4b5c6d7e8f9012345678-1700000000003"
  private val unregisteredId = "c1b2c3d4e5f60718293a4b5c6d7e8f9012345678-1700000000004"
  private val targetId = "0123456789abcdef0123456789abcdef01234567-1700000000002"
  private val podId = "DEFAULT_PRESENTATION_POD"
  private val userId = "w_abcdefghijkl"
  private val intent = new InsertPagesIntent(targetId, 1, 2, false, "")

  private var presentationDir: File = _
  private var service: InsertPagesDeliveryService = _

  override def beforeEach(): Unit = {
    presentationDir = Files.createTempDirectory("insert-outcome").toFile
    service = new InsertPagesDeliveryService
    service.setPresentationDir(presentationDir.getAbsolutePath)
  }

  override def afterEach(): Unit = FileUtils.deleteQuietly(presentationDir)

  private def register(id: String = uploadId, meeting: String = meetingId): InsertPagesDeliveryService.Start =
    service.startFromFile(podId, meeting, id, "insert.pdf", null, "http://base", "authz", intent, userId)

  private val noIds = new ArrayList[String]()

  private def failures(id: String, m: String = meetingId): List[IDocConversionMsg] = List(
    new DocInvalidMimeType(podId, m, id, id, "insert.pdf", "authz", "IVALID_MIME_TYPE", "text/plain", "pdf"),
    new UploadFileVirusMessage(podId, m, "insert.pdf", "VIRUS", id, id),
    new UploadFileScanFailedMessage(podId, m, "insert.pdf", "SCAN_FAILED", id, id),
    new OfficeToPdfConversionFailed(podId, m, "insert.docx", "OFFICE_FAILED", id, id, 3),
    new PdfConversionInvalid(podId, m, id, "instance", "insert.pdf", userId, "authz", false, false, 1, 100, "INVALID"),
    new DocPageCountFailed(podId, m, id, "instance", "insert.pdf", userId, "authz", false, false, "COUNT_FAILED", id),
    new DocPageCountExceeded(podId, m, id, "instance", "insert.pdf", userId, "authz", false, false, "EXCEEDED", 300, 200, id),
    new UploadFileTimedoutMessage(podId, m, "insert.pdf", "TIMEDOUT", 1, id, id, 3),
    new UploadFileTooLargeMessage(id, podId, m, "insert.pdf", "authz", "TOO_LARGE", 100, 10),
    new ConversionRateLimitExceeded(podId, m, id, "insert.pdf", "RATE_LIMIT", "detail")
  )

  private def generated(id: String, pagesCompleted: Int, m: String = meetingId) =
    new DocPageGeneratedProgress(podId, m, id, "instance", "insert.pdf", userId, "authz", false, false, "GENERATED",
      3, pagesCompleted, "http://base", "/tmp", pagesCompleted, false, "3f2b8c1e-5d4a-4f6b-9c7d-0e1a2b3c4d5e")

  private def progressMessages(id: String, m: String = meetingId): List[IDocConversionMsg] = List(
    new DocConversionRequestReceived(podId, m, id, id, "insert.pdf", "authz", false, false, false),
    new DocConversionStarted(podId, id, "insert.pdf", id, 60L, m, "authz"),
    new DocPageConversionStarted(podId, m, id, "insert.pdf", "insert.pdf", "authz", false, false, false, false, 3, false),
    new DocConversionProgress(podId, m, id, "instance", "insert.pdf", userId, "authz", false, false, "PROGRESS", id),
    generated(id, 1, m)
  )

  private def completed(id: String, m: String = meetingId) =
    new DocPageCompletedProgress(podId, m, id, id, "instance", "insert.pdf", userId, "authz", false, false,
      "COMPLETED", 0, "http://base", false, false, "insert.pdf", noIds)

  private def failedBody(msgs: java.util.List[BbbCommonEnvCoreMsg]): PresentationInsertPagesFailedSysMsgBody = {
    msgs should not be null
    msgs should have size 1
    msgs.get(0).core shouldBe a[PresentationInsertPagesFailedSysMsg]
    msgs.get(0).core.asInstanceOf[PresentationInsertPagesFailedSysMsg].body
  }

  private def progressBody(msgs: java.util.List[BbbCommonEnvCoreMsg]): PresentationInsertPagesProgressSysMsgBody = {
    msgs should not be null
    msgs should have size 1
    msgs.get(0).core shouldBe a[PresentationInsertPagesProgressSysMsg]
    msgs.get(0).core.asInstanceOf[PresentationInsertPagesProgressSysMsg].body
  }

  "outcomeFor" should "map each of the 10 failure messages of a registered upload to one Failed" in {
    val all = failures(uploadId)
    all.map(_.getClass).distinct should have size 10
    for (msg <- all) {
      service = new InsertPagesDeliveryService
      register()
      withClue(msg.getClass.getSimpleName) {
        val body = failedBody(service.outcomeFor(msg))
        body.errorKey shouldBe InsertPagesDeliveryService.ERROR_FAILED
        body.uploadPresentationId shouldBe uploadId
        body.podId shouldBe podId
      }
    }
  }

  it should "map the other non-final messages to a Progress of stage conversion" in {
    register()
    val all = progressMessages(uploadId)
    all.map(_.getClass).distinct should have size 5
    for (msg <- all) withClue(msg.getClass.getSimpleName) {
      val body = progressBody(service.outcomeFor(msg))
      body.stage shouldBe InsertPagesDeliveryService.STAGE_CONVERSION
      body.uploadPresentationId shouldBe uploadId
    }
  }

  it should "return null for every message of an unregistered upload" in {
    register()
    for (msg <- failures(unregisteredId) ++ progressMessages(unregisteredId) :+ completed(unregisteredId))
      withClue(msg.getClass.getSimpleName) { service.outcomeFor(msg) shouldBe null }
  }

  it should "produce one result only for an error followed by the completion" in {
    register()
    failedBody(service.outcomeFor(failures(uploadId).head))
    service.outcomeFor(completed(uploadId)).asScala shouldBe empty
  }

  it should "return an empty list, never null, for any message after the result" in {
    register()
    failedBody(service.outcomeFor(failures(uploadId)(3)))
    for (msg <- failures(uploadId) ++ progressMessages(uploadId) :+ completed(uploadId))
      withClue(msg.getClass.getSimpleName) {
        val out = service.outcomeFor(msg)
        out should not be null
        out.asScala shouldBe empty
      }
    service.failureFor(uploadId, "late").asScala shouldBe empty
  }

  it should "never decrease the count of completed pages" in {
    register()
    progressBody(service.outcomeFor(generated(uploadId, 2))).pagesCompleted shouldBe 2
    progressBody(service.outcomeFor(generated(uploadId, 1))).pagesCompleted shouldBe 2
    progressBody(service.outcomeFor(progressMessages(uploadId)(3))).pagesCompleted shouldBe 2
  }

  "failureFor" should "return a Failed for a registered upload, and null for an unregistered one" in {
    register()
    val body = failedBody(service.failureFor(uploadId, "boom"))
    body.errorKey shouldBe InsertPagesDeliveryService.ERROR_FAILED
    body.detail shouldBe "boom"
    service.failureFor(unregisteredId, "boom") shouldBe null
    service.failureFor(null, "boom") shouldBe null
  }

  "startFromFile" should "refuse a missing, an empty, or an extensionless file, and still register it" in {
    register().accepted shouldBe false
    service.isRegistered(uploadId) shouldBe true

    val empty = new File(presentationDir, "empty.pdf")
    Files.write(empty.toPath, Array.emptyByteArray)
    service.startFromFile(podId, meetingId, otherUploadId, "empty.pdf", empty, "", "", intent, userId).accepted shouldBe false

    val noExt = new File(presentationDir, "noext")
    Files.write(noExt.toPath, BlankPagePdf.bytes(10, 10))
    service.startFromFile(podId, meetingId, unregisteredId, "noext", noExt, "", "", intent, userId).accepted shouldBe false
  }

  it should "accept a PDF and return a Progress of stage conversion with no page completed" in {
    val file = new File(presentationDir, "blank.pdf")
    Files.write(file.toPath, BlankPagePdf.bytes(612, 792))
    val start = service.startFromFile(podId, meetingId, uploadId, "blank.pdf", file, "", "", intent, userId)
    start.accepted shouldBe true
    start.pres.getInsertIntent shouldBe intent
    start.pres.getRequesterUserId shouldBe userId
    val body = start.progress.core.asInstanceOf[PresentationInsertPagesProgressSysMsg].body
    body.stage shouldBe InsertPagesDeliveryService.STAGE_CONVERSION
    body.pagesCompleted shouldBe 0
  }

  "discard" should "delete only the files of the ids received, and ignore invalid ids" in {
    val presDir = new File(new File(new File(presentationDir, meetingId), meetingId), targetId)
    val discarded = "3f2b8c1e-5d4a-4f6b-9c7d-0e1a2b3c4d5e"
    val kept = "8a7b6c5d-4e3f-4a1b-8c9d-0e1f2a3b4c5d"
    for (id <- List(discarded, kept); t <- PageArtifacts.Type.values())
      FileUtils.writeStringToFile(t.file(presDir, id), id, StandardCharsets.UTF_8)
    // What an unchecked invalid id "x" would name.
    val lookalike = new File(presDir, "svgs/slidex.svg")
    FileUtils.writeStringToFile(lookalike, "x", StandardCharsets.UTF_8)

    service.discard(meetingId, targetId, Arrays.asList(discarded, "x", "../../x", "1"))

    for (t <- PageArtifacts.Type.values()) {
      t.file(presDir, discarded).exists() shouldBe false
      t.file(presDir, kept).isFile shouldBe true
    }
    lookalike.isFile shouldBe true
  }

  it should "do nothing when the presentation has no directory" in {
    noException should be thrownBy service.discard(meetingId, targetId, Arrays.asList("3f2b8c1e-5d4a-4f6b-9c7d-0e1a2b3c4d5e"))
  }

  "removeMeeting" should "drop the registrations of that meeting only" in {
    register(uploadId, meetingId)
    register(otherUploadId, otherMeetingId)
    service.removeMeeting(meetingId)

    service.isRegistered(uploadId) shouldBe false
    service.outcomeFor(failures(uploadId).head) shouldBe null
    service.outcomeFor(progressMessages(uploadId).head) shouldBe null
    service.isRegistered(otherUploadId) shouldBe true
    progressBody(service.outcomeFor(progressMessages(otherUploadId, otherMeetingId).head))
  }
}
