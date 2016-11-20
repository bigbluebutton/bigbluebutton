package org.bigbluebutton.core.apps

import org.bigbluebutton.core.api._
import org.bigbluebutton.core.api.SharedNotesOperation._
import name.fraser.neil.plaintext.diff_match_patch
import name.fraser.neil.plaintext.diff_match_patch._
import scala.collection.mutable.Stack
import scala.collection.mutable.HashMap
import scala.collection._
import java.util.Collections

class SharedNotesModel {
  val notes = new HashMap[String, Note]()
  notes += ("MAIN_WINDOW" -> new Note("", "", 0, new Stack(), new Stack()))
  private val patcher = new diff_match_patch()
  private var notesCounter = 0;
  private var removedNotes: Set[Int] = Set()
  private val maxUndoStackSize = 30

  def patchDocument(noteID: String, patch: String, operation: SharedNotesOperation): (Integer, String, Boolean, Boolean) = {
    notes.synchronized {
      val note = notes(noteID)
      val document = note.document
      var undoPatches = note.undoPatches
      var redoPatches = note.redoPatches

      var patchToApply = operation match {
        case SharedNotesOperation.PATCH => {
          patch
        }
        case SharedNotesOperation.UNDO => {
          if (undoPatches.isEmpty) {
            return (-1, "", false, false)
          } else {
            val (undo, redo) = undoPatches.pop()
            redoPatches.push((undo, redo))
            undo
          }
        }
        case SharedNotesOperation.REDO => {
          if (redoPatches.isEmpty) {
            return (-1, "", false, false)
          } else {
            val (undo, redo) = redoPatches.pop()
            undoPatches.push((undo, redo))
            redo
          }
        }
      }

      val patchObjects = patcher.patch_fromText(patchToApply)
      val result = patcher.patch_apply(patchObjects, document)

      // If it is a patch operation, save an undo patch and clear redo stack
      if (operation == SharedNotesOperation.PATCH) {
        undoPatches.push((patcher.custom_patch_make(result(0).toString(), document), patchToApply))
        redoPatches.clear

        if (undoPatches.size > maxUndoStackSize) {
          undoPatches = undoPatches.dropRight(1)
        }
      }

      val patchCounter = note.patchCounter + 1
      notes(noteID) = new Note(note.name, result(0).toString(), patchCounter, undoPatches, redoPatches)
      (patchCounter, patchToApply, !undoPatches.isEmpty, !redoPatches.isEmpty)
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
    notes += (noteID.toString -> new Note(noteName, "", 0, new Stack(), new Stack()))

    noteID.toString
  }

  def destroyNote(noteID: String) {
    removedNotes += noteID.toInt
    notes -= noteID
  }

  def notesSize(): Int = {
    notes.size
  }

  def notesReport: HashMap[String, NoteReport] = {
    notes.synchronized {
      var report = new HashMap[String, NoteReport]()
      notes foreach {
        case (id, note) =>
          report += (id -> noteToReport(note))
      }
      report
    }
  }

  def getNoteReport(noteID: String): Option[NoteReport] = {
    notes.synchronized {
      notes.get(noteID) match {
        case Some(note) => Some(noteToReport(note))
        case None => None
      }
    }
  }

  private def noteToReport(note: Note): NoteReport = {
    new NoteReport(note.name, note.document, note.patchCounter, !note.undoPatches.isEmpty, !note.redoPatches.isEmpty)
  }
}