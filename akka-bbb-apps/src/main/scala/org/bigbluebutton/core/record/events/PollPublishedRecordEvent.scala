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
import org.bigbluebutton.common2.util.JsonUtil

class PollPublishedRecordEvent extends AbstractPollRecordEvent {
  import PollPublishedRecordEvent._

  setEvent("PollPublishedRecordEvent")

  def setQuestion(question: String) {
    eventMap.put(QUESTION, question)
  }

  def setAnswers(answers: Array[SimpleVoteOutVO]) {
    eventMap.put(ANSWERS, JsonUtil.toJson(answers))
  }

  def setNumRespondents(numRespondents: Int) {
    eventMap.put(NUM_RESPONDENTS, Integer.toString(numRespondents))
  }

  def setNumResponders(numResponders: Int) {
    eventMap.put(NUM_RESPONDERS, Integer.toString(numResponders))
  }
}

object PollPublishedRecordEvent {
  protected final val USER_ID = "userId"
  protected final val QUESTION = "question"
  protected final val ANSWERS = "answers"
  protected final val NUM_RESPONDENTS = "numRespondents"
  protected final val NUM_RESPONDERS = "numResponders"
}