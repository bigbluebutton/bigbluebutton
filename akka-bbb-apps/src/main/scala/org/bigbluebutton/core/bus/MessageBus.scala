package org.bigbluebutton.core.bus

import org.bigbluebutton.core.running.OutMsgRouter

case class MessageBus(eventBus: InternalEventBus, outGW: OutMsgRouter)

