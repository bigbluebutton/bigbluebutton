package org.bigbluebutton.api.service.impl

import spock.lang.Specification
import spock.lang.TempDir

import java.nio.file.Files
import java.nio.file.Path

/**
 * Covers holdUploadsForRecording, which drops the .recording-hold marker in a
 * meeting's uploads directory at meeting end. The marker makes bbb-file-upload
 * defer its retention cleanup until the record-and-playback archive has copied
 * the pasted images, closing the window where an archive that starts later
 * than the retention period would find the uploads already deleted.
 */
class RecordingServiceFileImplSpec extends Specification {

  private static final String MEETING_ID = 'mtg-1'
  private static final String MARKER = '.recording-hold'

  @TempDir
  Path baseDir

  RecordingServiceFileImpl service

  def setup() {
    service = new RecordingServiceFileImpl()
    service.setPresentationBaseDir(baseDir.toString())
  }

  private Path uploadsDir() {
    return baseDir.resolve(MEETING_ID).resolve('uploads')
  }

  def "drops the recording-hold marker in an existing uploads directory"() {
    given: 'a meeting with pasted images on disk'
    Files.createDirectories(uploadsDir())

    when:
    service.holdUploadsForRecording(MEETING_ID)

    then:
    Files.exists(uploadsDir().resolve(MARKER))
  }

  def "does not create anything when the meeting has no uploads directory"() {
    when: 'the meeting never had an image pasted'
    service.holdUploadsForRecording(MEETING_ID)

    then: 'no directory is conjured up just to hold a marker'
    !Files.exists(baseDir.resolve(MEETING_ID))
  }

  def "is idempotent when the marker already exists"() {
    given: 'the archive (or a previous call) already dropped the marker'
    Files.createDirectories(uploadsDir())
    Files.createFile(uploadsDir().resolve(MARKER))

    when:
    service.holdUploadsForRecording(MEETING_ID)

    then:
    notThrown(Exception)
    Files.exists(uploadsDir().resolve(MARKER))
  }
}
