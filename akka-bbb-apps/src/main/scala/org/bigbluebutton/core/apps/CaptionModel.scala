package org.bigbluebutton.core.apps

import scala.collection.mutable.ArrayBuffer
import scala.collection.immutable.HashMap

class CaptionModel {
  var transcripts = Map[String, String]()

  def newTranscript(locale: String, ownerId: String) {
    // transcripts += locale -> Array(ownerId, "")
  }
  /*
  def findLocaleByOwnerId(userId: String): Option[String] {
    transcripts.foreach(t => {
      if (t._2[0] == userId) {
        return Some(t._1)
      }
    })
	
	return None
  }
*/
  def getHistory(): Map[String, String] = {
    var history = Map[String, String]()

    transcripts.foreach(t => {
      history += t._1 -> t._2
    })

    history
  }

  def editHistory(startIndex: Integer, endIndex: Integer, locale: String, text: String) {
    if (transcripts contains locale) {
      var oText: String = transcripts(locale)

      if (startIndex >= 0 && endIndex < oText.length && startIndex <= endIndex) {
        var sText: String = oText.substring(0, startIndex)
        var eText: String = oText.substring(endIndex)

        transcripts += locale -> (sText + text + eText)
      }
    } else {
      transcripts += locale -> text
    }
  }
}