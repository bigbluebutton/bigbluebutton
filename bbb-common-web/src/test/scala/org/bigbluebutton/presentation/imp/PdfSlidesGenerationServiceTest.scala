package org.bigbluebutton.presentation.imp

import java.nio.file.Files
import java.util.ArrayList
import java.util.concurrent.TimeUnit
import java.util.concurrent.atomic.AtomicBoolean

import org.bigbluebutton.api.util.UnitSpec
import org.bigbluebutton.presentation.{ RejectedPresentationRegistry, UploadedPresentation }

class PdfSlidesGenerationServiceTest extends UnitSpec {

  private val meetingId = "183f0bf3a0982a127bdb8161e0c44eb696b3e75c-1700000000000"
  private val presId = "a1b2c3d4e5f60718293a4b5c6d7e8f9012345678-1700000000001"

  private def uploadedPresentation(): UploadedPresentation =
    new UploadedPresentation("pod", meetingId, presId, "tmp", "f.pdf", "http://base",
      false, "authz", false, new ArrayList[String](), false)

  // Records whether the page was converted. The collaborators are never reached.
  private class RecordingPage(pres: UploadedPresentation)
    extends PageToConvert(pres, 1, null, false, false, false, null, null, null, null, null) {
    val converted = new AtomicBoolean(false)
    override def convert(): Boolean = {
      converted.set(true)
      true
    }
  }

  private def withService(test: (PdfSlidesGenerationService, RejectedPresentationRegistry) => Unit): Unit = {
    val registry = new RejectedPresentationRegistry
    registry.setPresentationDir(Files.createTempDirectory("rejected").toFile.getAbsolutePath)
    registry.start()
    val service = new PdfSlidesGenerationService(1)
    service.setRejectedPresentationRegistry(registry)
    try test(service, registry)
    finally {
      service.stop()
      registry.stop()
    }
  }

  it should "not convert a page of a rejected presentation" in withService { (service, registry) =>
    registry.reject(meetingId, presId)
    val page = new RecordingPage(uploadedPresentation())
    service.process(page).get(5, TimeUnit.SECONDS)
    assert(!page.converted.get())
  }

  it should "convert a page of a presentation that was not rejected" in withService { (service, _) =>
    val page = new RecordingPage(uploadedPresentation())
    service.process(page).get(5, TimeUnit.SECONDS)
    assert(page.converted.get())
  }
}
