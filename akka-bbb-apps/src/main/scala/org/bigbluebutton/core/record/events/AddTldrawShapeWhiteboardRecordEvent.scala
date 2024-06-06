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

import org.bigbluebutton.common2.domain.SimpleVoteOutVO
import scala.collection.immutable.List
import scala.collection.Map
import scala.collection.mutable.ArrayBuffer
import spray.json._
import DefaultJsonProtocol._

class AddTldrawShapeWhiteboardRecordEvent extends AbstractWhiteboardRecordEvent {
  import AddTldrawShapeWhiteboardRecordEvent._

  implicit object AnyJsonFormat extends JsonFormat[Any] {
    def write(x: Any) = x match {
      case n: Int                                       => JsNumber(n)
      case s: String                                    => JsString(s)
      case d: Double                                    => JsNumber(d)
      case m: scala.collection.immutable.Map[String, _] => mapFormat[String, Any].write(m)
      case l: List[_]                                   => listFormat[Any].write(l)
      case b: Boolean if b == true                      => JsTrue
      case b: Boolean if b == false                     => JsFalse
    }

    def read(value: JsValue) = {}
  }

  setEvent("AddTldrawShapeEvent")

  def setUserId(id: String) {
    eventMap.put(USER_ID, id)
  }

  def setAnnotationId(id: String) {
    eventMap.put(SHAPE_ID, id)
  }

  def addAnnotation(annotation: scala.collection.immutable.Map[String, Any]) {
    eventMap.put(SHAPE_DATA, annotation.toJson.compactPrint)
  }
}

object AddTldrawShapeWhiteboardRecordEvent {
  protected final val USER_ID = "userId"
  protected final val SHAPE_ID = "shapeId"
  protected final val SHAPE_DATA = "shapeData"
}
