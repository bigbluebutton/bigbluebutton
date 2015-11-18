package org.bigbluebutton.core {

  object MessageType extends scala.Enumeration {
    type FooType = Value
    val SYSTEM = Value("system")
    val BROADCAST = Value("broadcast")
    val DIRECT = Value("direct")
  }
}
