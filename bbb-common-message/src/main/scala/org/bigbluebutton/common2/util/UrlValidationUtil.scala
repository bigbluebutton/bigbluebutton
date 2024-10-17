package org.bigbluebutton.common2.util

import java.net.URL

object UrlValidationUtil {
  def isValidUrl(url: String): Boolean = {
    if (url == null) return false
    try {
      val parsedUrl = new URL(url)
      val protocol = parsedUrl.getProtocol
      protocol == "http" || protocol == "https"
    } catch {
      case _: MalformedURLException => false
    }
  }
}