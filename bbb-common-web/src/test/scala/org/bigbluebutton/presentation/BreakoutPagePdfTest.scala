package org.bigbluebutton.presentation

import java.io.File
import java.nio.charset.StandardCharsets
import java.nio.file.Files

import org.apache.commons.io.FileUtils
import org.scalatest.BeforeAndAfterEach
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers

// Which file a breakout room with the current slide takes: the PDF of the page, when the source
// presentation has it.
class BreakoutPagePdfTest extends AnyFlatSpec with Matchers with BeforeAndAfterEach {

  private val pageId = "3f2b8c1e-5d4a-4f6b-9c7d-0e1a2b3c4d5e"
  private var presDir: File = _

  override def beforeEach(): Unit = presDir = Files.createTempDirectory("breakout-page-pdf").toFile
  override def afterEach(): Unit = FileUtils.deleteQuietly(presDir)

  "pagePdfOf" should "return pages/page-<pageId>.pdf when the presentation has it" in {
    val pdf = new File(presDir, s"pages/page-$pageId.pdf")
    FileUtils.writeStringToFile(pdf, "%PDF-1.4\n", StandardCharsets.UTF_8)
    PresentationUrlDownloadService.pagePdfOf(presDir, pageId) shouldBe pdf
  }

  it should "return null for an empty id, so the room is made by page number as before" in {
    PresentationUrlDownloadService.pagePdfOf(presDir, "") shouldBe null
  }

  it should "return null when the presentation has no PDF for that page (another presentation, an image)" in {
    PresentationUrlDownloadService.pagePdfOf(presDir, pageId) shouldBe null
  }

  it should "return null for an id that is not a page id" in {
    PresentationUrlDownloadService.pagePdfOf(presDir, "../x") shouldBe null
    PresentationUrlDownloadService.pagePdfOf(presDir, null) shouldBe null
  }
}
