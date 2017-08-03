package org.bigbluebutton.core.apps

import org.bigbluebutton.common2.domain.UserVO

trait PermisssionCheck {

  def isAllowed(permission: String, role: String, user: UserVO): Boolean = {
    true
  }
}
