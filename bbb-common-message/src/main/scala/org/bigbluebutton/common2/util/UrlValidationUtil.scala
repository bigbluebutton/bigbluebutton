package org.bigbluebutton.common2.util

import java.net.URL

object UrlvalidationUtil {
  def isValidUrl(url: String): Boolean = {
    try {
      new URL(url)
      true
    } catch {
      case _: Exception => false
    }
  }
}