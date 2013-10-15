package org.bigbluebutton.core.models

import org.bigbluebutton.core.api.Role._

case class Status(isPresenter: Boolean = false, handRaised: Boolean = false)
case class Voice(hasJoined: Boolean = false, id: String = "", 
    muted: Boolean = false, talking: Boolean = false, locked: Boolean = false)
case class UserV(id: String, extId: String, name: String, role: Role = VIEWER, status: Status = Status(), voice: Voice = Voice())