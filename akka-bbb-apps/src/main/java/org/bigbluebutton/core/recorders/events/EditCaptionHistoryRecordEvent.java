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
package org.bigbluebutton.core.recorders.events;


public class EditCaptionHistoryRecordEvent extends AbstractCaptionRecordEvent {
	private static final String START_INDEX = "startIndex";
	private static final String END_INDEX = "endIndex";
	private static final String LOCALE = "locale";
	private static final String LOCALE_CODE = "localeCode";
	private static final String TEXT = "text";
	
	public EditCaptionHistoryRecordEvent() {
		super();
		setEvent("EditCaptionHistoryEvent");
	}
		
	public void setStartIndex(String startIndex) {
		eventMap.put(START_INDEX, startIndex);
	}
	
	public void setEndIndex(String endIndex) {
		eventMap.put(END_INDEX, endIndex);
	}
	
	public void setLocale(String locale) {
		eventMap.put(LOCALE, locale);
	}
	
	public void setLocaleCode(String localeCode) {
		eventMap.put(LOCALE_CODE, localeCode);
	}
	
	public void setText(String text) {
		eventMap.put(TEXT, text);
	}
}
