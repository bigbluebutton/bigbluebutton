package org.bigbluebutton.presentation.imp

import java.io.{ ByteArrayInputStream, ByteArrayOutputStream, File }
import java.nio.charset.StandardCharsets
import java.nio.file.Files
import java.util.concurrent.{ CompletableFuture, ConcurrentHashMap, Future }
import java.util.ArrayList
import java.util.zip.GZIPInputStream

import com.amazonaws.services.s3.model.S3Object
import org.apache.commons.compress.archivers.tar.{ TarArchiveEntry, TarArchiveInputStream, TarArchiveOutputStream }
import org.apache.commons.compress.compressors.gzip.GzipCompressorOutputStream
import org.apache.commons.io.FileUtils
import org.bigbluebutton.api.MeetingService
import org.bigbluebutton.api.domain.Meeting
import org.bigbluebutton.api.service.ServiceUtils
import org.bigbluebutton.presentation.{ PageExtractor, UploadedPresentation }
import org.bigbluebutton.presentation.messages.{ PageConvertProgressMessage, PresentationConvertMessage }
import org.scalatest.BeforeAndAfterEach
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers

import scala.jdk.CollectionConverters._

// The PDF of each page (pages/page-<pageId>.pdf): its name, its extraction, and its place in the
// conversion cache. No external binary runs: counting, extraction and page conversion are test doubles.
class PagePdfTest extends AnyFlatSpec with Matchers with BeforeAndAfterEach {

  private val meetingId = "page-pdf-test-meeting"
  private val hash = "4567cdef"
  private val pageId = "3f2b8c1e-5d4a-4f6b-9c7d-0e1a2b3c4d5e"
  private val cachedIds = List(pageId, "8a7b6c5d-4e3f-4a1b-8c9d-0e1f2a3b4c5d")

  private class StubMeetingService(meeting: Meeting) extends MeetingService {
    override def getMeeting(id: String): Meeting = meeting
  }

  private class CountingService(pages: Int) extends PageCounterService {
    override def determineNumberOfPages(pres: UploadedPresentation, maxNumPages: Int): Unit = pres.setNumberOfPages(pages)
  }

  private class FakeS3(objects: Map[String, Array[Byte]]) extends S3FileManager {
    val uploaded = new ConcurrentHashMap[String, Array[Byte]]()
    override def generateHash(file: File): String = hash
    override def exists(key: String): Boolean = objects.contains(key)
    override def download(key: String): S3Object = {
      val o = new S3Object()
      o.setObjectContent(new ByteArrayInputStream(objects(key)))
      o
    }
    override def upload(key: String, file: File): Unit = uploaded.put(key, Files.readAllBytes(file.toPath))
  }

  private class SilentNotifier extends SlidesGenerationProgressNotifier {
    override def sendDocConversionProgress(msg: org.bigbluebutton.presentation.messages.IDocConversionMsg): Unit = ()
    override def sendConversionUpdateMessage(slidesCompleted: Int, pres: UploadedPresentation, pageGenerated: Int): Unit = ()
    override def sendConversionCompletedMessage(pres: UploadedPresentation): Unit = ()
  }

  private class NoPdfSlides extends PdfSlidesGenerationService(1) {
    override def process(page: PageToConvert): Future[_] = CompletableFuture.completedFuture(null)
    override def sendMessage(msg: PageConvertProgressMessage): Unit = ()
  }

  private class NoCompletion extends PresentationConversionCompletionService {
    override def handle(msg: org.bigbluebutton.presentation.messages.IPresentationCompletionMessage): Unit = ()
  }

  // Writes "extracted <page>" as the extracted page, and records which pages it was asked for.
  private class WritingExtractor extends PageExtractor {
    val extracted = new ConcurrentHashMap[Int, Boolean]()
    def extractPage(presentationFile: File, output: File, page: Int): Boolean = {
      extracted.put(page, true)
      FileUtils.writeStringToFile(output, s"extracted $page", StandardCharsets.UTF_8)
      true
    }
  }

  private var presDir: File = _
  private var processor: PresentationFileProcessor = _

