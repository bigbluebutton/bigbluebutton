package org.bigbluebutton.core.models

import scala.collection.mutable.Map

object Layouts {
  def setCurrentLayout(instance: Layouts, layout: String) {
    instance.currentLayout = layout
  }

  def getCurrentLayout(instance: Layouts): String = {
    instance.currentLayout
  }

  def setPushLayout(instance: Layouts, pushLayout: Boolean) {
    instance.pushLayout = pushLayout
  }

  def getPushLayout(instance: Layouts): Boolean = {
    instance.pushLayout
  }

  def setPresentationIsOpen(instance: Layouts, p: Boolean) = {
    instance.presentationIsOpen = p
  }

  def getPresentationIsOpen(instance: Layouts): Boolean = {
    instance.presentationIsOpen
  }

  def setCameraPosition(instance: Layouts, cp: String) = {
    instance.cameraPosition = cp
  }

  def getCameraPosition(instance: Layouts): String = {
    instance.cameraPosition
  }

  def setFocusedCamera(instance: Layouts, fc: String) = {
    instance.focusedCamera = fc
  }

  def getFocusedCamera(instance: Layouts): String = {
    instance.focusedCamera
  }

  // the dock size as a fraction (0-1) of the area it sits in, along its axis; 0 = not set
  def setCameraDockSize(instance: Layouts, size: Double) = {
    instance.cameraDockSize = size
  }

  def getCameraDockSize(instance: Layouts): Double = {
    instance.cameraDockSize
  }

  def setScreenshareAsContent(instance: Layouts, screenshareAsContent: Boolean) = {
    instance.screenshareAsContent = screenshareAsContent
  }

  def getScreenshareAsContent(instance: Layouts): Boolean = {
    instance.screenshareAsContent
  }

  def setHideUsersWithoutCamera(instance: Layouts, hideUsersWithoutCamera: Boolean) = {
    instance.hideUsersWithoutCamera = hideUsersWithoutCamera
  }

  def getHideUsersWithoutCamera(instance: Layouts): Boolean = {
    instance.hideUsersWithoutCamera
  }

  def setRequestedBy(instance: Layouts, setBy: String) = {
    instance.setByUser = setBy;
  }

  def getLayoutSetter(instance: Layouts): String = {
    instance.setByUser
  }
}

class Layouts {
  private var setByUser: String = "system";
  private var currentLayout = "";
  private var pushLayout: Boolean = false;
  private var presentationIsOpen: Boolean = true;
  private var cameraPosition: String = "";
  private var focusedCamera: String = "none";
  private var cameraDockSize: Double = 0;
  private var screenshareAsContent: Boolean = false;
  private var hideUsersWithoutCamera: Boolean = false;
}

object LayoutsType {
  val layoutsType = Map(
    "unified" -> "UNIFIED_LAYOUT",
    "custom" -> "CUSTOM_LAYOUT",
    "smart" -> "SMART_LAYOUT",
    "presentationFocus" -> "PRESENTATION_FOCUS",
    "videoFocus" -> "VIDEO_FOCUS"
  )
}
