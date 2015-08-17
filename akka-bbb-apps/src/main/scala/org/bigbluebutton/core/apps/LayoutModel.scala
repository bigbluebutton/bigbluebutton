package org.bigbluebutton.core.apps

class LayoutModel {
  private var setByUser: String = "system";
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

  def getLayoutSetter(): String = {
    setByUser
  }
}