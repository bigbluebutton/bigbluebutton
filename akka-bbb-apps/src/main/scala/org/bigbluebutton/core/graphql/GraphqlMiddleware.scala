package org.bigbluebutton.core.graphql

import org.bigbluebutton.SystemConfiguration
import org.slf4j.LoggerFactory

import java.net.URI
import java.net.http.{ HttpClient, HttpRequest, HttpResponse }
import java.time.Duration

object GraphqlMiddleware extends SystemConfiguration {

  val logger = LoggerFactory.getLogger(this.getClass)

  def requestGraphqlReconnection(sessionTokens: Vector[String], reason: String): Unit = {
    for {
      sessionToken <- sessionTokens
    } yield {
      val url = s"${graphqlMiddlewareAPI}/graphql-reconnection?sessionToken=$sessionToken&reason=${reason}"

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
    }
  }
}
