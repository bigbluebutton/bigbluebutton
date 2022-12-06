package org.bigbluebutton.core.models

import scala.collection.immutable.HashMap

import org.bigbluebutton.SystemConfiguration

object AudioCaptions extends SystemConfiguration {
  def setFloor(audioCaptions: AudioCaptions, userId: String) = audioCaptions.floor = userId

  def isFloor(audioCaptions: AudioCaptions, userId: String) = audioCaptions.floor == userId

  def parseTranscript(transcript: String): String = {
    val words = transcript.split("\\s+") // Split on whitespaces
    val lines = words.grouped(transcriptWords).toArray // Group each X words into lines
    lines.takeRight(transcriptLines).map(l => l.mkString(" ")).mkString("\n") // Join the last X lines
  }

  /*
   * @return : (start, end, text)
   */
  def editTranscript(
      audioCaptions: AudioCaptions,
      transcriptId:  String,
      start:         Int,
      end:           Int,
      text:          String,
      transcript:    String,
      locale:        String
  ): (Int, Int, String) = {
    if (audioCaptions.transcripts contains locale) {
      audioCaptions.updateTranscript(
        transcriptId,
        start,
        end,
        text,
        transcript,
        locale
      )
    } else audioCaptions.addTranscript(transcriptId, transcript, locale)
  }
}

class AudioCaptions {
  private var transcripts = new HashMap[String, Transcript]()
  private var floor: String = ""

  /*
   * @return : (start, end, text)
   */
  private def updateTranscript(
      transcriptId: String,
      start:        Int,
      end:          Int,
      text:         String,
      transcript:   String,
      locale:       String
  ): (Int, Int, String) = {
    val item = transcripts(locale)

    // If updating the current transcript
    if (item.currentId == transcriptId) {
      transcripts += locale -> item.copy(currentTranscript = transcript)

      (item.fullTranscript.length + start, item.fullTranscript.length + end, text)
    } else {
      val fullTranscript = s"${item.fullTranscript}${item.currentTranscript}"
      transcripts += locale -> new Transcript(
        fullTranscript,
        transcriptId,
        transcript
      )

      (fullTranscript.length, fullTranscript.length, s"${transcript}")
    }
  }

  /*
   * @return : (start, end, text)
   */
  private def addTranscript(
      transcriptId: String,
      transcript:   String,
      locale:       String
  ): (Int, Int, String) = {
    transcripts += locale -> new Transcript("", transcriptId, transcript)

    (0, 0, transcript)
  }
}

case class Transcript(fullTranscript: String, currentId: String, currentTranscript: String)
