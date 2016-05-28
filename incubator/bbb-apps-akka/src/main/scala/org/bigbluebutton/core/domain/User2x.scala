package org.bigbluebutton.core.domain

import com.softwaremill.quicklens._

trait Role2x
case object ModeratorRole extends Role2x
case object ViewerRole extends Role2x
case object PresenterRole extends Role2x
case object GuestRole extends Role2x
case object AuthenticatedGuestRole extends Role2x
case object StenographerRole extends Role2x
case object SignLanguageInterpreterRole extends Role2x

sealed trait Presence
case class FlashBrowserPresence(
  id: IntUserId,
  extId: ExtUserId,
  name: Name,
  sessionId: SessionId) extends Presence

case class FlashVoiceTwoWayPresence(
  id: IntUserId,
  extId: ExtUserId,
  name: Name,
  sessionId: SessionId) extends Presence

case class FlashVoiceListenOnlyPresence(
  id: IntUserId,
  extId: ExtUserId,
  name: Name,
  sessionId: SessionId) extends Presence

case class WebRtcVoiceListenOnlyPresence(
  id: IntUserId,
  extId: ExtUserId,
  name: Name,
  sessionId: SessionId) extends Presence

case class WebRtcVoiceTwoWayPresence(
  id: IntUserId,
  extId: ExtUserId,
  name: Name,
  sessionId: SessionId) extends Presence

case class PhoneInVoicePresence(
  id: IntUserId,
  extId: ExtUserId,
  name: Name,
  sessionId: SessionId) extends Presence

case class RegisteredUser2x(id: IntUserId,
  extId: ExtUserId,
  name: Name,
  roles: Set[Role2x],
  authToken: AuthToken,
  avatar: Avatar,
  logoutUrl: LogoutUrl,
  welcome: Welcome,
  dialNumbers: Set[DialNumber],
  pinNumber: PinNumber,
  config: Set[String],
  extData: Set[String])

case class UserAbilities(removed: Set[Abilities2x], added: Set[Abilities2x], applyMeetingAbilities: Boolean)

case class Voice2x(
  id: VoiceUserId,
  webId: IntUserId,
  callId: CallerId,
  phoningIn: PhoneUser,
  joined: JoinedVoice,
  locked: Locked,
  muted: Muted,
  talking: Talking)

object Stream {

  def add(stream: Stream, user: IntUserId): Stream = {
    val newViewers = stream.viewers + user
    modify(stream)(_.viewers).setTo(newViewers)
  }

  def remove(stream: Stream, user: IntUserId): Stream = {
    val newViewers = stream.viewers - user
    modify(stream)(_.viewers).setTo(newViewers)
  }
}

case class MediaAttribute(key: String, value: String)
case class Stream(id: String, sessionId: SessionId, attributes: Set[MediaAttribute], viewers: Set[IntUserId])

object Voice4x {
  def mute(voice: Voice4x): Voice4x = {
    modify(voice)(_.muted).setTo(Muted(true))
  }

  def unMute(voice: Voice4x): Voice4x = {
    modify(voice)(_.muted).setTo(Muted(false))
  }

  def joined(voice: Voice4x): Voice4x = {
    modify(voice)(_.joined).setTo(JoinedVoice(true))
  }

  def left(voice: Voice4x): Voice4x = {
    Voice4x(voice.id)
  }

  def listenOnly(voice: Voice4x): Voice4x = {
    modify(voice)(_.listenDirection).setTo(ListenDirection(true))
    modify(voice)(_.talkDirection).setTo(TalkDirection(false))
  }
}

case class Voice4x(
  id: VoiceUserId,
  joined: JoinedVoice = JoinedVoice(false),
  userAgent: UserAgent = UserAgent("None"),
  callerId: CallerId = CallerId(CallerIdName("unknown"), CallerIdNum("unknown")),
  listenDirection: ListenDirection = ListenDirection(false),
  talkDirection: TalkDirection = TalkDirection(false),
  muted: Muted = Muted(true),
  talking: Talking = Talking(false))

object User3x {
  def create(id: IntUserId, extId: ExtUserId, name: Name, roles: Set[Role2x]): User3x = {

    new User3x(id, extId, name, EmojiStatus("none"), roles,
      Set.empty, new UserAbilities(Set.empty, Set.empty, false),
      Set.empty, Set.empty, Set.empty)
  }

  def update(old: Presence2x, user: User3x, updated: Presence2x): User3x = {
    modify(user)(_.presence).setTo((user.presence - old) + updated)
  }

  def findWithPresenceId(presence: Set[Presence2x], presenceId: PresenceId): Option[Presence2x] = {
    presence.find(p => p.id == presenceId)
  }

  def add(user: User3x, presence: Presence2x): User3x = {
    modify(user)(_.presence).setTo(user.presence + presence)
  }

  def add(user: User3x, role: Role2x): User3x = {
    modify(user)(_.roles).setTo(user.roles + role)
  }

  def remove(user: User3x, role: Role2x): User3x = {
    modify(user)(_.roles).setTo(user.roles - role)
  }

  def update(user: User3x, emoji: EmojiStatus): User3x = {
    modify(user)(_.emojiStatus).setTo(emoji)
  }

  def create(id: PresenceId, userAgent: PresenceUserAgent): Presence2x = {
    userAgent match {
      case FlashWebUserAgent => Presence2x(
        id, UserAgent("Flash"), Set.empty, DataApp2x(SessionId("none")), Voice4x(VoiceUserId("foo")),
        WebCamStreams(Set.empty), ScreenShareStreams(Set.empty))
      case Html5WebUserAgent => Presence2x(id, UserAgent("Html5"), Set.empty, DataApp2x(SessionId("none")),
        Voice4x(VoiceUserId("foo")), WebCamStreams(Set.empty), ScreenShareStreams(Set.empty))
    }
  }
}

case class User3x(
    id: IntUserId,
    extId: ExtUserId,
    name: Name,
    emojiStatus: EmojiStatus,
    roles: Set[Role2x],
    presence: Set[Presence2x],
    permissions: UserAbilities,
    roleData: Set[RoleData],
    config: Set[String],
    extData: Set[String]) {

  def isModerator: Boolean = roles.contains(ModeratorRole)
}

trait PresenceUserAgent
case object FlashWebUserAgent extends PresenceUserAgent
case object Html5WebUserAgent extends PresenceUserAgent

object Presence2x {
  def save(presence: Presence2x, data: DataApp2x): Presence2x = {
    modify(presence)(_.data).setTo(data)
  }

  def save(presence: Presence2x, app: Voice4x): Presence2x = {
    modify(presence)(_.voice).setTo(app)
  }
}

case class Presence2x(
  id: PresenceId,
  userAgent: UserAgent,
  sessions: Set[SessionId],
  data: DataApp2x,
  voice: Voice4x,
  webCams: WebCamStreams,
  screenShare: ScreenShareStreams)

object DataApp2x {
  def update(data: DataApp2x, session: SessionId): DataApp2x = {
    modify(data)(_.sessionId).setTo(session)
  }
}

case class DataApp2x(sessionId: SessionId)
case class WebCamStreams(streams: Set[Stream])
case class VoiceApp2x(sessionId: SessionId, voice: Voice4x)
case class ScreenShareStreams(streams: Set[Stream])

trait RoleData
case class SignLanguageInterpreterRoleData(locale: Locale, stream: Stream) extends RoleData {
  val role: Role2x = SignLanguageInterpreterRole
}
case class StenographerRoleData(locale: Locale, captionStream: CaptionStream) extends RoleData {
  val role: Role2x = StenographerRole
}

case class CaptionStream(url: String)

