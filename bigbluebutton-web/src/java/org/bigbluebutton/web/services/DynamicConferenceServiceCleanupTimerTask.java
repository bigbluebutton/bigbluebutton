package org.bigbluebutton.web.services;

import java.util.TimerTask;

public class DynamicConferenceServiceCleanupTimerTask extends TimerTask {

	private final IDynamicConferenceService service;
	
	public DynamicConferenceServiceCleanupTimerTask(IDynamicConferenceService svc) {
		this.service = svc;
	}
	
	@Override
	public void run() {
		service.cleanupOldConferences();
	}

}
