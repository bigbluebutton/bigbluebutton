/**
* BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
* 
* Copyright (c) 2012 BigBlueButton Inc. and by respective authors (see below).
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
package org.bigbluebutton.conference.service.recorder.polling;


public class PollCreatedRecordEvent extends AbstractPollRecordEvent {

	private static final String POLL_ID = "pollID";
	private static final String TITLE = "title";

	private static final String QUESTION_PATTERN = "question";
	private static final String QUESTION_TEXT = "text";
	private static final String QUESTION_MULTIRESPONSE = "multiresponse";

	private static final String RESPONSE_PATTERN = "response";
	private static final String RESPONSE_TEXT = "text";

	private static final String RESPONDER_PATTERN = "responder";
	private static final String RESPONDER_USER = "user";

	private static final String SEPARATOR = "-";

	
	public PollCreatedRecordEvent() {
		super();
		setEvent("PollCreatedEvent");
	}
		
	public void setPollID(String pollID) {
		eventMap.put(POLL_ID, pollID);
	}
	
	public void setTitle(String title) {
		eventMap.put(TITLE, title);
	}

	public void addQuestion(String id, String question, Boolean multiresponse) {
		eventMap.put(QUESTION_PATTERN + SEPARATOR + id + SEPARATOR + QUESTION_TEXT, question);
		eventMap.put(QUESTION_PATTERN + SEPARATOR + id + SEPARATOR + QUESTION_MULTIRESPONSE, multiresponse.toString());	
	}

	public void addResponse(String questionID, String responseID, String response) {
		eventMap.put(QUESTION_PATTERN + SEPARATOR + questionID + SEPARATOR + RESPONSE_PATTERN + SEPARATOR + responseID + RESPONSE_TEXT, response);
	}

	/*public void addResponder(String questionID, String responseID, String responderID, String userID) {
		eventMap.put(QUESTION_PATTERN + SEPARATOR + questionID + SEPARATOR + RESPONSE_PATTERN + SEPARATOR + responseID + RESPONSE_TEXT, response);
	}*/

}
