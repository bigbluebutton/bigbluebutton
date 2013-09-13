/**
* BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
* 
* Copyright (c) 2012 BigBlueButton Inc. and by respective authors (see below).
*
* This program is free software; you can redistribute it and/or modify it under the
* terms of the GNU Lesser General Public License as published by the Free Software
* Foundation; either version 3.0 of the License, or (at your option) any later
* version.
* 
* BigBlueButton is distributed in the hope that it will be useful, but WITHOUT ANY
* WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
* PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
*
* You should have received a copy of the GNU Lesser General Public License along
* with BigBlueButton; if not, see <http://www.gnu.org/licenses/>.
*
*/
package org.bigbluebutton.voiceconf.sip;

import java.util.Enumeration;

import org.zoolu.sdp.MediaDescriptor;
import org.zoolu.sdp.MediaField;
import org.zoolu.sdp.SessionDescriptor;
import org.zoolu.tools.Parser;

public class SessionDescriptorUtil {
	public static int getLocalAudioPort(SessionDescriptor localSdp) {
        int localAudioPort = 0;
        
        for (Enumeration e = localSdp.getMediaDescriptors().elements(); e.hasMoreElements();) {
            MediaField media = ((MediaDescriptor) e.nextElement()).getMedia();
            if (media.getMedia().equals("audio")) {
                localAudioPort = media.getPort();
            }
        }
        
        return localAudioPort;
    }
    
	public static int getRemoteAudioPort(SessionDescriptor remoteSdp) {
    	int remoteAudioPort = 0;

        for (Enumeration e = remoteSdp.getMediaDescriptors().elements(); e.hasMoreElements();) {
            MediaDescriptor descriptor = (MediaDescriptor) e.nextElement();
            MediaField media = descriptor.getMedia();

            if (media.getMedia().equals("audio")) {
                remoteAudioPort = media.getPort();
            }
        }
        
        return remoteAudioPort;
    }
	
	public static String getRemoteMediaAddress(SessionDescriptor remoteSdp) {
		return (new Parser(remoteSdp.getConnection().toString())).skipString().skipString().getString();
	}
}
