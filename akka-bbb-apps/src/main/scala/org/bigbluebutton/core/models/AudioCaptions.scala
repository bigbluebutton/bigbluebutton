package org.bigbluebutton.core.models

import scala.collection.immutable.HashMap

import org.bigbluebutton.SystemConfiguration

object AudioCaptions extends SystemConfiguration {
  val MaxLocalesPerMeeting = 20

  def parseTranscript(transcript: String): String = {
    transcript
  }

  /*
   * @return : (start, end, text)
   */
  def editTranscript(
      audioCaptions: AudioCaptions,
      userId:        String,
      transcriptId:  String,
      start:         Int,
      end:           Int,
      text:          String,
      transcript:    String,
      locale:        String
  ): Option[(Int, Int, String)] = {
    if (audioCaptions.transcripts contains locale) {
      Some(audioCaptions.updateTranscript(
        userId,
        transcriptId,
        start,
        end,
        text,
        transcript,
        locale
      ))
    } else if (audioCaptions.localeCount >= MaxLocalesPerMeeting) {
      None
    } else Some(audioCaptions.addTranscript(userId, transcriptId, transcript, locale))
  }
}

class AudioCaptions {
  private var transcripts = new HashMap[String, Transcript]()

  def localeCount: Int = transcripts.size

  private def clampToInt(value: Long): Int =
    Math.max(0L, Math.min(value, Int.MaxValue.toLong)).toInt

  /*
   * @return : (start, end, text)
   */
  private def updateTranscript(
      userId:       String,
      transcriptId: String,
      start:        Int,
      end:          Int,
      text:         String,
      transcript:   String,
      locale:       String
  ): (Int, Int, String) = {
    val item = transcripts(locale)

    // Only the user who opened this transcript may edit it in place. A foreign
    // submission carrying someone else's transcriptId falls through to the
    // rollover branch below, so it appends its own segment instead of
    // addressing characters another user authored.
    if (item.currentId == transcriptId && item.ownerUserId == userId) {
      // The client diffs against the transcript the server already holds, so
      // offsets outside it cannot be honoured.
      val previousLength = item.currentTranscript.length
      val safeStart = Math.max(0, Math.min(start, previousLength))
      val safeEnd = Math.max(safeStart, Math.min(end, previousLength))

      transcripts += locale -> item.copy(currentTranscript = transcript)

      (
        clampToInt(item.fullTranscriptLength + safeStart),
        clampToInt(item.fullTranscriptLength + safeEnd),
        text
      )
    } else {
      val fullTranscriptLength = item.fullTranscriptLength + item.currentTranscript.length
      transcripts += locale -> new Transcript(
        fullTranscriptLength,
        transcriptId,
        transcript,
        userId
      )

      (clampToInt(fullTranscriptLength), clampToInt(fullTranscriptLength), s"${transcript}")
    }
  }

  /*
   * @return : (start, end, text)
   */
  private def addTranscript(
      userId:       String,
      transcriptId: String,
      transcript:   String,
      locale:       String
  ): (Int, Int, String) = {
    transcripts += locale -> new Transcript(0L, transcriptId, transcript, userId)

    (0, 0, transcript)
  }
}

case class Transcript(fullTranscriptLength: Long, currentId: String, currentTranscript: String, ownerUserId: String)
