package org.bigbluebutton.core.util

object HtmlUtil {
  private val HTML_SAFE_MAP: Map[Char, String] = Map(
    '&' -> "&amp;",
    '<' -> "&lt;",
    '>' -> "&gt;",
    '"' -> "&quot;",
    '\'' -> "&#39;"
  )

  private val RegexWebUrl = """(?i)\b((?:https?|ftp)://[^\s/$.?#].[^\s]*)\b""".r

  // Escape each input character once so generated entities are not escaped again.
  private def escapeHtml(message: String): String = message.iterator
    .map(char => HTML_SAFE_MAP.getOrElse(char, char.toString))
    .mkString

  def htmlToHtmlEntities(message: String): String = {
    // Replace <br/> with \n\r
    val parsedMessage = Option(message).getOrElse("").trim
      .replaceAll("(?i)<br\\s*/?>", "\n\r")

    val result = new StringBuilder
    var previousEnd = 0

    // Match URLs before escaping so the regex cannot split generated entities.
    RegexWebUrl.findAllMatchIn(parsedMessage).foreach { matched =>
      result.append(escapeHtml(parsedMessage.substring(previousEnd, matched.start)))
      val url = escapeHtml(matched.matched)
      // Append links directly so dollar signs and backslashes remain literal.
      result.append(s"<a href='event:$url'><u>$url</u></a>")
      previousEnd = matched.end
    }

    result.append(escapeHtml(parsedMessage.substring(previousEnd))).toString
  }
}
