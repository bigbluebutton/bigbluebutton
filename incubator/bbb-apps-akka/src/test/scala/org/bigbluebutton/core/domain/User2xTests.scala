package org.bigbluebutton.core.domain

import org.bigbluebutton.core.UnitSpec

class User2xTests extends UnitSpec {
  val flashListenOnly = Voice4x(VoiceUserId("flash-web-listen-only-session-id"))
  val dataApp = DataApp2x(SessionId("data-session-id"))
  val webCamApp = WebCamStreams(Set.empty)
  val voiceApp = VoiceApp2x(SessionId("voice-session-id"), flashListenOnly)
  val screenShareApp = ScreenShareStreams(Set.empty)

  it should "update presence" in {
    val presence1 = new Presence2x(
      PresenceId("flash-web-presence-id-1"),
      UserAgent("Flash"), Set.empty, dataApp, Voice4x(VoiceUserId("foo")), webCamApp, screenShareApp)
    val presence2 = new Presence2x(
      PresenceId("flash-web-presence-id-2"),
      UserAgent("Flash"), Set.empty, dataApp, Voice4x(VoiceUserId("foo")), webCamApp, screenShareApp)
    val presence3 = new Presence2x(
      PresenceId("flash-web-presence-id-3"),
      UserAgent("Flash"), Set.empty, dataApp, Voice4x(VoiceUserId("foo")), webCamApp, screenShareApp)

    val perm: Set[Abilities2x] = Set(CanEjectUser, CanRaiseHand)
    val user = new User3x(
      IntUserId("userid-1"),
      ExtUserId("userid-1"),
      Name("Foo"),
      EmojiStatus("none"),
      Set(ModeratorRole, PresenterRole),
      Set(presence1, presence2),
      UserAbilities(Set.empty, Set.empty, false),
      Set.empty, Set.empty, Set.empty)

    val newDataApp = DataApp2x(SessionId("updated-session"))
    val presence1a = Presence2x.save(presence1, newDataApp)
    val newUser = User3x.update(presence1, user, presence1a)

    assert(newUser.presence.size == 2)
  }

  //  it should "not eject user" in {
  //    object DefPerm extends DefaultPermissionsFilter
  //    val perm: Set[Permission2x] = Set(CanRaiseHand)
  //
  //    assert(DefPerm.can(CanEjectUser, perm) != true)
  //  }

}
