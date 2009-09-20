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
 * @version $Id: $
 */
package org.bigbluebutton.web.services

import org.bigbluebutton.presentation.service.AdhocConference
import java.util.concurrent.ConcurrentHashMap

public class AdhocConferenceService{

	 boolean enabled = false
	
	 private final Map<String, AdhocConference> conferences
	 
	 public AdhocConferenceService() {
		 conferences = new ConcurrentHashMap<String, AdhocConference>()
	 }
	 
	 public void createConference(String voiceBridge) {
		 AdhocConference conference = new AdhocConference(voiceBridge)
		 if (!conferences.containsKey(conference.voiceBridge))
			 conferences.put(conference.voiceBridge, conference) 
	 }
	 
	 public void createConference(AdhocConference conference) {
		 if (!conferences.containsKey(conference.voiceBridge))
			 conferences.put(conference.voiceBridge, conference) 
	 }
	 
	 public boolean conferenceExistWithVoiceBridge(String voiceBridge) {
		 return conferences.containsKey(voiceBridge)
	 }
	
	 /*
	  *  Returns the AdhocConference if present, 
	  *  or null if absent.
	  */
	 public AdhocConference getConferenceWithVoiceBridge(String voiceBridge) {
		return conferences.get(voiceBridge) 
	 }
	 
	 public boolean conferenceExistWithModeratorToken(String token) {
		for (Iterator iter = conferences.values().iterator(); iter.hasNext();) {
			AdhocConference conf = (AdhocConference) iter.next()
			println conf.moderatorToken
			if (conf.moderatorToken == token) {
				return true
			}
		}			 
		
		return false
	 }

	 /*
	  *  Returns the AdhocConference if present, 
	  *  or null if absent.
	  */
	 public AdhocConference getConferenceWithModeratorToken(String token) {
		for (Iterator iter = conferences.values().iterator(); iter.hasNext();) {
			AdhocConference conf = (AdhocConference) iter.next()
			println conf.moderatorToken
			if (conf.moderatorToken == token) {
				return conf
			}
		}			 
			
		return null
	 }	 
	 
	 public boolean conferenceExistWithAttendeeToken(String token) {
		for (Iterator iter = conferences.values().iterator(); iter.hasNext();) {
			AdhocConference conf = (AdhocConference) iter.next()
			println conf.attendeeToken
			if (conf.attendeeToken == token) {
				return true
			}
		}			 
			
		return false
	}

	 /*
	  *  Returns the AdhocConference if present, 
	  *  or null if absent.
	  */
	public AdhocConference getConferenceWithAttendeeToken(String token) {
		for (Iterator iter = conferences.values().iterator(); iter.hasNext();) {
			AdhocConference conf = (AdhocConference) iter.next()
			println conf.attendeeToken
			if (conf.attendeeToken == token) {
				return conf
			}
		}			 
				
		return null
	}	 
}
