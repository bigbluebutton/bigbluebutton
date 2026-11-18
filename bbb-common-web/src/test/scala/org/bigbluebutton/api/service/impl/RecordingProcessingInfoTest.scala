package org.bigbluebutton.api.service.impl

import java.io.File
import java.nio.file.Files

import scala.jdk.CollectionConverters._

import org.apache.commons.io.FileUtils
import org.bigbluebutton.api.domain.RecordingProcessingInfo
import org.bigbluebutton.common2.redis.{ RedisStorageService, ResqueJobs }
import org.scalatest.BeforeAndAfterEach
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers

class RecordingProcessingInfoTest extends AnyFlatSpec with Matchers with BeforeAndAfterEach {

  // Record IDs: sha1(meeting ID)-<start ms>.
  private val A = "e633b9434f359d31c1be30832b42a91ac0fb0e92-1700000000000"
  private val B = "e449065b81c433bf7e5aae59e5854db148d5fa28-1700007200000"
  private val C = "18e5f907ce98e6c297471554522029c6118e2aff-1700018000000"
  private val D = "dbebceff4b9b4683a171899bbb922ccab6a420fb-1700014400000"

  private var root: File = _
  private var service: RecordingServiceFileImpl = _

  override def beforeEach(): Unit = {
    root = Files.createTempDirectory("recording-processing").toFile
    for (dir <- Seq("recorded", "ended", "archived", "sanity", "processed", "published")) {
      new File(root, s"recording/status/$dir").mkdirs()
    }
    new File(root, "captions/inbox").mkdirs()
    service = new RecordingServiceFileImpl()
    service.setRecordingStatusDir(new File(root, "recording/status/recorded").getPath)
    service.setCaptionsDir(new File(root, "captions").getPath)
    jobs()
  }

  override def afterEach(): Unit = {
    FileUtils.deleteDirectory(root)
  }

  private def file(path: String, mtime: Long = 1700000000000L): Unit = {
    val f = new File(root, path)
    f.getParentFile.mkdirs()
    f.createNewFile()
    f.setLastModified(mtime)
  }

  // Resque's jobs, as RedisStorageService.readResqueJobs returns them.
  private def jobs(queued: Seq[String] = Nil, running: Seq[String] = Nil): Unit = {
    service.setRedisStorageService(new RedisStorageService {
      override def readResqueJobs(queuePrefix: String): ResqueJobs = {
        queuePrefix shouldBe "rap:"
        new ResqueJobs(queued.asJava, running.asJava)
      }
    })
  }

  private def queuedJob(meetingId: String, queuedAt: Option[Long] = None): String = {
    val at = queuedAt.map(t => s""","queued_at":$t""").getOrElse("")
    s"""{"class":"BigBlueButton::Resque::ProcessWorker","args":[{"meeting_id":"$meetingId","single_step":false,"format_name":"presentation"$at}]}"""
  }

  private def runningJob(meetingId: String, queue: String = "rap:publish", runAt: String = "2026-11-16T12:00:00Z"): String =
    s"""{"queue":"$queue","run_at":"$runAt","payload":{"class":"BigBlueButton::Resque::PublishWorker","args":[{"meeting_id":"$meetingId","format_name":"presentation"}]}}"""

  private def processingInfo: RecordingProcessingInfo = service.getRecordingProcessingInfo

  private def counts(i: RecordingProcessingInfo): (Int, Int, Int) = (i.queuedCount, i.runningCount, i.failedCount)

  "getRecordingProcessingInfo" should "report an empty pipeline as not processing" in {
    val i = processingInfo
    i.processing shouldBe false
    counts(i) shouldBe ((0, 0, 0))
    i.oldestQueuedTime shouldBe null
    i.oldestRunningTime shouldBe null
  }

  it should "count a recorded meeting rap-starter hasn't queued, once with its chapter breaks, from its oldest marker" in {
    file(s"recording/status/recorded/$A.done", mtime = 1700000600000L)
    file(s"recording/status/recorded/$A-1700000300000.done", mtime = 1700000300000L)

    val i = processingInfo
    i.processing shouldBe true
    counts(i) shouldBe ((1, 0, 0))
    i.oldestQueuedTime shouldBe 1700000300000L
  }

  it should "count an ended meeting whose events are to be kept, unless its archive failed" in {
    file(s"recording/status/ended/$A.done")
    file(s"recording/status/ended/$B.done")
    file(s"recording/status/archived/$B.fail")

    counts(processingInfo) shouldBe ((1, 0, 1))
  }

