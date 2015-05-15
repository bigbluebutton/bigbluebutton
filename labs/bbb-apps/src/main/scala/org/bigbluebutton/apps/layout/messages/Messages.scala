package org.bigbluebutton.apps.layout.messages

import org.bigbluebutton.apps.Session
import org.bigbluebutton.apps.users.data.UserIdAndName

case class NewLayout(session: Session, layoutId: String, 
                     layout: String, default: Boolean = false)
case class GetCurrentLayoutRequest(session: Session, requester: UserIdAndName)
case class SetLayoutRequest(session: Session, requester: UserIdAndName, layoutId: String)
case class LockLayoutRequest(session: Session, requester: UserIdAndName, 
                             lock: Boolean, layoutId: String)

case class GetCurrentLayoutResponse(session: Session, 
                                    requester: UserIdAndName, 
                                    layoutId: String)
case class SetLayout(session: Session, requester: UserIdAndName, layoutId: String)
case class LockedLayout(session: Session, requester: UserIdAndName, lock: Boolean, layoutId: String)