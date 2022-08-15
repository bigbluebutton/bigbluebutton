package org.bigbluebutton.controller

import akka.http.scaladsl.model.{ContentTypes, HttpEntity}
import akka.http.scaladsl.server.Directives._
import akka.http.scaladsl.server.{Route, StandardRoute}
import org.bigbluebutton.model.Greeting
import org.bigbluebutton.service.{English, French, Spanish}

case object HelloWorld {

  def htmlTextResponse(greeting: Greeting): StandardRoute =
    complete(HttpEntity(ContentTypes.`text/html(UTF-8)`, s"<h1>${greeting.toString}</h1>"))

  def jsonResponse(greeting: Greeting): StandardRoute =
    complete(HttpEntity(ContentTypes.`application/json`, greeting.toJson.toString()))

  val route: Route = pathPrefix("hello") {
    defaultResponsePathEnd() ~
    htmlRoute ~
    jsonRoute
  }

  val jsonRoute: Route = pathPrefix("json") {
    defaultResponsePathEnd() ~
    langRoute(jsonResponse)
  }


  val htmlRoute: Route = pathPrefix("html") {
    defaultResponsePathEnd(htmlTextResponse) ~
    langRoute(htmlTextResponse)
  }

  def defaultResponsePathEnd(generateResponse: Greeting => StandardRoute = jsonResponse): Route = pathEnd {
    generateResponse(English.getGreetings)
  }

  def langRoute(generateResponse: Greeting => StandardRoute): Route = pathPrefix("lang") {
    extractUnmatchedPath {
      lang => lang.toString match {
        case en if en contains "en" => generateResponse(English.getGreetings)
        case es if es contains "es" => generateResponse(Spanish.getGreetings)
        case fr if fr contains "fr" => generateResponse(French.getGreetings)
        case _ => generateResponse(English.getGreetings)
      }
    }
  }

}
