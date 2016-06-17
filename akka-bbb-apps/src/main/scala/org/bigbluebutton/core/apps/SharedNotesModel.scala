package org.bigbluebutton.core.apps

import org.bigbluebutton.core.api._

import name.fraser.neil.plaintext.diff_match_patch
import name.fraser.neil.plaintext.diff_match_patch._
import scala.collection._
import java.util.Collections

class SharedNotesModel {
  val notes = new scala.collection.mutable.HashMap[String, Note]()
  notes += ("MAIN_WINDOW" -> new Note("", ""))
  private val patcher = new diff_match_patch()
  private var notesCounter = 0;
  private var removedNotes: Set[Int] = Set()

  def patchDocument(noteID: String, patch: String) {
    notes.synchronized {
      val note = notes(noteID)
      val document = note.document
      val patchObjects = patcher.patch_fromText(patch)
      val result = patcher.patch_apply(patchObjects, document)
      notes(noteID) = new Note(note.name, result(0).toString())
    }
  }

  def createNote(noteName: String = ""): String = {
    var noteID = 0
    if (removedNotes.isEmpty) {
      notesCounter += 1
      noteID = notesCounter
    } else {
      noteID = removedNotes.min
      removedNotes -= noteID
    }
    notes += (noteID.toString -> new Note(noteName, ""))

    noteID.toString
  }

  def destroyNote(noteID: String) {
    removedNotes += noteID.toInt
    notes -= noteID
  }

  def notesSize(): Int = {
    notes.size
  }
}