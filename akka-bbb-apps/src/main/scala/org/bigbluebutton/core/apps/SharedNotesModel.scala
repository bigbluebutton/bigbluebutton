package org.bigbluebutton.core.apps

import name.fraser.neil.plaintext.diff_match_patch

import scala.collection._
import scala.collection.immutable.List
import scala.collection.mutable.HashMap

import org.bigbluebutton.SystemConfiguration
import org.bigbluebutton.common2.msgs.Note
import org.bigbluebutton.common2.msgs.NoteReport
import org.bigbluebutton.core.models.SystemUser

class SharedNotesModel extends SystemConfiguration {
  val MAIN_NOTE_ID = "MAIN_NOTE"
  val SYSTEM_ID = SystemUser.ID

  private val patcher = new diff_match_patch()

  private var notesCounter = 0;
  private var removedNotes: Set[Int] = Set()

  val notes = new HashMap[String, Note]()
  notes += (MAIN_NOTE_ID -> new Note("", "", 0, List[(String, String)](), List[(String, String)]()))

  def patchNote(noteId: String, patch: String, operation: String): (Integer, String, Boolean, Boolean) = {
    val note = notes(noteId)
    val document = note.document
    var undoPatches = note.undoPatches
    var redoPatches = note.redoPatches

    var patchToApply = operation match {
      case "PATCH" => {
        patch
      }
      case "UNDO" => {
        if (undoPatches.isEmpty) {
          return (-1, "", false, false)
        } else {
          val (undo, redo) = undoPatches.head
          undoPatches = undoPatches.tail
          redoPatches = (undo, redo) :: redoPatches
          undo
        }
      }
      case "REDO" => {
        if (redoPatches.isEmpty) {
          return (-1, "", false, false)
        } else {
          val (undo, redo) = redoPatches.head
          redoPatches = redoPatches.tail
          undoPatches = (undo, redo) :: undoPatches
          redo
        }
      }
    }

    val patchObjects = patcher.patch_fromText(patchToApply)
    val result = patcher.patch_apply(patchObjects, document)

    // If it is a patch operation, save an undo patch and clear redo stack
    if (operation == "PATCH") {
      undoPatches = (patcher.custom_patch_make(result(0).toString(), document), patchToApply) :: undoPatches
      redoPatches = List[(String, String)]()

      if (undoPatches.size > maxNumberOfUndos) {
        undoPatches = undoPatches.dropRight(1)
      }
    }

    val patchCounter = note.patchCounter + 1
    notes(noteId) = new Note(note.name, result(0).toString(), patchCounter, undoPatches, redoPatches)
    (patchCounter, patchToApply, !undoPatches.isEmpty, !redoPatches.isEmpty)
  }

  def clearNote(noteId: String): Option[NoteReport] = {
    val note = notes(noteId)
    val patchCounter = note.patchCounter + 1
    notes(noteId) = new Note(note.name, "", patchCounter, List[(String, String)](), List[(String, String)]())
    getNoteReport(noteId)
  }

  def createNote(noteName: String = ""): (String, Boolean) = {
    var noteId = 0
    if (removedNotes.isEmpty) {
      notesCounter += 1
      noteId = notesCounter
    } else {
      noteId = removedNotes.min
      removedNotes -= noteId
    }
    notes += (noteId.toString -> new Note(noteName, "", 0, List[(String, String)](), List[(String, String)]()))

    (noteId.toString, isNotesLimit)
  }

  def destroyNote(noteId: String): Boolean = {
    removedNotes += noteId.toInt
    notes -= noteId
    isNotesLimit
  }

  def notesReport: HashMap[String, NoteReport] = {
    var report = new HashMap[String, NoteReport]()
    notes foreach {
      case (id, note) =>
        report += (id -> noteToReport(note))
    }
    report
  }

  def getNoteReport(noteId: String): Option[NoteReport] = {
    notes.get(noteId) match {
      case Some(note) => Some(noteToReport(note))
      case None       => None
    }
  }

  def isNotesLimit: Boolean = {
    notes.size >= maxNumberOfNotes
  }

  private def noteToReport(note: Note): NoteReport = {
    new NoteReport(note.name, note.document, note.patchCounter, !note.undoPatches.isEmpty, !note.redoPatches.isEmpty)
  }
}