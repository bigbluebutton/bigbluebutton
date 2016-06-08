package org.bigbluebutton.core.domain

import akka.actor.ActorRef

object Role {
  val MODERATOR = "Moderator"
  val VIEWER = "Viewer"
  val PRESENTER = "Presenter"
}

case class RegisteredUser(id: IntUserId, extId: ExtUserId, name: Name, roles: Set[String], authToken: AuthToken)

case class UserVO(
  id: IntUserId,
  extId: ExtUserId,
  name: Name,
  roles: Set[String],
  emojiStatus: EmojiStatus,
  presenter: IsPresenter,
  hasStream: HasStream,
  locked: Locked,
  webcamStreams: Set[String],
  phoneUser: PhoneUser,
  voiceUser: VoiceUser,
  listenOnly: ListenOnly,
  joinedWeb: JoinedWeb)

case class CallerId(name: CallerIdName, number: CallerIdNum)

case class VoiceUser(
  id: VoiceUserId,
  webUserId: IntUserId,
  callerId: CallerId,
  joinedVoice: JoinedVoice,
  locked: Locked,
  muted: Muted,
  talking: Talking,
  listenOnly: ListenOnly)

case class Presenter(id: IntUserId, name: Name, assignedBy: IntUserId)

case class Permissions(
  disableCam: Boolean = false,
  disableMic: Boolean = false,
  disablePrivChat: Boolean = false,
  disablePubChat: Boolean = false,
  lockedLayout: Boolean = false,
  lockOnJoin: Boolean = false,
  lockOnJoinConfigurable: Boolean = false)

/**
 *   Use Value Classes to help with type safety.
 *   https://ivanyu.me/blog/2014/12/14/value-classes-in-scala/
 */

case class Name(value: String) extends AnyVal
case class IntMeetingId(value: String) extends AnyVal
case class ExtMeetingId(value: String) extends AnyVal
case class Duration(value: Int) extends AnyVal
case class Recorded(value: Boolean) extends AnyVal
case class VoiceConf(value: String) extends AnyVal
case class AuthToken(value: String) extends AnyVal
case class IntUserId(value: String) extends AnyVal
case class PresenceId(value: String) extends AnyVal
case class ExtUserId(value: String) extends AnyVal
case class EmojiStatus(value: String) extends AnyVal
case class IsPresenter(value: Boolean) extends AnyVal
case class HasStream(value: Boolean) extends AnyVal
case class Locked(value: Boolean) extends AnyVal
case class PhoneUser(value: Boolean) extends AnyVal
case class ListenOnly(value: Boolean) extends AnyVal
case class JoinedWeb(value: Boolean) extends AnyVal
case class VoiceUserId(value: String) extends AnyVal
case class CallerIdName(value: String) extends AnyVal
case class CallerIdNum(value: String) extends AnyVal
case class JoinedVoice(value: Boolean) extends AnyVal
case class ListenDirection(value: Boolean) extends AnyVal
case class TalkDirection(value: Boolean) extends AnyVal
case class Muted(value: Boolean) extends AnyVal
case class Talking(value: Boolean) extends AnyVal
case class SessionId(value: String) extends AnyVal
case class ReplyTo(value: String) extends AnyVal
case class UserAgent(value: String) extends AnyVal
case class Locale(value: String) extends AnyVal
case class SessionToken(value: String) extends AnyVal
case class PresenceActorRef(value: ActorRef) extends AnyVal
case class Joined(value: Boolean) extends AnyVal
case class Welcome(value: String) extends AnyVal
case class DialNumber(value: String) extends AnyVal
case class PinNumber(value: Int) extends AnyVal
case class LeftOn(value: Long) extends AnyVal
case class JoinedOn(value: Long) extends AnyVal
case class LogoutUrl(value: String) extends AnyVal
case class Avatar(value: String) extends AnyVal

case class MeetingActorRef(id: IntMeetingId, value: ActorRef)
case class UserActorRef(id: IntUserId, actorRef: ActorRef)

