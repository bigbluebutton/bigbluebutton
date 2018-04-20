package org.bigbluebutton

import akka.actor.{ Actor, ActorContext, ActorLogging, ActorRef, Props }
import io.vertx.core.{ Handler, Vertx }
import io.vertx.core.eventbus.{ Message, MessageConsumer }
import io.vertx.core.json.JsonObject
import org.bigbluebutton.client.ConnInfo
import org.bigbluebutton.client.bus._

object Connection {
  def apply(connId: String, vertx: Vertx, connEventBus: FromConnEventBus)(implicit context: ActorContext): Connection = new Connection(connId, vertx, connEventBus)(context)
}

class Connection(val connId: String, vertx: Vertx, connEventBus: FromConnEventBus)(implicit val context: ActorContext) {
  val actorRef = context.actorOf(ConnectionActor.props(connId, vertx, connEventBus), "connActor" + "-" + connId)

  val consumer: MessageConsumer[JsonObject] = vertx.eventBus().consumer("FOO-" + connId)
  consumer.handler(new MyConnHandler(actorRef))
}

object ConnectionActor {
  def props(connId: String, vertx: Vertx, connEventBus: FromConnEventBus): Props = Props(classOf[ConnectionActor], connId, vertx, connEventBus)
}

case class MsgFoo(msg: JsonObject)

class ConnectionActor(connId: String, vertx: Vertx, connEventBus: FromConnEventBus) extends Actor with ActorLogging {

  var handshakeDone = false
  var connInfo: Option[ConnInfo] = None

  def receive = {
    case m: SocketDestroyed =>
      val m2 = DisconnectMsg2(ConnInfo2(connId))
      connEventBus.publish(MsgFromConnBusMsg("clientManager", m2))
      context stop self
    case m: SocketRegister =>
      val m2 = MsgFromConnMsg(ConnInfo2(connId), m.channel)
      connEventBus.publish(MsgFromConnBusMsg("clientManager", m2))
    case m: MsgFoo =>
      if (!handshakeDone) {
        for {
          conn <- getConnInfo(m.msg)
        } yield {
          handshakeDone = true
          connInfo = Some(conn)
        }
      } else {
        println("My Handler " + m.msg)
        vertx.eventBus().publish("chat.to.client", m.msg)
      }

    //      val connInfo = ConnInfo2(connId)
    //			connEventBus.publish() MsgFromConnMsg
    case _ => log.debug("***** Connection cannot handle msg ")
  }

  private def getConnInfo(msg: JsonObject): Option[ConnInfo] = {
    var conn: Option[ConnInfo] = None

    if (msg.containsKey("header") && msg.containsKey("body")) {
      val header = msg.getJsonObject("header")
      val body = msg.getJsonObject("body")
      if (header.containsKey("name") && header.containsKey("meetingId")
        && header.containsKey("userId") && body.containsKey("token")) {
        val meetingId = header.getString("meetingId")
        val userId = header.getString("userId")
        val token = body.getString("token")
        conn = Some(new ConnInfo(meetingId, userId, token, connId, connId))
      }
    }

    conn
  }

  override def preStart(): Unit = {
    super.preStart()
    connEventBus.subscribe(self, "conn-" + connId)
  }

  override def postStop(): Unit = {
    super.postStop()
    connEventBus.unsubscribe(self, "conn-" + connId)
  }
}

class MyConnHandler(actorRef: ActorRef) extends Handler[Message[JsonObject]] {
  def handle(message: Message[JsonObject]) = {
    println("My Handler " + message.body())
    actorRef ! (MsgFoo(message.body()))
  }
}
