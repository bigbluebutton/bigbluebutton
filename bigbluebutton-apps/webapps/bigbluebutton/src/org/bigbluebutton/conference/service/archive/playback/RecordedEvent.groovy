/*
 * BigBlueButton - http://www.bigbluebutton.org
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
 * $Id: $
 */

package org.bigbluebutton.conference.service.archive.playback

import java.util.concurrent.Delayed
import java.util.concurrent.TimeUnit

public class RecordedEvent implements Delayed {
	   private long endOfDelay
	   private final Date requestTime
	   private final PlaybackSession session
	   
	   public RecordedEvent(PlaybackSession session) {
	      this.session = session
	   }

	   public long getDelay(TimeUnit timeUnit) {
		   long delay = timeUnit.convert(endOfDelay - System.currentTimeMillis(), TimeUnit.MILLISECONDS)
	      return delay
	   }

	   public int compareTo(Delayed delayed) {
		  RecordedEvent request = (RecordedEvent)delayed;
	      if (this.endOfDelay < request.endOfDelay)
	         return -1;
	      if (this.endOfDelay > request.endOfDelay)
	         return 1;
	      return this.requestTime.compareTo(request.requestTime);
	   }
	   
	   public void playMessage() {
		   session.playMessage()
	   }
	   
	   public boolean scheduleNextEvent() {
		   endOfDelay = System.currentTimeMillis() + session.playMessageIn()
		   session.hasMessageToSend()
	   }
}
