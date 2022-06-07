package org.bigbluebutton.api2.util

import org.slf4j.LoggerFactory

/**
 * LogHelper is a trait you can mix in to provide easy log4j logging
 * for your scala classes.
 */
trait LogHelper {
  val loggerName = this.getClass.getName
  lazy val logger = LoggerFactory.getLogger(this.getClass)
}
