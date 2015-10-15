package org.bigbluebutton.core.apps

import scala.collection.mutable.ArrayBuffer
import scala.collection.immutable.HashMap

class CaptionModel {
  var transcripts = Map[String, ArrayBuffer[String]]()

  def getCaptionHistory(): Map[String, Array[String]] = {
    var history = Map[String, Array[String]]()

    transcripts.foreach(t => {
      history += t._1 -> t._2.toArray
    })

    history
  }

  def addNewCaptionLine(locale: String, text: String) {
    if (transcripts contains locale) {
      // do nothing
    } else {
      transcripts += locale -> new ArrayBuffer[String]()
    }
    transcripts(locale) append text
  }
}