  it should "count a caption upload still in the inbox, from its description" in {
    file(s"captions/inbox/$A-1700000900000-track.json", mtime = 1700000900000L)
    file(s"captions/inbox/$A-1700000900000-track.txt")
    file(s"captions/inbox/$B-1700000950000-track.json.tmp")

    val i = processingInfo
    counts(i) shouldBe ((1, 0, 0))
    i.oldestQueuedTime shouldBe 1700000900000L
  }

  it should "count each failed recording once, whichever steps and formats failed" in {
    file(s"recording/status/archived/$A.fail")
    file(s"recording/status/sanity/$B.fail")
    file(s"recording/status/processed/$C-presentation.fail")
    file(s"recording/status/processed/$C-video.fail")
    file(s"recording/status/published/$D-presentation.fail")
    file(s"recording/status/published/$A-presentation.done")

    val i = processingInfo
    i.processing shouldBe false
    counts(i) shouldBe ((0, 0, 4))
  }

  it should "not count a recording left in recording/process" in {
    file(s"recording/process/presentation/$D/metadata.xml")
    file(s"recording/status/processed/$D-presentation.done")

    counts(processingInfo) shouldBe ((0, 0, 0))
  }

  it should "count Resque's queued jobs, from queued_at or else the recording's start time" in {
    jobs(queued = Seq(queuedJob(A, Some(1700009000000L)), queuedJob(B)))

    val i = processingInfo
    counts(i) shouldBe ((2, 0, 0))
    i.oldestQueuedTime shouldBe 1700007200000L
  }

  it should "count a recording with a running step once, as running" in {
    file(s"recording/status/recorded/$A.done")
    jobs(queued = Seq(queuedJob(A, Some(1700009000000L))), running = Seq(runningJob(A)))

    val i = processingInfo
    i.processing shouldBe true
    counts(i) shouldBe ((0, 1, 0))
    i.oldestQueuedTime shouldBe null
    i.oldestRunningTime shouldBe 1794830400000L
  }

  it should "report when the oldest running step started, from Resque's run_at" in {
    jobs(running = Seq(runningJob(A), runningJob(C, runAt = "2026-11-16T11:30:00Z")))

    val i = processingInfo
    counts(i) shouldBe ((0, 2, 0))
    i.oldestRunningTime shouldBe 1794828600000L
  }

  it should "take the recording's start time for a running step whose run_at it can't read" in {
    jobs(running = Seq(runningJob(A), runningJob(B, runAt = "yesterday")))

    processingInfo.oldestRunningTime shouldBe 1700007200000L
  }

  it should "count a failed recording that is queued again as queued" in {
    file(s"recording/status/processed/$A-video.fail")
    jobs(queued = Seq(queuedJob(A, Some(1700009000000L))))

    counts(processingInfo) shouldBe ((1, 0, 0))
  }

  it should "ignore a worker on another queue" in {
    jobs(running = Seq(runningJob(A, queue = "mailer")))

    counts(processingInfo) shouldBe ((0, 0, 0))
  }

  it should "still count a job it can't read" in {
    jobs(queued = Seq("not json", """{"class":"X","args":[]}"""))

    val i = processingInfo
    i.processing shouldBe true
    i.queuedCount shouldBe 2
  }

  it should "still count a worker's job it can't read as running" in {
    jobs(running = Seq("not json", """{"run_at":"2026-11-16T12:00:00Z"}"""))

    val i = processingInfo
    i.processing shouldBe true
    i.runningCount shouldBe 2
  }

  it should "fail rather than answer when Resque can't be read" in {
    service.setRedisStorageService(new RedisStorageService {
      override def readResqueJobs(queuePrefix: String): ResqueJobs = throw new RuntimeException("connection refused")
    })

    a[RuntimeException] should be thrownBy processingInfo
  }

  it should "fail rather than answer when the status directory is missing" in {
    FileUtils.deleteDirectory(new File(root, "recording/status"))

    an[IllegalStateException] should be thrownBy processingInfo
  }

  it should "fail rather than answer without a Redis connection" in {
    service.setRedisStorageService(null)

    an[IllegalStateException] should be thrownBy processingInfo
  }

  "RecordingProcessingCounter.recordId" should "take the record ID a name starts with" in {
    RecordingProcessingCounter.recordId(A) shouldBe A
    RecordingProcessingCounter.recordId(s"$A-presentation") shouldBe A
    RecordingProcessingCounter.recordId(s"$A-1700000300000") shouldBe A
    RecordingProcessingCounter.recordId(s"$A-1700000900000-track") shouldBe A
    RecordingProcessingCounter.recordId("meeting-1") shouldBe "meeting-1"
  }
}
