package org.bigbluebutton.web.controllers

/**
 * An empty class, then one whose first member is typed.
 */
class Empty {}

class TypedController {
  String helper() {
    def nested = { 1 }
    nested()
  }

  def create = {
    render "ok"
  }
}
