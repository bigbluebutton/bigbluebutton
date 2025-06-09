package org.bigbluebutton.core.util

import java.net.{ URL, URLDecoder }
import scala.util.matching.Regex

object UrlTimeExtractor {

  def extractTime(urlStr: String): (String, Int) = {
    def getParam(params: Map[String, String], keys: String*): Option[String] =
      keys.flatMap(k => params.get(k)).headOption

    def parseQuery(query: String): Map[String, String] =
      Option(query).getOrElse("").split("&").flatMap { param =>
        param.split("=", 2) match {
          case Array(key, value) => Some(key -> URLDecoder.decode(value, "UTF-8"))
          case _                 => None
        }
      }.toMap

    def timeToSeconds(s: String): Int = {
      val hms: Regex = """(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?""".r
      val hhmmss: Regex = """(?:(\d+):)?(\d+):(\d+)""".r

      s match {
        case hms(h, m, sec) =>
          Option(h).getOrElse("0").toInt * 3600 +
            Option(m).getOrElse("0").toInt * 60 +
            Option(sec).getOrElse("0").toInt
        case hhmmss(h, m, s) =>
          Option(h).getOrElse("0").toInt * 3600 +
            m.toInt * 60 + s.toInt
        case sec if sec.forall(_.isDigit) =>
          sec.toInt
        case _ => 0
      }
    }

    val url = new URL(urlStr)
    val domain = url.getHost
    val path = url.getPath
    val params = parseQuery(url.getQuery)

    val (cleanUrl, timeSec) = domain match {
      case d if d.contains("youtube.com") || d.contains("youtu.be") =>
        val timeStr = getParam(params, "t").orElse(url.getRef match {
          case s if s != null && s.startsWith("t=") => Some(s.stripPrefix("t="))
          case _                                    => None
        })
        (urlStr.replaceAll("[&?#]t=[^&]*", ""), timeStr.map(timeToSeconds).getOrElse(0))

      case d if d.contains("peertube") =>
        val timeStr = getParam(params, "start")
        (urlStr.replaceAll("[&?#]start=[^&]*", ""), timeStr.map(timeToSeconds).getOrElse(0))

      case d if d.contains("wistia") =>
        val timeStr = getParam(params, "wtime")
        (urlStr.replaceAll("[&?#]wtime=[^&]*", ""), timeStr.map(timeToSeconds).getOrElse(0))

      case d if d.contains("soundcloud") =>
        val t = Option(url.getRef).getOrElse("").stripPrefix("t=")
        val cleaned = urlStr.replaceAll("#t=[^&]*", "")
        (cleaned, if (t.nonEmpty) timeToSeconds(t) else 0)

      case d if d.contains("streamable") =>
        val timeStr = getParam(params, "t")
        (urlStr.replaceAll("[&?#]t=[^&]*", ""), timeStr.map(timeToSeconds).getOrElse(0))

      case d if d.contains("twitch.tv") =>
        val t = getParam(params, "t").orElse {
          val idx = urlStr.indexOf("?t=")
          if (idx >= 0) Some(urlStr.substring(idx + 3)) else None
        }
        (urlStr.replaceAll("[&?#]t=[^&]*", ""), t.map(timeToSeconds).getOrElse(0))

      case d if d.contains("kaltura") =>
        val t = getParam(params, "st")
        (urlStr.replaceAll("[&?#]st=[^&]*", ""), t.map(timeToSeconds).getOrElse(0))

      case _ =>
        (urlStr, 0)
    }

    (cleanUrl.replaceAll("[&?]$", ""), timeSec)
  }
}
