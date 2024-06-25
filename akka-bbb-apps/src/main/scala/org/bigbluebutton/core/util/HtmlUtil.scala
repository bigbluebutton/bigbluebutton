package org.bigbluebutton.core.util

object HtmlUtil {
  private val HTML_SAFE_MAP: Map[Char, String] = Map(
    '<' -> "&lt;",
    '>' -> "&gt;",
    '"' -> "&quot;",
    '\'' -> "&#39;"
  )

  private val RegexWebUrl = """(?i)\b((?:https?|ftp)://[^\s/$.?#].[^\s]*)\b""".r

  def htmlToHtmlEntities(message: String): String = {
    var parsedMessage = Option(message).getOrElse("").trim

    // Replace <br/> with \n\r
    parsedMessage = parsedMessage.replaceAll("(?i)<br\\s*/?>", "\n\r")

    // Escape HTML characters
    parsedMessage = HTML_SAFE_MAP.foldLeft(parsedMessage) { case (msg, (char, safe)) =>
      msg.replace(char.toString, safe)
    }

    // Replace flash links to flash valid ones
    parsedMessage = RegexWebUrl.replaceAllIn(parsedMessage, m => s"<a href='event:${m.matched}'><u>${m.matched}</u></a>")

    parsedMessage
  }
}
