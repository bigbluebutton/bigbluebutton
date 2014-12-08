package org.bigbluebutton.core.util

import org.slf4j.Logger
import org.red5.logging.Red5LoggerFactory;

/**
 * LogHelper is a trait you can mix in to provide easy log4j logging 
 * for your scala classes. 
 **/
trait LogHelper {
    val loggerName = this.getClass.getName
    lazy val logger = Red5LoggerFactory.getLogger(this.getClass, "bigbluebutton")
}