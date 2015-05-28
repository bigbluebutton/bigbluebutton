package org.bigbluebutton.apps.whiteboard.messages

import org.bigbluebutton.apps.Session
import org.bigbluebutton.apps.whiteboard.data._
import org.bigbluebutton.apps.users.data.UserIdAndName

case class NewWhiteboardShape(session: Session, descriptor: ShapeDescriptor,
  shape: WhiteboardShape)
case class WhiteboardShapeCreated(session: Session, shape: Shape)

case class UpdateWhiteboardShape(session: Session, descriptor: ShapeDescriptor,
  shape: WhiteboardShape)
case class WhiteboardShapeUpdated(session: Session, descriptor: ShapeDescriptor,
  shape: WhiteboardShape)

case class DeleteWhiteboardShape(session: Session, whiteboardId: String,
  shapeId: String, deletedBy: UserIdAndName)

case class GetWhiteboardShapes(session: Session, requester: UserIdAndName,
  whiteboardId: String)
case class GetWhiteboardShapesResponse(session: Session, requester: UserIdAndName,
  whiteboardId: String, shapes: Seq[Shape])

case class ClearWhiteboardShapes(session: Session, requester: UserIdAndName,
  whiteboardIds: Seq[String])
case class DeleteWhiteboard(session: Session, requester: UserIdAndName,
  whiteboardIds: Seq[String])

case class GetWhiteboardOptions(session: Session, requester: UserIdAndName)

case class SendWhiteboardOptions(session: Session, requester: UserIdAndName,
  options: Map[String, String])

