package org.bigbluebutton.core.apps

import org.bigbluebutton.common2.msgs.TranscriptVO
import scala.collection.immutable.HashMap

class CaptionModel {
  private var transcripts = new HashMap[String, TranscriptVO]()

  private def createTranscript(locale: String, localeCode: String, ownerId: String): TranscriptVO = {
    val transcript = TranscriptVO(ownerId, "", localeCode)
    transcripts += locale -> transcript
    transcript
  }

  private def findTranscriptByOwnerId(userId: String): Option[(String, TranscriptVO)] = {
    transcripts.find(_._2.ownerId == userId).foreach(t => {
      return Some(t)
    })

    return None
  }

  def updateTranscriptOwner(locale: String, localeCode: String, ownerId: String): Map[String, TranscriptVO] = {
    var updatedTranscripts = new HashMap[String, TranscriptVO]

    // clear owner from previous locale
    if (ownerId.length > 0) {
      findTranscriptByOwnerId(ownerId).foreach(t => {
        val oldTranscript = t._2.copy(ownerId = "")

        transcripts += t._1 -> oldTranscript
        updatedTranscripts += t._1 -> oldTranscript
      })
    }
    // change the owner if it does exist
    if (transcripts contains locale) {
      val newTranscript = transcripts(locale).copy(ownerId = ownerId)

      transcripts += locale -> newTranscript
      updatedTranscripts += locale -> newTranscript
    } else { // create the locale if it doesn't exist
      val addedTranscript = createTranscript(locale, localeCode, ownerId)
      updatedTranscripts += locale -> addedTranscript
    }

    updatedTranscripts
  }

  def getHistory(): Map[String, TranscriptVO] = {
    transcripts
  }

  def editHistory(userId: String, startIndex: Integer, endIndex: Integer, locale: String, text: String): Boolean = {
    var successfulEdit = false
    //println("editHistory entered")
    if (transcripts contains locale) {
      val oldTranscript = transcripts(locale)
      if (oldTranscript.ownerId == userId) {
        //println("editHistory found locale:" + locale)
        val oText: String = transcripts(locale).text

        if (startIndex >= 0 && endIndex <= oText.length && startIndex <= endIndex) {
          //println("editHistory passed index test")
          val sText: String = oText.substring(0, startIndex)
          val eText: String = oText.substring(endIndex)

          transcripts += locale -> transcripts(locale).copy(text = (sText + text + eText))
          //println("editHistory new history is: " + transcripts(locale).text)
          successfulEdit = true
        }
      }
    }

    successfulEdit
  }

  def checkCaptionOwnerLogOut(userId: String): Option[(String, TranscriptVO)] = {
    var rtnTranscript: Option[(String, TranscriptVO)] = None

    if (userId.length > 0) {
      findTranscriptByOwnerId(userId).foreach(t => {
        val oldTranscript = t._2.copy(ownerId = "")

        transcripts += t._1 -> oldTranscript
        rtnTranscript = Some((t._1, oldTranscript))
      })
    }
    rtnTranscript
  }

  def isUserCaptionOwner(userId: String, locale: String): Boolean = {
    var isOwner: Boolean = false;

    if (transcripts.contains(locale) && transcripts(locale).ownerId == userId) {
      isOwner = true;
    }

    isOwner
  }
}