  override def beforeEach(): Unit = {
    presDir = Files.createTempDirectory("page-pdf").toFile
    val meeting = new Meeting.Builder(meetingId, meetingId, System.currentTimeMillis())
      .withPresentationConversionCacheEnabled(true).build()
    new ServiceUtils().setMeetingService(new StubMeetingService(meeting))
  }

  override def afterEach(): Unit = {
    if (processor != null) processor.stop()
    new ServiceUtils().setMeetingService(null)
    FileUtils.deleteQuietly(presDir)
  }

  private def pdfPresentation(): UploadedPresentation = {
    val pres = new UploadedPresentation("pod-1", meetingId, "pres-1", "slides.pdf", "", true, "token", false, new ArrayList[String]())
    val file = new File(presDir, "pres-1.pdf")
    Files.write(file.toPath, "%PDF-1.4\n".getBytes(StandardCharsets.UTF_8))
    pres.setUploadedFile(file)
    pres.setFileType("pdf")
    pres
  }

  private def processWith(s3: FakeS3, extractor: WritingExtractor, pages: Int): UploadedPresentation = {
    processor = new PresentationFileProcessor(1)
    processor.setCounterService(new CountingService(pages))
    processor.setSlidesGenerationProgressNotifier(new SilentNotifier)
    processor.setS3FileManager(s3)
    processor.setPageExtractor(extractor)
    processor.setMaxBigPdfPageSize(Long.MaxValue)
    processor.setPdfSlidesGenerationService(new NoPdfSlides)
    processor.setPresentationConversionCompletionService(new NoCompletion)
    val pres = pdfPresentation()
    processor.process(pres)
    pres
  }

  private def bytes(s: String) = s.getBytes(StandardCharsets.UTF_8)

  private def tarGz(entries: Seq[(String, Array[Byte])]): Array[Byte] = {
    val out = new ByteArrayOutputStream()
    val tar = new TarArchiveOutputStream(new GzipCompressorOutputStream(out))
    for ((name, content) <- entries) {
      val e = new TarArchiveEntry(name)
      e.setSize(content.length)
      tar.putArchiveEntry(e)
      tar.write(content)
      tar.closeArchiveEntry()
    }
    tar.close()
    out.toByteArray
  }

