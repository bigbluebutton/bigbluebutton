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
import java.util.concurrent.ConcurrentHashMapimport org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.red5.logging.Red5LoggerFactory

public class PlaybackSession {
	private static Logger log = Red5LoggerFactory.getLogger( PlaybackSession.class, "bigbluebutton" )
	
	private final String conference
	private final String room
	private final String name
	private final Map<String, IPlaybackNotifier> notifiers
	private final IPlaybackPlayer player
	private Map currentMessage
	private Map nextMessage
	private boolean playing = false
	private boolean initialMessage = true
	private long playbackTime = 0
	
	public PlaybackSession(String name) {
		this.name = name
		notifiers = new ConcurrentHashMap<String, IPlaybackNotifier>()
	}
	
	public String getName() {
		return name
	}
	
	public void setPlaybackPlayer(IPlaybackPlayer player) {
		this.player = player
	}
	
	public void addPlaybackNotifier(String name, IPlaybackNotifier notifier) {
		assert name != null
		assert notifier != null
		notifiers.put(name, notifier)
	}
	
	public void removePlaybackNotifier(String name) {
		notifiers.remove(name)
	}
	
	public void startPlayback() {
		player.initialize()
		playing = true
		initialMessage = true
		currentMessage = initializingMessage()
		nextMessage = player.getMessage()
		// Let's wait 1 second to play the initial message
		playbackTime = 1000L
	}
	
	public void stopPlayback() {
		player.reset()
		playing = false
	}
	
	public void playMessage() {
		if (playing) {
			IPlaybackNotifier n = notifiers.get(currentMessage["application"])
			def playDate = new Date()
			def app = currentMessage['application']
			def evt = currentMessage['event']
			log.debug("$playDate: playing [$app $evt]")
			if (n != null){				
				n.sendMessage(currentMessage)
			}
			if (initialMessage) {
				// This is the first recorded message.
				// Let's play it after 1 second.
				playbackTime = 1000L
				initialMessage = false
			} else {
				if (nextMessage == null) {
					// we just played our last message.
					// NOTE:Need to refactor this to make it more cleaner/DRYier.
					currentMessage = nextMessage // so hasMessageToSend() returns false (UGLY)
					return
				}
				// We compute the gap between each recorded message.
				playbackTime = new Long(nextMessage["date"].longValue()) - 
								new Long(currentMessage["date"].longValue())
			}			
			def nextApp = nextMessage['application']
			def nextEvt = nextMessage['event']
			// Setup the next message to send.
			log.debug("Will play $nextApp:$nextEvt in $playbackTime milliseconds.")
			currentMessage = nextMessage
			nextMessage = player.getMessage()
		}
	}
	
	public void pausePlayback() {
		playing = false
	}	
	
	public void resumePlayback() {
		playing = true
	}
		
	public long playMessageIn() {
		assert playbackTime != null
		playbackTime
	}
	
	public boolean hasMessageToSend() {
		// We have a message to send if the user has not paused/stop and
		// haven't reached the end of the recorded events.
		def hasMessage = playing && (currentMessage != null)
		if (hasMessage) {
			log.debug("There is still a message to send.")
		} else {
			log.debug("No more message to send.")
		}
		
		return (playing && (currentMessage != null))
	}
		
	private Map initializingMessage() {
		Map m = new HashMap()
		m.put("date", new Date())
		m.put("application", "PLAYBACK")
		m.put("event", "InitializeEvent")
		m.put("message", "Initializing...")
		return m
	}
}
