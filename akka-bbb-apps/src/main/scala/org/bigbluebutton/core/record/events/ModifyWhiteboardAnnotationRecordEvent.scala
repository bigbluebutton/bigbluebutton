
package org.bigbluebutton.core.record.events

import org.bigbluebutton.common2.util.JsonUtil
import org.bigbluebutton.common2.msgs.AnnotationVO

class ModifyWhiteboardAnnotationRecordEvent extends AbstractWhiteboardRecordEvent {
  import ModifyWhiteboardAnnotationRecordEvent._

  setEvent("ModifyWhiteboardAnnotationEvent")

  def setUserId(userId: String) = {
    eventMap.put(USER_ID, userId)
  }

  def setAction(action: String) = {
    eventMap.put(ACTION, action)
  }

  def setRemovedShapeIds(shapeIds: List[String]) = {
    eventMap.put(REMOVED_SHAPE_ID, listToString(shapeIds))
  }

  def setAddedAnnotations(annotations: List[AnnotationVO]) = {
    eventMap.put(ADDED_ANNOTATIONS, JsonUtil.toJson(annotations))
  }

  private def listToString(list: List[_]): String = {
    list.map(f => f.toString).mkString(",")
  }
}

object ModifyWhiteboardAnnotationRecordEvent {
  protected final val USER_ID = "userId"
  protected final val ACTION = "action"
  protected final val REMOVED_SHAPE_ID = "removedShapeIds"
  protected final val ADDED_ANNOTATIONS = "addedAnnotations"
}