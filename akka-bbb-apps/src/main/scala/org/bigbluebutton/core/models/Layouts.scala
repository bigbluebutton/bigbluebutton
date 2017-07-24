package org.bigbluebutton.core.models

object Layouts {
  private var setByUser: String = "system";
  private var currentLayout = "";
  // this is not being set by the client, and we need to apply the layouts to all users, not just viewers, so will keep the default value of this as false
  private var affectViewersOnly = false

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

class Layouts {
}
