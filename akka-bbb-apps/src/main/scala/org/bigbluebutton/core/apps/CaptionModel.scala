package org.bigbluebutton.core.apps

import scala.collection.mutable.ArrayBuffer
import scala.collection.immutable.HashMap

class CaptionModel {
  var transcripts = Map[String, ArrayBuffer[String]]()
  var currentLines = Map[String, String]()

  def getHistory(): Map[String, Array[String]] = {
    var history = Map[String, Array[String]]()

    transcripts.foreach(t => {
      history += t._1 -> t._2.toArray
    })

    history
  }

  def addNewLine(locale: String, text: String) {
    if (transcripts contains locale) {
      // do nothing
    } else {
      transcripts += locale -> new ArrayBuffer[String]()
    }
    transcripts(locale) append text
  }

  def updateCurrentLine(locale: String, text: String) {
    currentLines += locale -> text
  }
}