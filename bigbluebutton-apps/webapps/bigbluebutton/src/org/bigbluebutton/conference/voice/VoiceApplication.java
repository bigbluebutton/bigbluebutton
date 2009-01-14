package org.bigbluebutton.conference.voice;

import org.red5.server.adapter.ApplicationAdapter;
import org.red5.server.adapter.IApplication;
import org.red5.server.api.IClient;
import org.red5.server.api.IConnection;
import org.red5.server.api.IScope;
import org.red5.server.api.listeners.IConnectionListener;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class VoiceApplication implements IApplication,
		IConnectionListener {

	protected static Logger log = LoggerFactory.getLogger( VoiceApplication.class );
	
	private ApplicationAdapter application;
	private RoomManager roomManager;
	private IVoiceConferenceService voiceService;
	
	@Override
	public boolean appConnect(IConnection arg0, Object[] arg1) {
		// TODO Auto-generated method stub
		return false;
	}

	@Override
	public void appDisconnect(IConnection arg0) {
		// TODO Auto-generated method stub

	}

	@Override
	public boolean appJoin(IClient arg0, IScope arg1) {
		// TODO Auto-generated method stub
		return false;
	}

	@Override
	public void appLeave(IClient arg0, IScope arg1) {
		// TODO Auto-generated method stub

	}

	@Override
	public boolean appStart(IScope scope) {
		voiceService.start();
		return true;
	}

	@Override
	public void appStop(IScope scope) {
		voiceService.stop();
	}

	@Override
	public boolean roomConnect(IConnection connection, Object[] params) {
		// TODO Auto-generated method stub
		return false;
	}

	@Override
	public void roomDisconnect(IConnection connection) {
		// TODO Auto-generated method stub

	}

	@Override
	public boolean roomJoin(IClient client, IScope scope) {
		// TODO Auto-generated method stub
		return false;
	}

	@Override
	public void roomLeave(IClient client, IScope scope) {
		// TODO Auto-generated method stub

	}

	@Override
	public boolean roomStart(IScope scope) {
//		voiceService.getRoom(scope.getName());
		application.hasSharedObject(scope, "meetmeusersSO");
		return false;
	}

	@Override
	public void roomStop(IScope scope) {
//		voiceService.removeRoom(scope.getName());
	}

	@Override
	public void notifyConnected(IConnection connection) {
		// TODO Auto-generated method stub

	}

	@Override
	public void notifyDisconnected(IConnection connection) {
		// TODO Auto-generated method stub

	}

	public ApplicationAdapter getApplication() {
		return application;
	}

	public void setApplication(ApplicationAdapter application) {
		this.application = application;
	}

	public RoomManager getRoomManager() {
		return roomManager;
	}

	public void setRoomManager(RoomManager roomManager) {
		this.roomManager = roomManager;
	}

	public IVoiceConferenceService getVoiceService() {
		return voiceService;
	}

	public void setVoiceService(IVoiceConferenceService voiceService) {
		this.voiceService = voiceService;
	}
}
