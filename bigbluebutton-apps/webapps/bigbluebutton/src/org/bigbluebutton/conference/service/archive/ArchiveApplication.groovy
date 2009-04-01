
package org.bigbluebutton.conference.service.archive

import org.slf4j.Logger
import org.slf4j.LoggerFactory
import java.util.concurrent.ConcurrentHashMapimport org.bigbluebutton.conference.service.archive.playback.*import org.bigbluebutton.conference.service.archive.record.*
import org.bigbluebutton.conference.service.archive.record.IRecorderimport org.bigbluebutton.conference.service.archive.record.FileRecorderimport org.bigbluebutton.conference.service.archive.playback.IPlaybackNotifierimport org.bigbluebutton.conference.service.archive.playback.PlaybackSessionimport org.bigbluebutton.conference.service.archive.playback.IPlaybackPlayerimport org.bigbluebutton.conference.service.archive.playback.FileReaderPlaybackPlayer
public class ArchiveApplication {
	protected static Logger log = LoggerFactory.getLogger( ArchiveApplication.class )
	
	private final Map<String, PlaybackSession> playbackSessions
	private final Map<String, RecordSession> recordSessions
	private final PlaybackJobScheduler playbackScheduler
	private final String recordingsDirectory
	
	public ArchiveApplication() {
		playbackSessions = new ConcurrentHashMap<String, PlaybackSession>()
		recordSessions = new ConcurrentHashMap<String, RecordSession>()
		log.debug("Instantiated ArchiveApplication")
	}
	
	public void destroyPlaybackSession(String sessionName) {
		PlaybackSession s = playbackSessions.remove(sessionName)
		/*
		 * ConcurrentHashMap returns null if sessionName is not found.
		 */
		if (s != null) {
			log.debug("Removed playback session $sessionName")
		} else {
			log.debug("Could not find playback session $sessionName")
		}
	}

	/**
	 * Creates a playback session if there wasn't one created already.
	 */
	public void createPlaybackSession(String conference, String room, String sessionName) {
		log.debug("Looking for playback session for $conference $room $sessionName")
		PlaybackSession session
		IPlaybackPlayer player
		def createdSession = false
		synchronized (this) {
			/**
			 * Could not use putIfAbsent because we need to know if session was
			 * added because there wasn't one created yet and be able to
			 * add a playback player.
			 */
			if (! playbackSessions.containsKey(sessionName)) {
				log.debug("Could not find session...creating one $sessionName}")
				session = new PlaybackSession(sessionName)
				playbackSessions.put(session.name, session)
				createdSession = true
				log.debug("Created playback session $session.name")
			} else {
				log.debug("Found session...not creating one $sessionName")
			}
		}
		if (createdSession) {
			player = new FileReaderPlaybackPlayer(conference, room)
			player.setRecordingsBaseDirectory(recordingsDirectory)
			session.setPlaybackPlayer(player)						
		}else {
			log.debug("Not creating playback session ${session.name}")
		}
	}
	
	public void destroyRecordSession(String sessionName) {
		RecordSession s = recordSessions.remove(sessionName)
		/*
		 * ConcurrentHashMap returns null if sessionName is not found.
		 */
		if (s != null) {
			log.debug("Removed record session")
		} else {
			log.debug("Could not find record session $sessionName")
		}
	}
	
	/**
	 * Creates a record session if there wasn't one created already.
	 */
	public void createRecordSession(String conference, String room, String sessionName) {
		RecordSession session
		IRecorder recorder
		def createdSession = false
		log.debug("Trying to create a record session for $sessionName")
		synchronized (this) {
			log.debug("Checking if record session $sessionName is already present.")
			if (recordSessions == null) {
				log.debug("record session is null")
			} else {
				log.debug("record session is NOT null")
			}
			
			if (! recordSessions.containsKey(sessionName)) {
				log.debug("Creating file recorder for $conference $room")
				recorder = new FileRecorder(conference, room)
				log.debug("Creating record session for $sessionName")
				session = new RecordSession(conference, room)
				log.debug("Adding record session $sessionName to record sessions")
				recordSessions.put(session.getName(), session)	
				log.debug("Setting recorder to record session $sessionName")
				session.setRecorder(recorder)
				createdSession = true
				log.debug("Created record session ${session.name}")
			} else {
				log.debug("Not creating record session")
			}
		}
		if (createdSession) {			
			recorder.setRecordingsDirectory(recordingsDirectory)
			recorder.initialize()
		}		
	}
	
	public void addEventRecorder(String sessionName, IEventRecorder recorder) {
		if (recordSessions.containsKey(sessionName)) {
			log.debug("Adding event recorder to session $sessionName.")
			RecordSession session = recordSessions.get(sessionName)
			session.addEventRecorder(recorder)
		} else {
			log.debug("Not adding event recorder to session $sessionName.")
		}
	}
	
	public void addPlaybackNotifier(String sessionName, IPlaybackNotifier notifier) {
		if (playbackSessions.containsKey(sessionName)) {
			PlaybackSession session = playbackSessions.get(sessionName)
			session.addPlaybackNotifier(notifier.notifierName(), notifier)
		}
	}
	
	public void startPlayback(String name) {
		PlaybackSession session = playbackSessions.get(name)
		if (session != null) {
			log.debug("Found playback session $name")
			// Initialize the session.
			session.startPlayback()
			log.debug("Scheduling playback session $name")
			playbackScheduler.schedulePlayback(session)			
		} else {
			log.debug("Did not find playback session $name")
		}
	}
	
	public void stopPlayback(String name) {
		PlaybackSession session = playbackSessions.get(name)
		if (session != null) {
			session.stopPlayback()	
		}
	}
	
	public void pausePlayback(String name) {
		PlaybackSession session = playbackSessions.get(name)
		if (session != null) {
			session.pausePlayback()	
		}
	}
	
	public void resumePlayback(String name) {
		PlaybackSession session = playbackSessions.get(name)
		if (session != null) {
			session.resumePlayback()	
			playbackScheduler.schedulePlayback(session)
		}
	}
	
	public void setPlaybackJobScheduler(PlaybackJobScheduler scheduler) {
		log.debug("Setting playbackScheduler")
		playbackScheduler = scheduler
		playbackScheduler.start()
	}
	
	public void setRecordingsDirectory(String directory) {
		log.debug("Setting recordings directory to $directory")
		this.recordingsDirectory = directory
	}
}
