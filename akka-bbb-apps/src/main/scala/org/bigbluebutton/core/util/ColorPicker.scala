package org.bigbluebutton.core.util

import org.bigbluebutton.SystemConfiguration

object ColorPicker extends SystemConfiguration {
  private val defaultColors = List("#7b1fa2", "#6a1b9a", "#4a148c", "#5e35b1", "#512da8", "#4527a0", "#311b92",
    "#3949ab", "#303f9f", "#283593", "#1a237e", "#1976d2", "#1565c0", "#0d47a1", "#0277bd", "#01579b")
  private val hexColorRegex = "^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$".r

  private val colors = {
    val configuredColors = userColors.map(_.trim).filter(c => hexColorRegex.matches(c))
    if (configuredColors.nonEmpty) configuredColors else defaultColors
  }
  private var meetingCurrIdx: Map[String, Int] = Map()

  def nextColor(meetingId: String): String = {
    val currentIdx = meetingCurrIdx.getOrElse(meetingId, 0)

    val color = colors(currentIdx)
    meetingCurrIdx += meetingId -> (currentIdx + 1) % colors.length
    color
  }

  def reset(meetingId: String): Unit = {
    meetingCurrIdx -= meetingId
  }
}
