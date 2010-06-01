package org.bigbluebutton.deskshare.client.net;

import org.bigbluebutton.deskshare.client.ExitCode;

public interface NetworkConnectionListener {

	public void networkConnectionException(ExitCode reason);
}
