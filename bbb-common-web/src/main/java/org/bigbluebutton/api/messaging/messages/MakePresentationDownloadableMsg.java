package org.bigbluebutton.api.messaging.messages;

public class MakePresentationDownloadableMsg implements IMessage {
	public final String meetingId;
	public final String presId;
	public final String presFilename;
	public final Boolean downloadable;
	public final String downloadableExtension;

	public MakePresentationDownloadableMsg(String meetingId, String presId, String presFilename,
										   Boolean downloadable, String downloadableExtension) {
		this.meetingId = meetingId;
		this.presId = presId;
		this.presFilename = presFilename;
		this.downloadable = downloadable;
		this.downloadableExtension = downloadableExtension;
	}
}
