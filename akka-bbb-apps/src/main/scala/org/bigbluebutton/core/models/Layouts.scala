package org.bigbluebutton.core.models

object Layouts {
  def setCurrentLayout(instance: Layouts, layout: String, setBy: String) {
    instance.currentLayout = layout
    instance.setByUser = setBy;
  }

  def getCurrentLayout(instance: Layouts): String = {
    instance.currentLayout
  }

  def applyToViewersOnly(instance: Layouts, viewersOnly: Boolean) {
    instance.affectViewersOnly = viewersOnly
  }

  def doesLayoutApplyToViewersOnly(instance: Layouts): Boolean = {
    instance.affectViewersOnly
  }

  def getLayoutSetter(instance: Layouts): String = {
    instance.setByUser
  }
}

class Layouts {
  private var setByUser: String = "system";
  private var currentLayout = "";
  // this is not being set by the client, and we need to apply the layouts to all users, not just viewers, so will keep the default value of this as false
  private var affectViewersOnly = true
}
