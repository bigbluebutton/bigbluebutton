package org.bigbluebutton.core.models

import org.bigbluebutton.core.domain.IntUserId

class LayoutModel {
  private var setByUser: IntUserId = IntUserId("system")
  private var currentLayout = "";
  private var layoutLocked = false
  private var affectViewersOnly = true

  def setCurrentLayout(layout: String) {
    currentLayout = layout
  }

  def getCurrentLayout(): String = {
    currentLayout
  }

  def applyToViewersOnly(viewersOnly: Boolean) {
    affectViewersOnly = viewersOnly
  }

  def doesLayoutApplyToViewersOnly(): Boolean = {
    affectViewersOnly
  }

  def getLayoutSetter(): IntUserId = {
    setByUser
  }
}