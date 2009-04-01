
package org.bigbluebutton.conference.service.archive

import org.red5.server.adapter.IApplication
import org.red5.server.api.IClient
import org.red5.server.api.IConnection
import org.red5.server.api.IScope
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.red5.server.api.so.ISharedObject
import org.red5.server.adapter.ApplicationAdapter
import org.red5.server.api.Red5import java.util.Mapimport org.bigbluebutton.conference.RoomsManager
import org.bigbluebutton.conference.Roomimport org.bigbluebutton.conference.Participant
public class ArchiveService {

	protected static Logger log = LoggerFactory.getLogger( ArchiveService.class );	
	private ArchiveApplication application

	public void startPlayback(String name) {
		log.debug("Request to playback $name")
		assert application != null
		application.startPlayback(name)
	}
	
	public void stopPlayback(String name) {
		assert application != null
		application.stopPlayback(name)
	}
	
	public void pausePlayback(String name) {
		assert application != null
		application.pausePlayback(name)
	}
	
	public void resumePlayback(String name) {
		assert application != null
		application.resumePlayback(name)
	}
		
	public void setArchiveApplication(ArchiveApplication a) {
		log.debug("Setting archive Applications")
		application = a
	}
}
