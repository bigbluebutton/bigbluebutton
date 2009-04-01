
package org.bigbluebutton.conference.service.presentation

import org.red5.server.adapter.IApplication
import org.red5.server.api.IClient
import org.red5.server.api.IConnection
import org.red5.server.api.IScope
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.red5.server.api.so.ISharedObject
import org.red5.server.adapter.ApplicationAdapter
import org.red5.server.api.Red5import org.bigbluebutton.conference.BigBlueButtonSessionimport org.bigbluebutton.conference.Constantsimport org.bigbluebutton.conference.service.archive.ArchiveApplication
public class PresentationHandler extends ApplicationAdapter implements IApplication{
	protected static Logger log = LoggerFactory.getLogger( PresentationHandler.class )

	private static final String PRESENTATION = "PRESENTATION"
	private static final String PRESENTATION_SO = "presentationSO"   
	private static final String APP = "PRESENTATION"

	private ArchiveApplication archiveApplication
	private PresentationApplication presentationApplication
	private ConversionUpdatesService conversionUpdatesService
	
	@Override
	public boolean appConnect(IConnection conn, Object[] params) {
		log.debug("${APP}:appConnect")
		return true
	}

	@Override
	public void appDisconnect(IConnection conn) {
		log.debug( "${APP}:appDisconnect")
	}

	@Override
	public boolean appJoin(IClient client, IScope scope) {
		log.debug( "${APP}:appJoin ${scope.name}")
		return true
	}

	@Override
	public void appLeave(IClient client, IScope scope) {
		log.debug("${APP}:appLeave ${scope.name}")

	}

	@Override
	public boolean appStart(IScope scope) {
		log.debug("${APP}:appStart ${scope.name}")
		conversionUpdatesService.start()
		return true;
	}

	@Override
	public void appStop(IScope scope) {
		log.debug("${APP}:appStop ${scope.name}")
		conversionUpdatesService.stop()
	}

	@Override
	public boolean roomConnect(IConnection connection, Object[] params) {
		log.debug("${APP}:roomConnect")
		if (getBbbSession().playbackMode()) {
			log.debug("In playback mode")
			ISharedObject so = getSharedObject(connection.scope, PRESENTATION_SO)
			PresentationPlaybackNotifier notifier = new PresentationPlaybackNotifier(so)
			archiveApplication.addPlaybackNotifier(connection.scope.name, notifier)
		} else {
			log.debug("In live mode")
			ISharedObject so = getSharedObject(connection.scope, PRESENTATION_SO)
			log.debug("Setting up recorder")
			PresentationEventRecorder recorder = new PresentationEventRecorder(so)
			log.debug("adding event recorder to ${connection.scope.name}")
			archiveApplication.addEventRecorder(connection.scope.name, recorder)
			log.debug("Adding room listener")
    		presentationApplication.addRoomListener(connection.scope.name, recorder)
    		log.debug("Done setting up recorder and listener")
		}
    	return true;
	}

	@Override
	public void roomDisconnect(IConnection connection) {
		log.debug("${APP}:roomDisconnect")

	}

	@Override
	public boolean roomJoin(IClient client, IScope scope) {
		log.debug("${APP}:roomJoin ${scope.name} - ${scope.parent.name}")
		return true;
	}

	@Override
	public void roomLeave(IClient client, IScope scope) {
		log.debug("${APP}:roomLeave ${scope.name}")
	}

	@Override
	public boolean roomStart(IScope scope) {
		log.debug("${APP} - roomStart ${scope.name}")
		presentationApplication.createRoom(scope.name)
    	if (!hasSharedObject(scope, PRESENTATION_SO)) {
    		if (createSharedObject(scope, PRESENTATION_SO, false)) {    			
    			return true 			
    		}    		
    	}  	
		log.error("Failed to start room ${scope.name}")
    	return false;
	}

	@Override
	public void roomStop(IScope scope) {
		log.debug("${APP}:roomStop ${scope.name}")
		presentationApplication.destroyRoom(scope.name)
		if (!hasSharedObject(scope, PRESENTATION_SO)) {
    		clearSharedObjects(scope, PRESENTATION_SO)
    	}
	}
	
	public void setPresentationApplication(PresentationApplication a) {
		log.debug("Setting presentation application")
		presentationApplication = a
	}
	
	public void setArchiveApplication(ArchiveApplication a) {
		log.debug("Setting archive application")
		archiveApplication = a
	}
	
	public void setConversionUpdatesService(ConversionUpdatesService service) {
		log.debug("Setting conversionUpdatesService")
		conversionUpdatesService = service
	}
	
	private BigBlueButtonSession getBbbSession() {
		return Red5.connectionLocal.getAttribute(Constants.SESSION)
	}
}
