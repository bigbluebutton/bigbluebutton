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

import org.ho.yaml.Yaml
import java.util.concurrent.atomic.AtomicIntegerimport org.ho.yaml.YamlDecoderimport org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.red5.logging.Red5LoggerFactory
public class FileReaderPlaybackPlayer implements IPlaybackPlayer{
	private static Logger log = Red5LoggerFactory.getLogger( FileReaderPlaybackPlayer.class, "bigbluebutton" )
	
	private final String conference
	private final String room
	private final File file
	def recordedEvents
	def playerReady = false
	private final AtomicInteger eventNumber = new AtomicInteger(0)
	def recordingsBaseDirectory
	
	public FileReaderPlaybackPlayer(String conference, String room) {
		this.conference = conference
		this.room = room
	}
	
	public void initialize() {
		File roomDir = new File("$recordingsBaseDirectory/$conference/$room")
		File recordingFile = new File(roomDir.canonicalPath + File.separator + "recordings.yaml" )
		assert recordingFile.exists()
		
		recordedEvents = []
		
//		 Let's read back the saved data.
        YamlDecoder dec = new YamlDecoder(recordingFile.newInputStream());
        try{
          while (true){
            Map eventRead = dec.readObject();
            recordedEvents.add(eventRead)
          }
        }catch (EOFException e){
        	log.debug("Finished reading recordings file.");
        }finally {
          dec.close();
        }
        
        log.debug("Read ${recordedEvents.size()} events.")
		if (recordedEvents != null) {
			playerReady = true
		}
	}
	
	public Map getMessage() {
		if ((int)eventNumber < recordedEvents.size()){
			Map e = recordedEvents[eventNumber as int]
			def evt = e['event']
			log.debug("Giving message $eventNumber - $evt.")
			return recordedEvents[eventNumber.andIncrement]
		}
		return null
	}
	
	public boolean isReady() {
		return playerReady
	}
	
	public void reset() {
		eventNumber.set(0)
	}
	
	public int getEventNumber() {
		eventNumber
	}
	
	public int numberOfEvents() {
		return recordedEvents.size()
	}
	
	public void setRecordingsBaseDirectory(String directory) {
		recordingsBaseDirectory = directory
	}
}
