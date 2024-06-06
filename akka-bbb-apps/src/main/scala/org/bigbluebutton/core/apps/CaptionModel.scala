package org.bigbluebutton.core.apps

import org.bigbluebutton.common2.msgs.TranscriptVO
import scala.collection.immutable.HashMap

class CaptionModel {
  private var transcripts = new HashMap[String, TranscriptVO]()

  private def createTranscript(name: String, locale: String, ownerId: String): TranscriptVO = {
    val transcript = TranscriptVO(ownerId, "", locale)
    transcripts += name -> transcript
    transcript
  }

  private def findTranscriptByOwnerId(userId: String): Option[(String, TranscriptVO)] = {
    transcripts.find(_._2.ownerId == userId).foreach(t => {
      return Some(t)
    })

    return None
  }

  def updateTranscriptOwner(name: String, locale: String, ownerId: String): Map[String, TranscriptVO] = {
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
    if (transcripts contains name) {
      val newTranscript = transcripts(name).copy(ownerId = ownerId)

      transcripts += name -> newTranscript
      updatedTranscripts += name -> newTranscript
    } else { // create the locale if it doesn't exist
      val addedTranscript = createTranscript(name, locale, ownerId)
      updatedTranscripts += name -> addedTranscript
    }

    updatedTranscripts
  }

  def getHistory(): Map[String, TranscriptVO] = {
    transcripts
  }

  def editHistory(userId: String, startIndex: Integer, endIndex: Integer, name: String, text: String): Boolean = {
    var successfulEdit = false
    //println("editHistory entered")
    if (transcripts contains name) {
      val oldTranscript = transcripts(name)
      if (oldTranscript.ownerId == userId || userId == "system") {
        //println("editHistory found name:" + name)
        val oText: String = transcripts(name).text

        if (startIndex >= 0 && endIndex <= oText.length && startIndex <= endIndex) {
          //println("editHistory passed index test")
          val sText: String = oText.substring(0, startIndex)
          val eText: String = oText.substring(endIndex)

          transcripts += name -> transcripts(name).copy(text = (sText + text + eText))
          //println("editHistory new history is: " + transcripts(name).text)
          successfulEdit = true
        }
      }
    }

    successfulEdit
  }

  def getTextTail(name: String): String = {
    var tail = ""
    if (transcripts contains name) {
      val text = transcripts(name).text
      if (text.size > 256) {
        tail = text.slice(text.size - 256, text.size)
      } else {
        tail = text
      }
    }

    tail
  }

  def getLocale(name: String): String = {
    var locale = ""
    if (transcripts contains name) {
      locale = transcripts(name).locale
    }

    locale
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

  def isUserCaptionOwner(userId: String, name: String): Boolean = {
    var isOwner: Boolean = false;

    if (transcripts.contains(name) && transcripts(name).ownerId == userId) {
      isOwner = true;
    }

    isOwner
  }
}