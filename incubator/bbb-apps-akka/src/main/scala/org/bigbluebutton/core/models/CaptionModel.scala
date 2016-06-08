package org.bigbluebutton.core.models

import scala.collection.mutable.ArrayBuffer
import scala.collection.immutable.HashMap

class CaptionModel {
  var transcripts = Map[String, Array[String]]()

  def newTranscript(locale: String, ownerId: String) {
    transcripts += locale -> Array(ownerId, "")
  }

  def findLocaleByOwnerId(userId: String): Option[String] = {
    transcripts.find(_._2(0) == userId).foreach(t => {
      return Some(t._1)
    })

    return None
  }

  def changeTranscriptOwner(locale: String, ownerId: String) {
    if (transcripts contains locale) {
      transcripts(locale)(0) = ownerId
    }
  }

  def getHistory(): Map[String, Array[String]] = {
    var history = Map[String, Array[String]]()

    transcripts.foreach(t => {
      history += t._1 -> Array(t._2(0), t._2(1))
    })

    history
  }

  def editHistory(startIndex: Integer, endIndex: Integer, locale: String, text: String) {

    if (transcripts contains locale) {

      var oText: String = transcripts(locale)(1)

      if (startIndex >= 0 && endIndex <= oText.length && startIndex <= endIndex) {

        var sText: String = oText.substring(0, startIndex)
        var eText: String = oText.substring(endIndex)

        transcripts(locale)(1) = (sText + text + eText)

      }
    }
  }
}