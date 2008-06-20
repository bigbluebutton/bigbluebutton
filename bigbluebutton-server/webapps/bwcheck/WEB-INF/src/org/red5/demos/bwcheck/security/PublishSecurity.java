package org.red5.demos.bwcheck.security;

import org.red5.server.api.IScope;
import org.red5.server.api.stream.IStreamPublishSecurity;

/**
 *
 * @author The Red5 Project (red5@osflash.org)
 * @author Dan Rossi
 */
public class PublishSecurity implements IStreamPublishSecurity {
    
	public boolean isPublishAllowed(IScope scope, String name, String mode) {
		return false;
    }
    
}