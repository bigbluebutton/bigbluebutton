package org.bigbluebutton.apps.layout

import org.bigbluebutton.apps.layout.data.Layout

class LayoutApp {
  private var layouts = new collection.immutable.HashMap[String, Layout]()

  private var layoutLocked = false

  private def saveLayout(layout: Layout) = {
    layouts += layout.id -> layout
  }

  def currentLayout(): Option[Layout] = {
    layouts.values find { l => l.current }
  }

  def newLayout(id: String, layout: String, default: Boolean): Layout = {
    val lout = Layout(id, layout, default)
    saveLayout(lout)
    lout
  }

  def deactivateCurrentLayout() = {
    currentLayout foreach { cl =>
      saveLayout(cl.copy(current = false))
    }
  }

  def lockLayout(id: String, lock: Boolean): Option[Layout] = {
    layouts.get(id) match {
      case Some(lout) => {
        layoutLocked = lock
        Some(lout)
      }
      case None => None
    }
  }

  def setLayout(id: String): Option[Layout] = {
    layouts.get(id) match {
      case Some(lout) => {
        val l = lout.copy(current = true)
        saveLayout(l)
        Some(l)
      }
      case None => None
    }
  }
}