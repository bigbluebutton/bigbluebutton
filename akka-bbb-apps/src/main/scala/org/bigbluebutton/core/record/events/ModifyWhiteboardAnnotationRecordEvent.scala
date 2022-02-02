
package org.bigbluebutton.core.record.events

import java.lang.annotation.Annotation

class ModifyWhiteboardAnnotationRecordEvent extends AbstractWhiteboardRecordEvent {
  import ModifyWhiteboardAnnotationRecordEvent._

  setEvent("ModifyWhiteboardAnnotationEvent")

  def setUserId(userId: String) = {
    eventMap.put(USER_ID, userId)
  }

  def setRemovedShapeIds(shapeIds: List[String]) = {
    eventMap.put(REMOVED_SHAPE_ID, listToString(shapeIds))
  }

  // def setAddedAnnotations(annotations: List[AnnotationVO])

  private def listToString(list: List[_]): String = {
    list.map(f => f.toString).mkString(",")
  }
}

object ModifyWhiteboardAnnotationRecordEvent {
  protected final val USER_ID = "userId"
  protected final val REMOVED_SHAPE_ID = "removedShapeIds"
}