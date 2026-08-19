package org.bigbluebutton.core.apps.groupchats

import org.bigbluebutton.common2.msgs.{ GroupChatAccess, GroupChatMessageType, GroupChatMsgFromUser, GroupChatMsgToUser, GroupChatUser }
import org.bigbluebutton.core.db.ChatMessageDAO
import org.bigbluebutton.core.db.ChatDAO
import org.bigbluebutton.core.domain.MeetingState2x
import org.bigbluebutton.core.models._
import org.bigbluebutton.core.running.LiveMeeting
import org.bigbluebutton.core.util.MarkdownUtil

import java.util.Locale

import scala.jdk.CollectionConverters._

object GroupChatApp {
  def getGroupChatOfUsers(userId: String, participantIds: Vector[String], state: MeetingState2x): Option[GroupChat] = {
    state.groupChats.findAllPrivateChatsForUser(userId)
      .find(groupChat => participantIds.forall(groupChat.users.map(u => u.id).contains))
  }

  val MAIN_PUBLIC_CHAT = "MAIN-PUBLIC-GROUP-CHAT"

  def createGroupChat(access: String, createBy: GroupChatUser,
                      users: Vector[GroupChatUser], msgs: Vector[GroupChatMessage]): GroupChat = {
    val gcId = GroupChatFactory.genId()
    GroupChatFactory.create(gcId, access, createBy, users, msgs)
  }

  def toGroupChatMessage(sender: GroupChatUser, msg: GroupChatMsgFromUser, emphasizedText: Boolean, messageType: String, enableImages: Boolean): GroupChatMessage = {
    val messageAsHtml = MarkdownUtil.markdownToSafeHtml(msg.message, enableImages)

    val now = System.currentTimeMillis()
    val id = GroupChatFactory.genId()
    GroupChatMessage(id, now, msg.correlationId, now, now, sender, emphasizedText, msg.message, messageAsHtml, msg.replyToMessageId, messageType, msg.metadata)
  }

  /** A message can't reasonably mention more participants than this, so cap what we read. */
  private val MaxRequestedMentions = 100

  /**
   * The mentions the sender picked from the mention list, in message order, as delivered in
   * `metadata.mentions`. Jackson binds the untyped metadata into Scala or Java collections
   * depending on the payload, so both are accepted.
   */
  def parseRequestedMentions(metadata: Map[String, Any]): List[(String, String)] = {
    // An older producer can leave the field out entirely, which deserializes as null.
    val safeMetadata = Option(metadata).getOrElse(Map.empty[String, Any])

    def entries(raw: Any): List[Any] = raw match {
      case s: Seq[_]            => s.toList
      case l: java.util.List[_] => l.asScala.toList
      case _                    => List.empty
    }

    def field(raw: Any, key: String): Option[String] = raw match {
      case m: scala.collection.Map[_, _] =>
        m.asInstanceOf[scala.collection.Map[String, Any]].get(key).map(_.toString)
      case m: java.util.Map[_, _] =>
        Option(m.asInstanceOf[java.util.Map[String, Any]].get(key)).map(_.toString)
      case _ => None
    }

    safeMetadata.get("mentions").toList
      .flatMap(entries)
      .take(MaxRequestedMentions)
      .flatMap { entry =>
        for {
          userId <- field(entry, "userId") if userId.nonEmpty
          name <- field(entry, "name") if name.nonEmpty
        } yield (userId, name)
      }
  }

  /**
   * Wraps the mentions in the rendered HTML and returns the ids they resolved to.
   *
   * `requestedMentions` are the (userId, name) pairs the sender picked from the mention list,
   * in message order. They are only honoured while the participant is still in the meeting
   * under that same name, which is what makes a mention point at one participant instead of
   * at everyone sharing a display name.
   */
  def applyMentions(
      html:              String,
      users2x:           Users2x,
      requestedMentions: List[(String, String)] = List.empty
  ): (String, List[String]) = {
    if (html.indexOf('@') < 0) {
      (html, List.empty)
    } else {
      val users = Users2x.findAll(users2x).filterNot(_.bot)
      // The keys are matched against the rendered HTML, where commonmark already escaped them.
      val userNameToIds: Map[String, List[String]] = users
        .groupBy(u => MarkdownUtil.escapeHtmlText(u.name).toLowerCase(Locale.ROOT))
        .map { case (name, namesakes) => name -> namesakes.map(_.intId).toList }

      val usersById = users.map(u => u.intId -> u).toMap
      val authorizedByName: Map[String, List[String]] = requestedMentions
        .flatMap {
          case (userId, name) => usersById.get(userId)
            .filter(_.name == name)
            .map(u => MarkdownUtil.escapeHtmlText(u.name).toLowerCase(Locale.ROOT) -> u.intId)
        }
        .groupBy(_._1)
        .map { case (name, entries) => name -> entries.map(_._2) }

      MarkdownUtil.processMentions(html, userNameToIds, authorizedByName)
    }
  }

  def toMessageToUser(msg: GroupChatMessage): GroupChatMsgToUser = {
    GroupChatMsgToUser(id = msg.id, timestamp = msg.timestamp, correlationId = msg.correlationId,
      sender = msg.sender, chatEmphasizedText = msg.chatEmphasizedText, message = msg.message, messageAsHtml = msg.messageAsHtml,
      replyToMessageId = msg.replyToMessageId, messageType = msg.messageType, metadata = msg.metadata)
  }

