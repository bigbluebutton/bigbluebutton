package org.bigbluebutton.apps.protocol

import scala.concurrent.Await
import scala.concurrent.Future
import scala.concurrent.duration._
import akka.util.Timeout
import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.{ ExecutionContext, Promise }
import scala.util.{Success, Failure}

object futuretesting {

  implicit val timeout = Timeout(5 seconds)       //> timeout  : akka.util.Timeout = Timeout(5 seconds)
  
//  val f = Promise.successful("foo")
  
  val future = Future {
    "Hello" + "World"
  }                                               //> future  : scala.concurrent.Future[String] = scala.concurrent.impl.Promise$De
                                                  //| faultPromise@610ac287

  future foreach println
    
  future onComplete {
   case Success(result) => println("RESULT: " + result)
   case Failure(failure) =>  println("FAIL: " + failure)
  }                                               //> HelloWorld

  
  case class Email(
     subject: String,
     text: String,
     sender: String,
     recipient: String)
  
  type EmailFilter = Email => Boolean
  
  def newMailsForUser(mails: Seq[Email], f: EmailFilter) = mails.filter(f)
                                                  //> newMailsForUser: (mails: Seq[org.bigbluebutton.apps.protocol.futuretesting.E
                                                  //| mail], f: org.bigbluebutton.apps.protocol.futuretesting.Email => Boolean)Seq
                                                  //| [org.bigbluebutton.apps.protocol.futuretesting.Email]
  
  val sentByOneOf: Set[String] => EmailFilter =
                    senders => email => senders.contains(email.sender)
                                                  //> RESULT: HelloWorld
                                                  //| sentByOneOf  : Set[String] => (org.bigbluebutton.apps.protocol.futuretesting
                                                  //| .Email => Boolean) = <function1>
  val notSentByAnyOf: Set[String] => EmailFilter =
                    senders => email => !senders.contains(email.sender)
                                                  //> notSentByAnyOf  : Set[String] => (org.bigbluebutton.apps.protocol.futuretes
                                                  //| ting.Email => Boolean) = <function1>
  val minimumSize: Int => EmailFilter = n => email => email.text.size >= n
                                                  //> minimumSize  : Int => (org.bigbluebutton.apps.protocol.futuretesting.Email 
                                                  //| => Boolean) = <function1>
  val maximumSize: Int => EmailFilter = n => email => email.text.size <= n
                                                  //> maximumSize  : Int => (org.bigbluebutton.apps.protocol.futuretesting.Email 
                                                  //| => Boolean) = <function1>

  val emailFilter: EmailFilter = notSentByAnyOf(Set("johndoe@example.com"))
                                                  //> emailFilter  : org.bigbluebutton.apps.protocol.futuretesting.Email => Boole
                                                  //| an = <function1>
  val mails = Email(
               subject = "It's me again, your stalker friend!",
               text = "Hello my friend! How are you?",
               sender = "johndoe@example.com",
               recipient = "me@example.com") :: Nil
                                                  //> mails  : List[org.bigbluebutton.apps.protocol.futuretesting.Email] = List(E
                                                  //| mail(It's me again, your stalker friend!,Hello my friend! How are you?,john
                                                  //| doe@example.com,me@example.com))
   newMailsForUser(mails, emailFilter)            //> res0: Seq[org.bigbluebutton.apps.protocol.futuretesting.Email] = List()
   
}