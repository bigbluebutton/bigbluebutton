package org.bigbluebutton.core.api

class NoopOutMessageListener extends OutMessageListener2 {

  	def handleMessage(msg: IOutMessage):Unit = {
  	  println("**** Received Out Message ***************")
  	}
}