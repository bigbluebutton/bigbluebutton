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

package org.bigbluebutton.presentation;

import java.util.HashMap;
import java.util.Map;

public class ConversionUpdateMessage {
	private Map<String, Object> message = new HashMap<String, Object>();
	
	private ConversionUpdateMessage(MessageBuilder builder) {
		message = builder.message;
	}
	
	public Map<String, Object> getMessage() {
		return message;
	}
	
	public static class MessageBuilder {
		private Map<String, Object> message = new HashMap<String, Object>();
		
		public MessageBuilder(UploadedPresentation pres) {
			message.put("conference", pres.getConference());
			message.put("room", pres.getRoom());
			message.put("returnCode", "CONVERT");
			message.put("presentationName", pres.getName());
    	}
		
		public MessageBuilder entry(String key, Object value) {
			message.put(key, value);
			return this;
		}
		
		public MessageBuilder messageKey(String messageKey) {
			message.put("messageKey", messageKey);
			return this;
		}
		
		public MessageBuilder pagesCompleted(int pagesCompleted) {
			message.put("pagesCompleted", pagesCompleted);
			return this;
		}
		
		public MessageBuilder numberOfPages(int numberOfPages) {
			message.put("numberOfPages", numberOfPages);
			return this;
		}
		
		public MessageBuilder maxNumberPages(int maxNumberPages) {
			message.put("maxNumberPages", maxNumberPages);
			return this;
		}
		
		public MessageBuilder slidesInfo(String slidesInfo) {
			message.put("slidesInfo", slidesInfo);
			return this;
		} 
				
		public ConversionUpdateMessage build() {
			return new ConversionUpdateMessage(this);
		}
	}
}
