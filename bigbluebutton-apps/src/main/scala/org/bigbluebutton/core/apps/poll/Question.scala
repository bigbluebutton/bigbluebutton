package org.bigbluebutton.core.apps.poll

import scala.collection.mutable.HashMap
import QuestionType._

class Question(val id: Int, val questionType: QuestionType, val question: String) {

  private val responses = new HashMap[Int, Response]()
  
  def addResponse(resp: Response):Unit = {
    responses.get(resp.id) match {
    	case None => responses += resp.id -> resp   
    }
  }
  
  def deleteResponse(id: Int) {
    responses -= id
  }
  
  def respondToQuestion(id: Int, resp: Responder) {
    responses.get(id) match {
    	case Some(r) => r.addResponder(resp)   
    	case None => // do nothing
    }
  }
  
  def getResponses():Array[Response] = {
	var r = new Array[Response](responses.size)
	responses.values.copyToArray(r)  
	return r
  }
	 
  
}