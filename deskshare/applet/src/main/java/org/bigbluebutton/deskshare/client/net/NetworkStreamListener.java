package org.bigbluebutton.deskshare.client.net;

import org.bigbluebutton.deskshare.client.ExitCode;

public interface NetworkStreamListener {

	public void networkException(int id, ExitCode reason);
}
