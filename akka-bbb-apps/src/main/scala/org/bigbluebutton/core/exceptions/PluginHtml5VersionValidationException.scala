package org.bigbluebutton.core.exceptions

final case class PluginHtml5VersionValidationException(message: String)
  extends RuntimeException(message)
