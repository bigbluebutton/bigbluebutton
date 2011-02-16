package org.bigbluebutton.api;

import org.bigbluebutton.api.domain.DynamicConference;

public interface IRedisDispatcher {
	public void createConferenceRecord(DynamicConference conf, String redisHost, int redisPort);
}
