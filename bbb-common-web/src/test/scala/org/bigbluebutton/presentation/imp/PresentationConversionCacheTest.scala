package org.bigbluebutton.presentation.imp

import java.io.{ ByteArrayInputStream, ByteArrayOutputStream, File }
import java.nio.charset.StandardCharsets
import java.nio.file.Files
import java.util.concurrent.{ CompletableFuture, ConcurrentHashMap, Future }
import java.util.{ ArrayList, Collections }
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

// The conversion cache: restoring a cached conversion under new page ids, and storing one with its
// manifest. No external binary runs: counting, extraction and page conversion are test doubles.
class PresentationConversionCacheTest extends AnyFlatSpec with Matchers with BeforeAndAfterEach {

  private val meetingId = "cache-test-meeting"
  private val hash = "0123abcd"
  private val cachedIds = List("3f2b8c1e-5d4a-4f6b-9c7d-0e1a2b3c4d5e", "8a7b6c5d-4e3f-4a1b-8c9d-0e1f2a3b4c5d")

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

  private var presDir: File = _
  private var processor: PresentationFileProcessor = _

  override def beforeEach(): Unit = {
    presDir = Files.createTempDirectory("pres-cache").toFile
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

  private def processWith(s3: FakeS3, pages: Int): UploadedPresentation = {
    processor = new PresentationFileProcessor(1)
    processor.setCounterService(new CountingService(pages))
    processor.setSlidesGenerationProgressNotifier(new SilentNotifier)
    processor.setS3FileManager(s3)
    processor.setPageExtractor(new PageExtractor { def extractPage(p: File, o: File, n: Int): Boolean = true })
    processor.setMaxBigPdfPageSize(Long.MaxValue)
    processor.setPdfSlidesGenerationService(new NoPdfSlides)
    processor.setPresentationConversionCompletionService(new NoCompletion)
    val pres = pdfPresentation()
    processor.process(pres)
    pres
  }

  private def tarGz(entries: Seq[(String, Array[Byte])]): Array[Byte] = {
    val out = new ByteArrayOutputStream()
    val tar = new TarArchiveOutputStream(new GzipCompressorOutputStream(out))
    for ((name, bytes) <- entries) {
      val e = new TarArchiveEntry(name)
      e.setSize(bytes.length)
      tar.putArchiveEntry(e)
      tar.write(bytes)
      tar.closeArchiveEntry()
    }
    tar.close()
    out.toByteArray
  }

  private def bytes(s: String) = s.getBytes(StandardCharsets.UTF_8)

  private def manifest(ids: Seq[String]) =
    "manifest.json" -> bytes(ids.zipWithIndex.map { case (id, i) => s""""${i + 1}":"$id"""" }.mkString("{", ",", "}"))

  private def pageEntries(id: String, withPng: Boolean) =
    Seq(s"svgs/slide$id.svg" -> bytes(s"svg $id"), s"thumbnails/thumb-$id.png" -> bytes(s"thumb $id"),
      s"textfiles/slide-$id.txt" -> bytes(s"text $id")) ++
      (if (withPng) Seq(s"pngs/slide-$id.png" -> bytes(s"png $id")) else Nil)

  private def cachedConversion(withPng: Boolean, extra: Seq[(String, Array[Byte])] = Nil) =
    tarGz(Seq(manifest(cachedIds)) ++ cachedIds.flatMap(pageEntries(_, withPng)) ++
      Seq("page-1.pdf" -> bytes("pdf 1"), "svgs/stray.svg" -> bytes("stray")) ++ extra)

  private def filesIn(dir: File): Set[String] =
    FileUtils.listFiles(dir, null, true).asScala.map(f => dir.toPath.relativize(f.toPath).toString).toSet

  private def expectNothingFromTheArchive(pres: UploadedPresentation): Unit = {
    filesIn(presDir) shouldBe Set("pres-1.pdf")
    presDir.listFiles().filter(_.getName.startsWith("cache-restore-")) shouldBe empty
    // Ids were minted after the count, once (a second registration would have thrown from process).
    pres.getPageIds.asScala should have size 2
    pres.getPageIds.asScala.toSet.intersect(cachedIds.toSet) shouldBe empty
  }

  "A cache hit" should "restore the pages under new ids, registered once, and nothing else of the archive" in {
    val pres = processWith(new FakeS3(Map(s"$hash.v2.tar.gz" -> cachedConversion(withPng = true))), pages = 2)

    val ids = pres.getPageIds.asScala.toList
    ids should have size 2
    ids.toSet.intersect(cachedIds.toSet) shouldBe empty
    an[IllegalStateException] should be thrownBy pres.mintPageIds(2)

    filesIn(presDir) shouldBe (Set("pres-1.pdf") ++ ids.flatMap(id =>
      Seq(s"svgs/slide$id.svg", s"thumbnails/thumb-$id.png", s"textfiles/slide-$id.txt", s"pngs/slide-$id.png")))
    for ((id, cached) <- ids.zip(cachedIds)) {
      FileUtils.readFileToString(new File(presDir, s"svgs/slide$id.svg"), StandardCharsets.UTF_8) shouldBe s"svg $cached"
      pres.pageId(ids.indexOf(id) + 1) shouldBe id
    }
    presDir.listFiles().filter(_.getName.startsWith("cache-restore-")) shouldBe empty
  }

  it should "accept an archive without pngs and restore the other artifacts" in {
    val pres = processWith(new FakeS3(Map(s"$hash.v2.tar.gz" -> cachedConversion(withPng = false))), pages = 2)
    val ids = pres.getPageIds.asScala.toList
    filesIn(presDir) shouldBe (Set("pres-1.pdf") ++ ids.flatMap(id =>
      Seq(s"svgs/slide$id.svg", s"thumbnails/thumb-$id.png", s"textfiles/slide-$id.txt")))
  }

  "A restore" should "leave nothing when an archive entry cannot be restored" in {
    val pres = processWith(new FakeS3(Map(s"$hash.v2.tar.gz" ->
      cachedConversion(withPng = true, extra = Seq("../extra.txt" -> bytes("x"))))), pages = 2)
    expectNothingFromTheArchive(pres)
    new File(presDir.getParentFile, "extra.txt").exists() shouldBe false
  }

  it should "leave nothing when the manifest has an invalid id" in {
    val archive = tarGz(Seq(manifest(Seq(cachedIds.head, "pres-1/2"))) ++ pageEntries(cachedIds.head, withPng = false))
    expectNothingFromTheArchive(processWith(new FakeS3(Map(s"$hash.v2.tar.gz" -> archive)), pages = 2))
  }

  it should "leave nothing when the manifest pages are not contiguous" in {
    val archive = tarGz(Seq("manifest.json" -> bytes(s"""{"1":"${cachedIds(0)}","3":"${cachedIds(1)}"}""")) ++
      cachedIds.flatMap(pageEntries(_, withPng = false)))
    expectNothingFromTheArchive(processWith(new FakeS3(Map(s"$hash.v2.tar.gz" -> archive)), pages = 2))
  }

  it should "leave nothing when a page lacks a required artifact" in {
    val archive = tarGz(Seq(manifest(cachedIds)) ++ pageEntries(cachedIds.head, withPng = false) ++
      pageEntries(cachedIds(1), withPng = false).filterNot(_._1.startsWith("textfiles/")))
    expectNothingFromTheArchive(processWith(new FakeS3(Map(s"$hash.v2.tar.gz" -> archive)), pages = 2))
  }

  it should "remove what it already moved when it fails in the middle" in {
    // textfiles cannot be created as a directory, so the restore fails after moving svgs and thumbnails.
    Files.write(new File(presDir, "textfiles").toPath, bytes("not a directory"))
    val pres = processWith(new FakeS3(Map(s"$hash.v2.tar.gz" -> cachedConversion(withPng = false))), pages = 2)
    filesIn(presDir) shouldBe Set("pres-1.pdf", "textfiles")
    presDir.listFiles().filter(_.getName.startsWith("cache-restore-")) shouldBe empty
    pres.getPageIds.asScala should have size 2
    pres.getPageIds.asScala.toSet.intersect(cachedIds.toSet) shouldBe empty
  }

  it should "never read an entry stored under the old key" in {
    expectNothingFromTheArchive(processWith(new FakeS3(Map(s"$hash.tar.gz" -> cachedConversion(withPng = true))), pages = 2))
  }

  "Storing a conversion" should "use the v2 key and a manifest naming the files of each page" in {
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

      service.handle(new PresentationConvertMessage(pres))
      for (page <- 1 to 2) service.handle(new PageConvertProgressMessage(page, pres.getId, meetingId, new ArrayList[String]()))

      val deadline = System.currentTimeMillis() + 10000
      while (s3.uploaded.isEmpty && System.currentTimeMillis() < deadline) Thread.sleep(50)
      s3.uploaded.keySet().asScala shouldBe Set(s"$hash.v2.tar.gz")

      val entries = untar(s3.uploaded.get(s"$hash.v2.tar.gz"))
      new String(entries("manifest.json"), StandardCharsets.UTF_8) shouldBe s"""{"1":"${ids(0)}","2":"${ids(1)}"}"""
      for (id <- ids; t <- PageArtifacts.Type.values()) {
        entries.keySet should contain(s"${t.directory}/${t.fileName(id)}")
      }
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
