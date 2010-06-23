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
