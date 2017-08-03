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

import scala.collection.immutable.List
import scala.collection.JavaConverters._

class AddShapeWhiteboardRecordEvent extends AbstractWhiteboardRecordEvent {
  import AddShapeWhiteboardRecordEvent._

  setEvent("AddShapeEvent")

  def setUserId(id: String) {
    eventMap.put(USER_ID, id)
  }

  def setAnnotationId(id: String) {
    eventMap.put(SHAPE_ID, id)
  }

  def addAnnotation(annotation: Map[String, Any]) {
    annotation.foreach(f => {
      if (f._1 == "points") {
        f._2 match {
          case f2: List[_] => eventMap.put("dataPoints", pointsToString(f2))
          case f2: java.util.ArrayList[_] =>
            eventMap.put("dataPoints", pointsToString(f2.asScala.toList))
        }
      } else {
        eventMap.put(f._1, f._2.toString)
      }
    })
  }

  private def pointsToString(points: List[_]): String = {
    points.map(f => f.toString).mkString(",")
  }
}

object AddShapeWhiteboardRecordEvent {
  protected final val USER_ID = "userId"
  protected final val SHAPE_ID = "shapeId"
}