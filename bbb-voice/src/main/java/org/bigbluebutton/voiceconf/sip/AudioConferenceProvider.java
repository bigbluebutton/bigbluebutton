package org.bigbluebutton.voiceconf.sip;

public class AudioConferenceProvider {
	private final String host;
	private final int sipPort;
	private final int startAudioPort;
	private final int stopAudioPort;
	private int curAvailablePort;
	
	public AudioConferenceProvider(String host, int sipPort, int startAudioPort, int stopAudioPort) {
		this.host = host;
		this.sipPort = sipPort;
		this.startAudioPort = startAudioPort;
		this.stopAudioPort = stopAudioPort;
		curAvailablePort = startAudioPort;
	}
	
	public int getFreeAudioPort() {
    	synchronized(this) {
        	int availablePort = curAvailablePort;
        	curAvailablePort++;
    		if (curAvailablePort > stopAudioPort) curAvailablePort = startAudioPort;    
    		return availablePort;
    	}
    }
	
	public String getHost() {
		return host;
	}
	
	public int getStartAudioPort() {
		return startAudioPort;
	}
}
