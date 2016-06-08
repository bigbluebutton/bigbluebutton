package org.bigbluebutton.core.filters

import org.bigbluebutton.core.domain._

object RoleAbilities {
  val moderatorAbilities = Set(
    CanAssignPresenter,
    CanChangeLayout,
    CanEjectUser,
    CanLockLayout,
    CanPrivateChat,
    CanPublicChat)

  val presenterAbilities = Set(
    CanUploadPresentation,
    CanSharePresentation)

  val viewerAbilities = Set(
    CanShareCamera,
    CanRaiseHand,
    CanUseMicrophone)
}

object ClientTypeAbilities {
  val flashWebClientAbilities = Set(HasLayoutSupport, HasWebRtcSupport)
}

trait DefaultAbilitiesFilter {
  def can(action: Abilities2x, abilities: Set[Abilities2x]): Boolean = {
    abilities contains action
  }

  def calcRolesAbilities(roles: Set[Role2x]): Set[Abilities2x] = {
    var abilities: Set[Abilities2x] = Set.empty

    roles.foreach { r =>
      r match {
        case ModeratorRole =>
          abilities = abilities ++ RoleAbilities.moderatorAbilities
        case ViewerRole =>
          abilities = abilities ++ RoleAbilities.viewerAbilities
        case PresenterRole => abilities = abilities ++ RoleAbilities.presenterAbilities
      }
    }
    abilities
  }

  def add(abilities: Set[Abilities2x], to: Set[Abilities2x]): Set[Abilities2x] = {
    to ++ abilities
  }

  def subtract(abilities: Set[Abilities2x], from: Set[Abilities2x]): Set[Abilities2x] = {
    from -- abilities
  }

  def calcEffectiveAbilities(
    roles: Set[Role2x],
    userAbilities: UserAbilities,
    meetingAbilities: Set[Abilities2x]): Set[Abilities2x] = {
    var effectiveAbilities: Set[Abilities2x] = Set.empty
    effectiveAbilities = subtract(userAbilities.removed, calcRolesAbilities(roles))
    if (userAbilities.applyMeetingAbilities) {
      effectiveAbilities = subtract(meetingAbilities, effectiveAbilities)
    }

    effectiveAbilities
  }

  def calcEffectiveAbilities(
    roles: Set[Role2x],
    clientAbilities: Set[Abilities2x],
    userAbilities: UserAbilities,
    meetingAbilities: Set[Abilities2x]): Set[Abilities2x] = {

    var effectiveAbilities: Set[Abilities2x] = Set.empty
    effectiveAbilities = subtract(userAbilities.removed, add(calcRolesAbilities(roles), clientAbilities))
    if (userAbilities.applyMeetingAbilities) {
      effectiveAbilities = add(effectiveAbilities, meetingAbilities)
    }

    effectiveAbilities
  }

}
