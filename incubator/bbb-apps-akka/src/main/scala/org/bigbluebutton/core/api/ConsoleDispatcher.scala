package org.bigbluebutton.core.api

class ConsoleDispatcher extends IDispatcher {

  def dispatch(jsonMessage: String) {
    println(jsonMessage)
  }
}