  private def manifest(ids: Seq[String]) =
    "manifest.json" -> bytes(ids.zipWithIndex.map { case (id, i) => s""""${i + 1}":"$id"""" }.mkString("{", ",", "}"))

  private def requiredEntries(id: String) =
    Seq(s"svgs/slide$id.svg" -> bytes(s"svg $id"), s"thumbnails/thumb-$id.png" -> bytes(s"thumb $id"),
      s"textfiles/slide-$id.txt" -> bytes(s"text $id"))

  private def pagePdf(id: String) = new File(presDir, s"pages/page-$id.pdf")

  private def waitFor(condition: => Boolean): Unit = {
    val deadline = System.currentTimeMillis() + 10000
    while (!condition && System.currentTimeMillis() < deadline) Thread.sleep(20)
  }

  private def rootPdfs: Set[String] = presDir.list().filter(_.endsWith(".pdf")).toSet

  "PageArtifacts.Type.PDF" should "name the PDF of a page pages/page-<pageId>.pdf, as an optional artifact" in {
    PageArtifacts.Type.PDF.fileName(pageId) shouldBe s"page-$pageId.pdf"
    PageArtifacts.Type.PDF.file(presDir, pageId) shouldBe pagePdf(pageId)
    PageArtifacts.Type.PDF.required shouldBe false
    PageArtifacts.Type.PDF.pageIdOf(s"page-$pageId.pdf") shouldBe pageId
    PageArtifacts.Type.PDF.pageIdOf("page-1.pdf") shouldBe null
  }

  it should "refuse an invalid page id" in {
    an[IllegalArgumentException] should be thrownBy PageArtifacts.Type.PDF.fileName("1")
    an[IllegalArgumentException] should be thrownBy PageArtifacts.Type.PDF.fileName("../x")
  }

  "A PDF upload" should "keep the PDF of each page as pages/page-<pageId>.pdf, and no page-N.pdf" in {
    val extractor = new WritingExtractor
    val pres = processWith(new FakeS3(Map.empty), extractor, pages = 3)
    val ids = pres.getPageIds.asScala.toList
    waitFor(ids.forall(id => pagePdf(id).isFile))

    for ((id, num) <- ids.zipWithIndex) {
      FileUtils.readFileToString(pagePdf(id), StandardCharsets.UTF_8) shouldBe s"extracted ${num + 1}"
    }
    rootPdfs shouldBe Set("pres-1.pdf")
  }

  "A cache entry without pages/ (the format of the previous version)" should "be accepted, and extraction makes the PDF of each page" in {
    val archive = tarGz(Seq(manifest(cachedIds)) ++ cachedIds.flatMap(requiredEntries) ++ Seq("page-1.pdf" -> bytes("old 1")))
    val extractor = new WritingExtractor
    val pres = processWith(new FakeS3(Map(s"$hash.v2.tar.gz" -> archive)), extractor, pages = 2)
    val ids = pres.getPageIds.asScala.toList
    ids.toSet.intersect(cachedIds.toSet) shouldBe empty
    waitFor(ids.forall(id => pagePdf(id).isFile))

    for (id <- ids) new File(presDir, s"svgs/slide$id.svg").isFile shouldBe true
    for ((id, num) <- ids.zipWithIndex) {
      FileUtils.readFileToString(pagePdf(id), StandardCharsets.UTF_8) shouldBe s"extracted ${num + 1}"
    }
    rootPdfs shouldBe Set("pres-1.pdf")
  }

  "A cache entry with pages/" should "restore the PDF of each page under the new id, without extracting it again" in {
    val archive = tarGz(Seq(manifest(cachedIds)) ++ cachedIds.flatMap(id =>
      requiredEntries(id) :+ (s"pages/page-$id.pdf" -> bytes(s"cached $id"))))
    val extractor = new WritingExtractor
    val pres = processWith(new FakeS3(Map(s"$hash.v2.tar.gz" -> archive)), extractor, pages = 2)
    val ids = pres.getPageIds.asScala.toList

    for ((id, cached) <- ids.zip(cachedIds)) {
      FileUtils.readFileToString(pagePdf(id), StandardCharsets.UTF_8) shouldBe s"cached $cached"
    }
    processor.stop()
    processor = null
    extractor.extracted.isEmpty shouldBe true
  }

  "Storing a conversion" should "put pages/ in the archive, and leave the PDF of each page on disk" in {
    val s3 = new FakeS3(Map.empty)
    val service = new PresentationConversionCompletionService()
    service.setSlidesGenerationProgressNotifier(new SilentNotifier)
    service.setS3FileManager(s3)
    service.start()
    try {
      val pres = pdfPresentation()
      pres.setUploadedFileHash(hash)
      pres.setNumberOfPages(2)
      pres.mintPageIds(2)
      val ids = pres.getPageIds.asScala.toList
      for (id <- ids; t <- PageArtifacts.Type.values()) {
        FileUtils.writeStringToFile(t.file(presDir, id), s"${t.directory} $id", StandardCharsets.UTF_8)
      }
      // The name the previous version used for the PDF of a page: no longer archived.
      FileUtils.writeStringToFile(new File(presDir, "page-1.pdf"), "old", StandardCharsets.UTF_8)

      service.handle(new PresentationConvertMessage(pres))
      for (page <- 1 to 2) service.handle(new PageConvertProgressMessage(page, pres.getId, meetingId, new ArrayList[String]()))

      waitFor(!s3.uploaded.isEmpty)
      val entries = untar(s3.uploaded.get(s"$hash.v2.tar.gz"))
      for (id <- ids) entries.keySet should contain(s"pages/page-$id.pdf")
      entries.keySet.filter(_.endsWith(".pdf")) shouldBe ids.map(id => s"pages/page-$id.pdf").toSet

      Thread.sleep(200)
      for (id <- ids) pagePdf(id).isFile shouldBe true
    } finally {
      service.stop()
    }
  }

  private def untar(archive: Array[Byte]): Map[String, Array[Byte]] = {
    val in = new TarArchiveInputStream(new GZIPInputStream(new ByteArrayInputStream(archive)))
    Iterator.continually(in.getNextTarEntry).takeWhile(_ != null).filterNot(_.isDirectory).map { e =>
      e.getName.stripPrefix("/") -> in.readAllBytes()
    }.toMap
  }
}
