package org.bigbluebutton.web.controllers

class DemoController {
  private static final String NAME = 'Demo'

  def create = {
    withFormat {
      xml { render "ok" }
    }
  }

  private String helper(String s) {
    [s].collect { it.trim() }
  }

  static mappings = {
    "/x"(controller: "demo")
  }
}
