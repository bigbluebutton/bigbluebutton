package org.bigbluebutton.core.apps

import org.bigbluebutton.core.api._

import name.fraser.neil.plaintext.diff_match_patch
import name.fraser.neil.plaintext.diff_match_patch._
import scala.collection.mutable.Stack
import scala.collection._
import java.util.Collections

class SharedNotesModel {
  val notes = new scala.collection.mutable.HashMap[String, Note]()
  notes += ("MAIN_WINDOW" -> new Note("", "", 0, new Stack()))
  private val patcher = new diff_match_patch()
  private var notesCounter = 0;
  private var removedNotes: Set[Int] = Set()

  def patchDocument(noteID: String, patch: String, undo: Boolean = false): (Integer, String) = {
    notes.synchronized {
      val note = notes(noteID)
      val document = note.document
      var undoPatches = note.undoPatches
      var patchToApply = patch

      if (undo) {
        // If there is no undo patch to apply, return
        if (undoPatches.isEmpty) {
          return (-1, "")
        } else {
          patchToApply = undoPatches.pop()
        }
      }

      val patchObjects = patcher.patch_fromText(patchToApply)
      val result = patcher.patch_apply(patchObjects, document)

      // If it is not an undo operation, save an undo patch
      if (!undo) {
        undoPatches.push(patcher.patch_toText(patcher.patch_make(result(0).toString(), document)))
      }

      val patchCounter = note.patchCounter + 1
      notes(noteID) = new Note(note.name, result(0).toString(), patchCounter, undoPatches)
      (patchCounter, patchToApply)
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
    notes += (noteID.toString -> new Note(noteName, "", 0, new Stack()))

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