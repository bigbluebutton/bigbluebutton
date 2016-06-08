package org.bigbluebutton.core.filters

import org.bigbluebutton.core.UnitSpec
import org.bigbluebutton.core.domain.{ PresenterRole, _ }

class DefaultAbilitiesFilterTests extends UnitSpec {
  it should "eject user" in {
    object DefPerm extends DefaultAbilitiesFilter
    val perm: Set[Abilities2x] = Set(CanEjectUser, CanRaiseHand)
    assert(DefPerm.can(CanEjectUser, perm))
  }

  it should "not eject user" in {
    object DefPerm extends DefaultAbilitiesFilter
    val perm: Set[Abilities2x] = Set(CanRaiseHand)
    assert(DefPerm.can(CanEjectUser, perm) != true)
  }

  it should "calculate abilities based on roles" in {
    val roles: Set[Role2x] = Set(ModeratorRole, PresenterRole)
    object DefPerm extends DefaultAbilitiesFilter
    val perm: Set[Abilities2x] = DefPerm.calcRolesAbilities(roles)
    assert(DefPerm.can(CanSharePresentation, perm) == true)
  }
}
