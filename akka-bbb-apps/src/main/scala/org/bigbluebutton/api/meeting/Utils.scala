package org.bigbluebutton.api.meeting

import org.apache.commons.lang3.{ StringEscapeUtils, StringUtils }

import java.io.UnsupportedEncodingException
import java.net.URLDecoder
import java.util.regex.Pattern

object Utils {
  //  private val log = LoggerFactory.getLogger(classOf[ParamsUtil])

  private val VALID_ID_PATTERN = Pattern.compile("[a-zA-Z][a-zA-Z0-9- ]*$")

  val INVALID_CHARS = ","

  def stripControlChars(text: String): String = text.replaceAll("\\p{Cc}", "")

  def escapeHTMLTags(value: String): String = StringEscapeUtils.escapeHtml4(value)

  def isValidMeetingId(meetingId: String): Boolean = { //return  VALID_ID_PATTERN.matcher(meetingId).matches();
    !containsChar(meetingId, INVALID_CHARS)
  }

  def containsChar(text: String, chars: String): Boolean = StringUtils.containsAny(text, chars)

  def getSessionToken(url: String): String = {
    var token = "undefined"
    try {
      val decodedURL = URLDecoder.decode(url, "UTF-8")
      val splitURL = decodedURL.split("\\?")
      if (splitURL.length == 2) {
        val params = splitURL(1)
        for (param <- params.split("\\&")) {
          if (param.startsWith("sessionToken=")) token = param.split("\\=")(1)
        }
      }
    } catch {
      case e: UnsupportedEncodingException =>
      //        log.error(e.toString)
    }
    token
  }

  def sanitizeString(inputString: String): String = {
    if (inputString == null) return ""
    val sanitizedString = stripControlChars(inputString)
    val trimmedString = sanitizedString.trim
    trimmedString
  }
}
