/**
 * BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
 *
 * Copyright (c) 2017 BigBlueButton Inc. and by respective authors (see below).
 *
 * This program is free software; you can redistribute it and/or modify it under the
 * terms of the GNU Lesser General Public License as published by the Free Software
 * Foundation; either version 3.0 of the License, or (at your option) any later
 * version.
 *
 * BigBlueButton is distributed in the hope that it will be useful, but WITHOUT ANY
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
 * PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License along
 * with BigBlueButton; if not, see <http://www.gnu.org/licenses/>.
 *
 */

package org.bigbluebutton.core.record.events

import java.lang.annotation.Annotation

class UndoAnnotationRecordEvent extends AbstractWhiteboardRecordEvent {
  import UndoAnnotationRecordEvent._

  setEvent("UndoAnnotationEvent")

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

object UndoAnnotationRecordEvent {
  protected final val USER_ID = "userId"
  protected final val REMOVED_SHAPE_ID = "removedShapeIds"
}