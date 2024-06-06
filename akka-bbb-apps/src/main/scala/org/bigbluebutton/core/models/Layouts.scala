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

  def setCameraDockIsResizing(instance: Layouts, p: Boolean) = {
    instance.isResizing = p
  }

  def getCameraDockIsResizing(instance: Layouts): Boolean = {
    instance.isResizing
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

  def setPresentationVideoRate(instance: Layouts, pvr: Double) = {
    instance.presentationVideoRate = pvr
  }

  def getPresentationVideoRate(instance: Layouts): Double = {
    instance.presentationVideoRate
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
  private var isResizing: Boolean = false;
  private var cameraPosition: String = "";
  private var focusedCamera: String = "";
  private var presentationVideoRate: Double = 0;
}

object LayoutsType {
  val layoutsType = Map(
    "custom" -> "CUSTOM_LAYOUT",
    "smart" -> "SMART_LAYOUT",
    "presentationFocus" -> "PRESENTATION_FOCUS",
    "videoFocus" -> "VIDEO_FOCUS"
  )
}
