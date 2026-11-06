package org.bigbluebutton.core.apps.layout

object LayoutHdlrHelpers {

  def clampPresentationVideoRate(rate: Double): Double = {
    if (java.lang.Double.isFinite(rate)) {
      Math.max(0, Math.min(rate, 1))
    } else {
      0
    }
  }
}
