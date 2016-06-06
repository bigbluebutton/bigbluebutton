package org.bigbluebutton.core {

  object MessageType extends scala.Enumeration {
    type MessageType = Value
    val SYSTEM = Value("system")
    val BROADCAST = Value("broadcast")
    val DIRECT = Value("direct")
  }
}
