package org.bigbluebutton

import io.vertx.ext.web.handler.{ BodyHandler, CookieHandler, SessionHandler }
import io.vertx.ext.web.sstore.LocalSessionStore
import io.vertx.lang.scala.ScalaVerticle
import io.vertx.scala.ext.web.Router

class SockJSHandlerVerticle extends ScalaVerticle {

  override def start(): Unit = {
    println("Starting")
    //val router = Router.router(vertx)

    // We need cookies, sessions and request bodies
    //router.route().handler(CookieHandler.create)
    //router.route().handler(BodyHandler.create)
    //router.route().handler(SessionHandler.create(LocalSessionStore.create(vertx)))

    // Simple auth service which uses a properties file for user/role info
    //AuthProvider authProvider = new MyAuthProvider(vertx);

    // We need a user session handler too to make sure the user is stored in the session between requests
    //router.route().handler(UserSessionHandler.create(authProvider));

    // Handles the actual login
    //router.route("/loginhandler").handler(FormLoginHandler.create(authProvider));
  }

  override def stop(): Unit = {
    println("Stopping")
  }
}