  def addGroupChatMessage(meetingId: String, chat: GroupChat, chats: GroupChats,
                          msg: GroupChatMessage, messageType: String = GroupChatMessageType.DEFAULT): GroupChats = {
    if (msg.sender.id == SystemUser.ID) {
      ChatMessageDAO.insertSystemMsg(meetingId, chat.id, msg.message, msg.messageAsHtml, messageType, Map(), msg.sender.name)
    } else {
      ChatMessageDAO.insert(meetingId, chat.id, msg, messageType)
    }

    val c = chat.add(msg)
    chats.update(c)
  }

  def updateGroupChatMessage(meetingId: String, chat: GroupChat, chats: GroupChats, msg: GroupChatMessage): GroupChats = {
    ChatMessageDAO.update(meetingId, chat.id, msg.id, msg.message, msg.messageAsHtml, msg.metadata)

    val c = chat.update(msg)
    chats.update(c)
  }

  def deleteGroupChatMessage(meetingId: String, chat: GroupChat, chats: GroupChats, msg: GroupChatMessage, deletedBy: String): GroupChats = {
    ChatDAO.clearPinnedMessage(meetingId, chat.id, msg.id)

    ChatMessageDAO.softDelete(meetingId, chat.id, msg.id, deletedBy)

    val c = chat.delete(msg.id)
    chats.update(c)
  }

  def pinGroupChatMessage(meetingId: String, chat: GroupChat, chats: GroupChats, msg: GroupChatMessage, pinnedByUserId: String): GroupChats = {
    if (chat.pinnedMessageId.contains(msg.id)) return chats

    ChatDAO.setPinnedMessage(meetingId, chat.id, msg.id, pinnedByUserId)

    val updatedChat = chat.pin(msg.id)

    chats.update(updatedChat)
  }

  def unpinGroupChatMessage(meetingId: String, chat: GroupChat, chats: GroupChats, msg: GroupChatMessage): GroupChats = {
    ChatDAO.clearPinnedMessage(meetingId, chat.id, msg.id)

    val c = chat.unpin(msg.id)
    chats.update(c)
  }

  def findGroupChatUser(userId: String, users: Users2x): Option[GroupChatUser] = {
    Users2x.findWithIntId(users, userId) match {
      case Some(u) => Some(GroupChatUser(u.intId, u.name, u.role))
      case None =>
        if (userId == SystemUser.ID) {
          Some(GroupChatUser(SystemUser.ID))
        } else {
          None
        }
    }
  }

  def createDefaultPublicGroupChat(): GroupChat = {
    val createBy = GroupChatUser(SystemUser.ID)
    GroupChatFactory.create(MAIN_PUBLIC_CHAT, GroupChatAccess.PUBLIC, createBy, Vector.empty, Vector.empty)
  }

  def createTestPublicGroupChat(state: MeetingState2x): MeetingState2x = {
    val createBy = GroupChatUser(SystemUser.ID)
    val defaultPubGroupChat = GroupChatFactory.create(
      "TEST_GROUP_CHAT",
      GroupChatAccess.PUBLIC, createBy, Vector.empty, Vector.empty
    )
    val groupChats = state.groupChats.add(defaultPubGroupChat)
    state.update(groupChats)
  }

  def getAllGroupChatsInMeeting(state: MeetingState2x): Vector[GroupChat] = {
    state.groupChats.getAllGroupChatsInMeeting()
  }

  def genTestChatMsgHistory(chatId: String, state: MeetingState2x, userId: String, liveMeeting: LiveMeeting): MeetingState2x = {
    def addH(state: MeetingState2x, userId: String, liveMeeting: LiveMeeting, msg: GroupChatMsgFromUser): MeetingState2x = {
      val newState = for {
        sender <- GroupChatApp.findGroupChatUser(userId, liveMeeting.users2x)
        chat <- state.groupChats.find(chatId)
      } yield {
        val emphasizedText = sender.role == Roles.MODERATOR_ROLE
        val gcm1 = GroupChatApp.toGroupChatMessage(sender, msg, emphasizedText, GroupChatMessageType.DEFAULT, false)
        val gcs1 = GroupChatApp.addGroupChatMessage(liveMeeting.props.meetingProp.intId, chat, state.groupChats, gcm1)
        state.update(gcs1)
      }

      newState match {
        case Some(ns) => ns
        case None     => state
      }
    }

    val sender = GroupChatUser(SystemUser.ID)
    val h1 = GroupChatMsgFromUser(correlationId = "cor1", sender = sender, message = "Hello Foo!", replyToMessageId = "")
    val h2 = GroupChatMsgFromUser(correlationId = "cor2", sender = sender, message = "Hello Bar!", replyToMessageId = "")
    val h3 = GroupChatMsgFromUser(correlationId = "cor3", sender = sender, message = "Hello Baz!", replyToMessageId = "")
    val state1 = addH(state, SystemUser.ID, liveMeeting, h1)
    val state2 = addH(state1, SystemUser.ID, liveMeeting, h2)
    val state3 = addH(state2, SystemUser.ID, liveMeeting, h3)
    state3
  }
}
