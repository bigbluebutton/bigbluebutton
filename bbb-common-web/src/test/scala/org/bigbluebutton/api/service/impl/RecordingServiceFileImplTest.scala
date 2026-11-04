package org.bigbluebutton.api.service.impl

import java.io.File
import java.nio.file.Files

import org.apache.commons.io.FileUtils
import org.scalatest.BeforeAndAfterEach
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers

class RecordingServiceFileImplTest extends AnyFlatSpec with Matchers with BeforeAndAfterEach {

  private var statusDir: File = _
  private var service: RecordingServiceFileImpl = _

  override def beforeEach(): Unit = {
    statusDir = Files.createTempDirectory("recording-status").toFile
    new File(statusDir, "recorded").mkdir()
    new File(statusDir, "ended").mkdir()
    service = new RecordingServiceFileImpl()
    service.setRecordingStatusDir(new File(statusDir, "recorded").getPath)
  }

  override def afterEach(): Unit = {
    FileUtils.deleteDirectory(statusDir)
  }

  private def marker(path: String): File = new File(statusDir, path)

  it should "create the recorded marker when a recording is handed to the pipeline" in {
    service.startIngestAndProcessing("meeting-1")

    marker("recorded/meeting-1.done") should exist
  }

  it should "create a recorded marker per chapter break" in {
    service.kickOffRecordingChapterBreak("meeting-1", 1700000000000L)

    marker("recorded/meeting-1-1700000000000.done") should exist
  }

  it should "create the ended marker in the directory next to the recorded one" in {
    service.markAsEnded("meeting-1")

    marker("ended/meeting-1.done") should exist
  }

  it should "leave an existing marker in place" in {
    service.startIngestAndProcessing("meeting-1")

    noException should be thrownBy service.startIngestAndProcessing("meeting-1")
    marker("recorded/meeting-1.done") should exist
  }

  it should "not throw when the marker cannot be created" in {
    FileUtils.deleteDirectory(marker("ended"))

    noException should be thrownBy service.markAsEnded("meeting-1")
    marker("ended/meeting-1.done") should not(exist)
  }
}
