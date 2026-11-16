package org.bigbluebutton.presentation.imp

import java.io.File
import java.nio.file.Files
import java.util.ArrayList

import org.bigbluebutton.api.MeetingService
import org.bigbluebutton.api.domain.Meeting
import org.bigbluebutton.api.service.ServiceUtils
import org.bigbluebutton.presentation.UploadedPresentation
import org.bigbluebutton.presentation.messages.{ DocPageCountExceeded, IDocConversionMsg }
import org.scalatest.BeforeAndAfterEach
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers

class PresentationFileProcessorTest extends AnyFlatSpec with Matchers with BeforeAndAfterEach {

  private val meetingId = "pfp-test-meeting"

  private class StubMeetingService(meeting: Meeting) extends MeetingService {
    override def getMeeting(id: String): Meeting = meeting
  }

  // Records the page limit it is handed, then reports the document as too
  // long so process() stops before it submits any conversion work.
  private class RecordingCounterService extends PageCounterService {
    var maxNumPagesSeen: Option[Int] = None

    override def determineNumberOfPages(pres: UploadedPresentation, maxNumPages: Int): Unit = {
      maxNumPagesSeen = Some(maxNumPages)
      throw new CountingPageException(CountingPageException.ExceptionType.PAGE_EXCEEDED_EXCEPTION, maxNumPages + 1, maxNumPages)
    }
  }

  private class RecordingNotifier extends SlidesGenerationProgressNotifier {
    val sent = new ArrayList[IDocConversionMsg]()

    override def sendDocConversionProgress(msg: IDocConversionMsg): Unit = sent.add(msg)
  }

  private var presDir: File = _
  private var counter: RecordingCounterService = _
  private var notifier: RecordingNotifier = _
  private var processor: PresentationFileProcessor = _

  override def beforeEach(): Unit = {
    presDir = Files.createTempDirectory("pres-file-processor").toFile
    counter = new RecordingCounterService()
    notifier = new RecordingNotifier()
    processor = new PresentationFileProcessor(1)
    processor.setCounterService(counter)
    processor.setSlidesGenerationProgressNotifier(notifier)
    processor.setS3FileManager(new S3FileManager())
  }

  override def afterEach(): Unit = {
    new ServiceUtils().setMeetingService(null)
    processor.stop()
    presDir.listFiles().foreach(_.delete())
    presDir.delete()
  }

  private def useMeeting(meeting: Meeting): Unit =
    new ServiceUtils().setMeetingService(new StubMeetingService(meeting))

  private def pdfPresentation(): UploadedPresentation = {
    val pres = new UploadedPresentation("pod-1", meetingId, "pres-1", "slides.pdf", "", true, "token", false, new ArrayList[String]())
    val file = new File(presDir, "pres-1.pdf")
    Files.write(file.toPath, "%PDF-1.4\n".getBytes("UTF-8"))
    pres.setUploadedFile(file)
    pres.setFileType("pdf")
    pres
  }

  "process" should "skip the conversion when the meeting is already gone" in {
    useMeeting(null)

    noException should be thrownBy processor.process(pdfPresentation())

    counter.maxNumPagesSeen shouldBe None
    notifier.sent shouldBe empty
  }

  it should "pass the meeting's page limit to the page counter while the meeting is running" in {
    val meeting = new Meeting.Builder(meetingId, meetingId, System.currentTimeMillis()).build()
    meeting.setMaxNumPages(7)
    useMeeting(meeting)

    processor.process(pdfPresentation())

    counter.maxNumPagesSeen shouldBe Some(7)
    notifier.sent should have size 1
    notifier.sent.get(0) shouldBe a[DocPageCountExceeded]
  }
}
