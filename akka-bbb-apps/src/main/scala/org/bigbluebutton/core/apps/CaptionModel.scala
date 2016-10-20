package org.bigbluebutton.core.apps

import scala.collection.mutable.ArrayBuffer
import scala.collection.immutable.HashMap

class CaptionModel {
  var transcripts = Map[String, Array[String]]()

  def newTranscript(locale: String, localeCode: String, ownerId: String) {
    transcripts += locale -> Array(ownerId, "", localeCode)
  }

  def findLocaleByOwnerId(userId: String): Option[String] = {
    transcripts.find(_._2(0) == userId).foreach(t => {
      return Some(t._1)
    })

    return None
  }

  def findLocaleCodeByLocale(locale: String): String = {
    if (transcripts contains locale) {
      return transcripts(locale)(2)
    }

    return ""
  }

  def changeTranscriptOwner(locale: String, ownerId: String) {
    if (transcripts contains locale) {
      transcripts(locale)(0) = ownerId
    }
  }

  def getHistory(): Map[String, Array[String]] = {
    var history = Map[String, Array[String]]()

    transcripts.foreach(t => {
      history += t._1 -> Array(t._2(0), t._2(1), t._2(2))
    })

    history
  }

  def editHistory(startIndex: Integer, endIndex: Integer, locale: String, text: String) {
    //println("editHistory entered")
    if (transcripts contains locale) {
      //println("editHistory found locale:" + locale)
      var oText: String = transcripts(locale)(1)

      if (startIndex >= 0 && endIndex <= oText.length && startIndex <= endIndex) {
        //println("editHistory passed index test")
        var sText: String = oText.substring(0, startIndex)
        var eText: String = oText.substring(endIndex)

        transcripts(locale)(1) = (sText + text + eText)
        //println("editHistory new history is: " + transcripts(locale)(1))
      }
    }
  }
}