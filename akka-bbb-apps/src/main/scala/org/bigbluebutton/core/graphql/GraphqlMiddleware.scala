package org.bigbluebutton.core.graphql

import org.bigbluebutton.SystemConfiguration
import java.net.URI
import java.net.http.{ HttpClient, HttpRequest, HttpResponse }

object GraphqlMiddleware extends SystemConfiguration {
  def requestGraphqlReconnection(sessionTokens: Vector[String], reason: String): Unit = {
    for {
      sessionToken <- sessionTokens
    } yield {
      val url = s"${graphqlMiddlewareAPI}/graphql-reconnection?sessionToken=$sessionToken&reason=${reason}"

      val client = HttpClient.newHttpClient()
      val request = HttpRequest.newBuilder()
        .uri(URI.create(url))
        .GET()
        .build()

      val response = client.send(request, HttpResponse.BodyHandlers.ofString())
      if (response.statusCode() != 200) {
        println(s"Error on requesting graphql reconnection for ${sessionToken}. Response Code: ${response.statusCode()}")
      }
    }
  }
}
