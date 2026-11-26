package org.bigbluebutton.presentation.imp

import java.io.File
import java.lang.reflect.{ InvocationHandler, Method, Proxy }
import java.nio.charset.StandardCharsets
import java.nio.file.Files
import java.util.concurrent.CopyOnWriteArrayList

import org.apache.commons.io.FileUtils
import org.bigbluebutton.api.messaging.messages.InsertBlankPage
import org.bigbluebutton.api2.IBbbWebApiGWApp
import org.bigbluebutton.common2.msgs.{ BbbCommonEnvCoreMsg, PresentationInsertPagesFailedSysMsg }
import org.bigbluebutton.presentation.InsertPagesIntent
import org.scalatest.BeforeAndAfterEach
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers

import scala.jdk.CollectionConverters._

// The blank page of an insert (Ac-B 22): a one-page PDF written as text, and the failure of the handler
// when it cannot write it.
class BlankPagePdfTest extends AnyFlatSpec with Matchers with BeforeAndAfterEach {

  private val meetingId = "183f0bf3a0982a127bdb8161e0c44eb696b3e75c-1700000000000"
  private val uploadId = "a1b2c3d4e5f60718293a4b5c6d7e8f9012345678-1700000000001"
  private val targetId = "0123456789abcdef0123456789abcdef01234567-1700000000002"

  private var tmp: File = _

  override def beforeEach(): Unit = tmp = Files.createTempDirectory("blank-page").toFile

  override def afterEach(): Unit = FileUtils.deleteQuietly(tmp)

  private def text(width: Int, height: Int) = new String(BlankPagePdf.bytes(width, height), StandardCharsets.US_ASCII)

  "BlankPagePdf" should "point each xref entry at its object" in {
    val pdf = text(612, 792)
    val xref = pdf.indexOf("xref\n")
    val lines = pdf.substring(xref).split("\n").toList
    lines(1) shouldBe "0 5"
    lines(2) shouldBe "0000000000 65535 f "
    val entries = lines.slice(3, 7)
    entries should have size 4
    for ((entry, k) <- entries.zipWithIndex) {
      entry should fullyMatch regex "\\d{10} 00000 n "
      val offset = entry.substring(0, 10).toInt
      pdf.substring(offset) should startWith(s"${k + 1} 0 obj\n")
    }
    lines(7) shouldBe "trailer"
  }

  it should "point startxref at xref" in {
    val pdf = text(300, 200)
    val m = "startxref\n(\\d+)\n%%EOF\n$".r.findFirstMatchIn(pdf)
    m should not be empty
    val offset = m.get.group(1).toInt
    offset shouldBe pdf.indexOf("xref\n")
    pdf.substring(offset) should startWith("xref\n")
  }

  it should "use a MediaBox of the requested integer size" in {
    text(612, 792) should include("/MediaBox [0 0 612 792]")
    text(1, 12345) should include("/MediaBox [0 0 1 12345]")
    text(612, 792) should include("1 g 0 0 612 792 re f")
  }

  it should "be ASCII only, with no decimal point in its numbers" in {
    val bytes = BlankPagePdf.bytes(1920, 1080)
    all(bytes.toList.map(_.toInt)) should (be >= 0 and be < 128)
    // The only decimal point is the one of the version in the header.
    val pdf = text(1920, 1080)
    pdf should startWith("%PDF-1.4\n")
    pdf.stripPrefix("%PDF-1.4\n") should not include "."
    "\\d\\.\\d".r.findAllIn(pdf).toList shouldBe List("1.4")
  }

  it should "give the same bytes for the same size" in {
    BlankPagePdf.bytes(640, 480) shouldBe BlankPagePdf.bytes(640, 480)
    BlankPagePdf.bytes(640, 480) should not be BlankPagePdf.bytes(480, 640)
  }

  it should "refuse an invalid size" in {
    an[IllegalArgumentException] should be thrownBy BlankPagePdf.bytes(0, 100)
    an[IllegalArgumentException] should be thrownBy BlankPagePdf.bytes(100, 0)
    an[IllegalArgumentException] should be thrownBy BlankPagePdf.bytes(-1, 100)
  }

  it should "write its bytes to a file" in {
    val file = new File(tmp, "blank.pdf")
    BlankPagePdf.write(200, 100, file)
    Files.readAllBytes(file.toPath) shouldBe BlankPagePdf.bytes(200, 100)
  }

  // A gateway that records sendInsertPagesMessages and fails on anything else.
  private def recordingGw(sent: CopyOnWriteArrayList[BbbCommonEnvCoreMsg]): IBbbWebApiGWApp =
    Proxy.newProxyInstance(getClass.getClassLoader, Array(classOf[IBbbWebApiGWApp]), new InvocationHandler {
      override def invoke(proxy: Any, method: Method, args: Array[AnyRef]): AnyRef = method.getName match {
        case "sendInsertPagesMessages" =>
          sent.addAll(args(0).asInstanceOf[java.util.List[BbbCommonEnvCoreMsg]])
          null
        case "toString" => "recording gateway"
        case other      => throw new UnsupportedOperationException(other)
      }
    }).asInstanceOf[IBbbWebApiGWApp]

  "InsertBlankPageHandler" should "publish one Failed and leave nothing when it cannot write the page" in {
    // A regular file as the presentation directory: the directory of the upload cannot be created.
    val notADir = new File(tmp, "presentation")
    FileUtils.writeStringToFile(notADir, "not a directory", StandardCharsets.UTF_8)
    val sent = new CopyOnWriteArrayList[BbbCommonEnvCoreMsg]()
    val delivery = new InsertPagesDeliveryService
    delivery.setPresentationDir(notADir.getAbsolutePath)
    val handler = new InsertBlankPageHandler
    handler.setGw(recordingGw(sent))
    handler.setInsertPagesDeliveryService(delivery)
    handler.setPresentationDir(notADir.getAbsolutePath)
    handler.setPresentationBaseURL("http://base")
    try {
      handler.makeBlankPage(new InsertBlankPage(meetingId, "DEFAULT_PRESENTATION_POD",
        new InsertPagesIntent(targetId, 1, 1, false, ""), "w_user", uploadId, "blank.pdf", 612, 792))
    } finally handler.stop()

    val msgs = sent.asScala.toList
    msgs should have size 1
    val failed = msgs.head.core.asInstanceOf[PresentationInsertPagesFailedSysMsg]
    failed.header.meetingId shouldBe meetingId
    failed.body.uploadPresentationId shouldBe uploadId
    failed.body.errorKey shouldBe InsertPagesDeliveryService.ERROR_FAILED
    delivery.isRegistered(uploadId) shouldBe false
    notADir.isFile shouldBe true
    tmp.list().toList shouldBe List("presentation")
  }
}
