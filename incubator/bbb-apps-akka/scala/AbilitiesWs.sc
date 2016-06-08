import org.bigbluebutton.core.domain.{ModeratorRole, PresenterRole, Role2x}
import org.bigbluebutton.core.filters.DefaultAbilitiesFilter

object AbilitiesWs {
  val roles: Set[Role2x] = Set(ModeratorRole, PresenterRole)
  println(roles)
  object DefPerm extends DefaultAbilitiesFilter
  val permFilter = DefPerm
  val abilities = DefPerm.calcRolesAbilities(roles)
  println(abilities)
}