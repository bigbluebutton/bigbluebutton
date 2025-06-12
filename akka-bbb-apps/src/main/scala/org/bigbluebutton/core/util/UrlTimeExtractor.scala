package org.bigbluebutton.core.util

import scala.util.matching.Regex
import org.apache.http.client.utils.URIBuilder
import scala.jdk.CollectionConverters._

object UrlTimeExtractor {
  private val reHmsParam: Regex = """(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?""".r
  private val reHhmmssParam: Regex = """(?:(\d+):)?(\d+):(\d+)""".r

  def extractTime(urlStr: String): (String, Int) = {
    def timeParamToSeconds(s: String): Int = {
      s match {
        case reHmsParam(h, m, sec) =>
          Option(h).getOrElse("0").toInt * 3600 +
            Option(m).getOrElse("0").toInt * 60 +
            Option(sec).getOrElse("0").toInt
        case reHhmmssParam(h, m, s) =>
          Option(h).getOrElse("0").toInt * 3600 +
            m.toInt * 60 + s.toInt
        case sec if sec.forall(_.isDigit) =>
          sec.toInt
        case _ => 0
      }
    }

    def cleanUrlRemoveParams(uriBuilder: URIBuilder, keysToRemove: Set[String]): String = {
      val queryParams = uriBuilder.getQueryParams.asScala
      uriBuilder.clearParameters()
      queryParams
        .filterNot(param => keysToRemove.contains(param.getName))
        .foreach(param => uriBuilder.addParameter(param.getName, param.getValue))
      uriBuilder.build().toString
    }

    val uri = new URIBuilder(urlStr)
    val domain = uri.getHost

    val params: Map[String, String] = uri.getQueryParams.asScala
      .map(param => param.getName -> param.getValue)
      .toMap

    domain match {
      //&t=382
      case d if d.contains("youtube.com") || d.contains("youtu.be") =>
        (
          cleanUrlRemoveParams(uri, Set("t")),
          timeParamToSeconds(params.getOrElse("t", ""))
        )

      //?start=1h48m20s
      case d if d.contains("peertube") =>
        (
          cleanUrlRemoveParams(uri, Set("start")),
          timeParamToSeconds(params.getOrElse("start", ""))
        )

      //?wtime=10
      case d if d.contains("wistia") =>
        (
          cleanUrlRemoveParams(uri, Set("wtime")),
          timeParamToSeconds(params.getOrElse("wtime", ""))
        )

      //#t=00:01:30
      case d if d.contains("soundcloud") =>
        val timeOpt: Option[String] =
          Option(uri.getFragment)
            .filter(_.startsWith("t="))
            .map(_.drop(2))

        val cleaned = uri.setFragment(null).build().toString
        (cleaned, timeOpt.map(timeParamToSeconds).getOrElse(0))

      //?t=14
      case d if d.contains("streamable") =>
        (
          cleanUrlRemoveParams(uri, Set("t")),
          timeParamToSeconds(params.getOrElse("t", ""))
        )

      //?t=05h32m25s
      case d if d.contains("twitch.tv") =>
        (
          cleanUrlRemoveParams(uri, Set("t")),
          timeParamToSeconds(params.getOrElse("t", ""))
        )

      //?st=80
      case d if d.contains("kaltura") =>
        (
          cleanUrlRemoveParams(uri, Set("st")),
          timeParamToSeconds(params.getOrElse("st", ""))
        )

      case _ =>
        (urlStr, 0)
    }
  }
}
