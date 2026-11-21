package org.bigbluebutton.core.graphql

import org.bigbluebutton.SystemConfiguration
import org.slf4j.LoggerFactory

import java.net.{ URI, URLEncoder }
import java.net.http.{ HttpClient, HttpRequest, HttpResponse }
import java.nio.charset.StandardCharsets
import java.time.Duration
import scala.util.control.NonFatal

object GraphqlMiddleware extends SystemConfiguration {

  val logger = LoggerFactory.getLogger(this.getClass)

  def requestGraphqlReconnection(sessionTokens: Vector[String], reason: String): Unit = {
    for {
      sessionToken <- sessionTokens
    } yield {
      // Best effort: callers send this in the middle of a state change, so it must not throw.
      try {
        val encodedReason = URLEncoder.encode(reason, StandardCharsets.UTF_8.toString)
        val url = s"${graphqlMiddlewareAPI}/graphql-reconnection?sessionToken=$sessionToken&reason=$encodedReason"

        val client = HttpClient.newHttpClient()
        val request = HttpRequest.newBuilder()
          .timeout(Duration.ofSeconds(5))
          .uri(URI.create(url))
          .GET()
          .build()

        val response = client.send(request, HttpResponse.BodyHandlers.ofString())
        logger.debug(s"Graphql reconnection requested for ${sessionToken}: (${url}).")

        if (response.statusCode() != 200) {
          logger.error(s"Error on requesting graphql reconnection for ${sessionToken}. Response Code: ${response.statusCode()}")
        }
      } catch {
        case e: InterruptedException =>
          Thread.currentThread().interrupt()
          logger.error(s"Interrupted while requesting graphql reconnection for ${sessionToken}.")
        case NonFatal(e) =>
          logger.error(s"Error on requesting graphql reconnection for ${sessionToken}: ${e}")
      }
    }
  }
}
