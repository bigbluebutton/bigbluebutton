package org.bigbluebutton.core.apps.layout

object LayoutHdlrHelpers {

  // the dock size is a fraction of its area: kept within [0, 1], anything not finite becomes 0 (not set)
  def clampCameraDockSize(size: Double): Double = {
    if (java.lang.Double.isFinite(size)) {
      Math.max(0, Math.min(size, 1))
    } else {
      0
    }
  }
}
