package org.bigbluebutton

import org.apache.pekko.actor.ActorSystem
import org.apache.pekko.stream.ActorMaterializer

import scala.concurrent.ExecutionContext

trait WebApi {

  // Entry point for creating and looking up actors.
  implicit val system: ActorSystem

  // Materializes the list of requests
  implicit val materializer: ActorMaterializer

  // Futures need a context to be executed on.
  implicit val executor: ExecutionContext
}