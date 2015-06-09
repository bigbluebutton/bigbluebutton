package org.bigbluebutton.core.pubsub.receivers;

public class PreuploadedPresentation {

	public final String id;
	public final int numPages;
	
	public PreuploadedPresentation(String id, int numPages) {
		this.id = id;
		this.numPages = numPages;
	}
}
