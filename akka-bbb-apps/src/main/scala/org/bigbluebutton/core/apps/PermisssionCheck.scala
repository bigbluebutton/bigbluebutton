package org.bigbluebutton.core.apps

import org.bigbluebutton.core.models.UserVO

trait PermisssionCheck {

  def isAllowed(permission: String, role: String, user: UserVO): Boolean = {
    true
  }
}
