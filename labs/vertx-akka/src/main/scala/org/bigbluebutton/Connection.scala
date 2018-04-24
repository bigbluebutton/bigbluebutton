package org.bigbluebutton

import akka.actor.{ Actor, ActorContext, ActorLogging, ActorRef, Props }
import io.vertx.core.{ Handler, Vertx }
import io.vertx.core.eventbus.{ Message, MessageConsumer }
import io.vertx.core.json.JsonObject
import org.bigbluebutton.client.bus.ConnInfo2
import org.bigbluebutton.client.bus._

object Connection {
  def apply(connId: String, vertx: Vertx, connEventBus: InternalMessageBus)(implicit context: ActorContext): Connection = new Connection(connId, vertx, connEventBus)(context)
}

class Connection(val connId: String, vertx: Vertx, connEventBus: InternalMessageBus)(implicit val context: ActorContext) {
  val actorRef = context.actorOf(ConnectionActor.props(connId, vertx, connEventBus), "connActor" + "-" + connId)

  val consumer: MessageConsumer[JsonObject] = vertx.eventBus().consumer("from-socket-" + connId)
  consumer.handler(new MyConnHandler(actorRef))
}

object ConnectionActor {
  def props(connId: String, vertx: Vertx, connEventBus: InternalMessageBus): Props = Props(classOf[ConnectionActor], connId, vertx, connEventBus)
}

case class MsgFoo(msg: JsonObject)

class ConnectionActor(connId: String, vertx: Vertx, connEventBus: InternalMessageBus) extends Actor with ActorLogging {

  var handshakeDone = false
  var connInfo: Option[ConnInfo2] = None
  var clientAddress: Option[String] = None

  def receive = {
    case m: SocketDestroyed =>
      connInfo foreach { conn =>
        connEventBus.publish(MsgFromConnBusMsg(ClientManagerActor.CLIENT_MANAGER_CHANNEL, ConnectionDestroyed(conn)))
      }

      context stop self
    case m: SocketRegister =>
      clientAddress = Some(m.channel)

    case m: MsgFoo =>
      if (!handshakeDone) {
        for {
          conn <- getConnInfo(m.msg)
        } yield {
          println("**************************** HANDSHAKE DONE *****************************")
          handshakeDone = true
          connInfo = Some(conn)
          connEventBus.publish(MsgFromConnBusMsg(ClientManagerActor.CLIENT_MANAGER_CHANNEL, ConnectionCreated(conn)))

          val response = buildHandshakeReply(conn.meetingId, conn.userId, conn.token)
          vertx.eventBus().publish("chat.to.client", response)
        }
      } else {
        //println("************ FORWARDING TO CLIENT ACTOR *****************************")
        connInfo foreach { conn =>
          //println("************ FORWARDING TO CLIENT ACTOR " + "clientActor-" + conn.connId + " *****************************")
          connEventBus.publish(MsgFromConnBusMsg("clientActor-" + conn.connId, MsgFromConnMsg(conn, m.msg.encode())))
        }
      }

    case m: MsgToConnMsg =>
      //println("MsgToConnMsg " + m.json)
      val jsonObject = new JsonObject(m.json)
      vertx.eventBus().publish("chat.to.client", jsonObject)

    case _ => log.debug("***** Connection cannot handle msg ")
  }

  private def getConnInfo(msg: JsonObject): Option[ConnInfo2] = {
    var conn: Option[ConnInfo2] = None

    if (msg.containsKey("header") && msg.containsKey("body")) {
      val header = msg.getJsonObject("header")
      val body = msg.getJsonObject("body")
      if (header.containsKey("name") && header.containsKey("meetingId")
        && header.containsKey("userId") && body.containsKey("token")) {
        val meetingId = header.getString("meetingId")
        val userId = header.getString("userId")
        val token = body.getString("token")
        conn = Some(new ConnInfo2(meetingId, userId, token, connId))
      }
    }

    conn
  }

  private def buildHandshakeReply(meetingId: String, userId: String, token: String): JsonObject = {
    val header: JsonObject = new JsonObject()
    header.put("name", "HandshakeReplyMessage")
    header.put("userId", userId)
    header.put("meetingId", meetingId)

    val body = new JsonObject()
    body.put("token", token)

    val reply = new JsonObject()
    reply.put("header", header)
    reply.put("body", body)

    reply
  }

  override def preStart(): Unit = {
    super.preStart()
    connEventBus.subscribe(self, "connActor-" + connId)
  }

  override def postStop(): Unit = {
    super.postStop()
    connEventBus.unsubscribe(self, "connActor-" + connId)
  }
}

class MyConnHandler(actorRef: ActorRef) extends Handler[Message[JsonObject]] {
  def handle(message: Message[JsonObject]) = {
    //println("My Handler " + message.body())
    actorRef ! (MsgFoo(message.body()))
  }
}
