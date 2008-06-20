package org.red5.demos.bwcheck.security;

import org.red5.server.api.IScope;
import org.red5.server.api.stream.IStreamPlaybackSecurity;

/**
 *
 * @author The Red5 Project (red5@osflash.org)
 * @author Dan Rossi
 */
public class PlaybackSecurity implements IStreamPlaybackSecurity {
	
	public boolean isPlaybackAllowed(IScope scope, String name, int start, int length, boolean flushPlaylist) {
		return false;
	}
  
}

