/* BigBlueButton - http://www.bigbluebutton.org
 * 
 * 
 * Copyright (c) 2008-2009 by respective authors (see below). All rights reserved.
 * 
 * BigBlueButton is free software; you can redistribute it and/or modify it under the 
 * terms of the GNU Lesser General Public License as published by the Free Software 
 * Foundation; either version 3 of the License, or (at your option) any later 
 * version. 
 * 
 * BigBlueButton is distributed in the hope that it will be useful, but WITHOUT ANY 
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A 
 * PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
 * 
 * You should have received a copy of the GNU Lesser General Public License along 
 * with BigBlueButton; if not, If not, see <http://www.gnu.org/licenses/>.
 *
 * @author Jeremy Thomerson <jthomerson@genericconf.com>
 * @version $Id: $
 */
package org.bigbluebutton.web.services

import java.util.concurrent.ConcurrentHashMap

import org.bigbluebutton.api.domain.DynamicConference;

public class DynamicConferenceService{
	 def serviceEnabled = false
	
	 private final Map<String, DynamicConference> confsByMtgID
	 private final Map<String, String> tokenMap
	 
	 public DynamicConferenceService() {
		 confsByMtgID = new ConcurrentHashMap<String, DynamicConference>()
		 tokenMap = new ConcurrentHashMap<String, String>()
	 }

	 public void storeConference(DynamicConference conf) {
		 confsByMtgID.put(conf.getMeetingID(), conf);
		 tokenMap.put(conf.getMeetingToken(), conf.getMeetingID());
	 }
	 public DynamicConference getConferenceByMeetingID(String meetingID) {
		 return confsByMtgID.get(meetingID);
	 }
	 public DynamicConference getConferenceByToken(String token) {
		 String mtgID = tokenMap.get(token);
		 return confsByMtgID.get(mtgID);
	 }


}
