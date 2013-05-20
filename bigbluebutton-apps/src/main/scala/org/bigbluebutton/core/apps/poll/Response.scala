package org.bigbluebutton.core.apps.poll

import scala.collection.mutable.ArrayBuffer

case class Responder(val userID: String, val name: String)

class Response(val id: String, val response: String) {

  val responders = new ArrayBuffer[Responder]()
  
  def addResponder(userID: String, name: String) {
	responders += new Responder(userID, name)
  }
  
  def numResponders():Int = {
    responders.length;
  }
  
  def getResponders():Array[Responder] = {
    var r = new Array[Responder](responders.length)
    responders.copyToArray(r)
    return r
  }
}