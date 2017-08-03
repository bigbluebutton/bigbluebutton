package org.bigbluebutton.api.util

import java.io.File
import java.util

import org.apache.commons.io.FileUtils
import org.bigbluebutton.api.RecordingService

class RecordingServiceTest extends UnitSpec {

  it should "deserialize playback part of metadata.xml" in {
    val srcXml = new File("src/test/resources/breakout-room-metadata.xml")
    val metaParams: util.Map[String, String] = new util.TreeMap[String, String]()

    metaParams.put("foo", "bar")
    metaParams.put("bar", "baz")

    val destXml = new File("target/updated-metadata.xml")
    RecordingService.updateRecordingMetadata(srcXml, metaParams, destXml)
  }

  it should "publish recording" in {
    // Make a copy of our sample recording
    val destDir = new File("target/sample-recording/publish")
    if (destDir.exists()) FileUtils.deleteDirectory(destDir)

    val srcDir = new File("src/test/resources/sample-recording")
    FileUtils.copyDirectory(srcDir, destDir)

    val recordingId = "foo"
    val recordingDir = new File(destDir.getPath() + File.separatorChar + recordingId)

    val publishedDir = new File("target/recording/published")
    RecordingService.publishRecording(publishedDir, recordingId, recordingDir, "presentation")

    assert(true)
  }

  it should "unpublish recording" in {
    // Make a copy of our sample recording
    val destDir = new File("target/sample-recording/unpublish")
    if (destDir.exists()) FileUtils.deleteDirectory(destDir)

    val srcDir = new File("src/test/resources/sample-recording")
    FileUtils.copyDirectory(srcDir, destDir)

    val recordingId = "foo"
    val recordingDir = new File(destDir.getPath() + File.separatorChar + recordingId)

    val unpublishedDir = new File("target/recording/unpublished")
    if (unpublishedDir.exists()) FileUtils.deleteDirectory(unpublishedDir)

    RecordingService.unpublishRecording(unpublishedDir, recordingId, recordingDir, "presentation")

    assert(unpublishedDir.exists())
  }

  it should "delete recording" in {
    // Make a copy of our sample recording
    val destDir = new File("target/sample-recording/delete")
    if (destDir.exists()) FileUtils.deleteDirectory(destDir)

    val srcDir = new File("src/test/resources/sample-recording")
    FileUtils.copyDirectory(srcDir, destDir)

    val recordingId = "foo"
    val recordingDir = new File(destDir.getPath() + File.separatorChar + recordingId)

    val deletedDir = new File("target/recording/deleted")
    if (deletedDir.exists()) FileUtils.deleteDirectory(deletedDir)

    RecordingService.deleteRecording(deletedDir, recordingId, recordingDir, "presentation")

    assert(deletedDir.exists())
  }

}
