package org.bigbluebutton.core

import org.bigbluebutton.core.api.UserVO
import org.bigbluebutton.core.api.Role._

class User(val intUserID: String, val extUserID: String, val name: String, val role: Role) {

  private var presenter = false
  private var handRaised = false
  private var hasStream = false
  private var voiceId: String = _
  private var muted = false
  private var talking = false
  private var locked = false

  def isPresenter(): Boolean = {
    return presenter;
  }

  def becomePresenter() {
    presenter = true
  }

  def unbecomePresenter() {
    presenter = false
  }
}

case class VoiceUser(userId: String, muted: Boolean = false, talking: Boolean = false, locked: Boolean = false)
