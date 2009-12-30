package org.bigbluebutton.presentation.imp;

import java.util.HashMap;
import java.util.Map;
import org.bigbluebutton.presentation.ConversionProgressNotifier;
import org.bigbluebutton.presentation.GeneratedSlidesInfoHelper;
import org.bigbluebutton.presentation.UploadedPresentation;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class SwfSlidesGenerationProgressNotifier {
	private static Logger log = LoggerFactory.getLogger(SwfSlidesGenerationProgressNotifier.class);
	
	private ConversionProgressNotifier notifier;
	private GeneratedSlidesInfoHelper generatedSlidesInfoHelper;
			
	private void notifyProgressListener(Map<String, Object> msg) {		
		if (notifier != null) {
			notifier.sendConversionProgress(msg);	
		} else {
			log.warn("ConversionProgressNotifier has not been set");
		}
	}

	public void sendConversionUpdateMessage(int slidesCompleted, UploadedPresentation pres) {
		Map<String, Object> msg = new HashMap<String, Object>();
		msg.put("conference", pres.getConference());
		msg.put("room", pres.getRoom());
		msg.put("returnCode", "CONVERT");
		msg.put("presentationName", pres.getName());
		msg.put("totalSlides", new Integer(pres.getNumberOfPages()));
		msg.put("slidesCompleted", new Integer(slidesCompleted));
		notifyProgressListener(msg);
	}
	
	public void sendCreatingThumbnailsUpdateMessage(UploadedPresentation pres) {
		Map<String, Object> msg = new HashMap<String, Object>();
		msg.put("conference", pres.getConference());
		msg.put("room", pres.getRoom());
		msg.put("returnCode", "THUMBNAILS");
		msg.put("presentationName", pres.getName());
		
		notifyProgressListener(msg);			
	}
	
	public void sendConversionCompletedMessage(UploadedPresentation pres) {	
		if (generatedSlidesInfoHelper == null) {
			log.error("GeneratedSlidesInfoHelper was not set. Could not notify interested listeners.");
			return;
		}
		String xml = generatedSlidesInfoHelper.generateUploadedPresentationInfo(pres);
		
		Map<String, Object> msg = new HashMap<String, Object>();
		msg.put("conference", pres.getConference());
		msg.put("room", pres.getRoom());
		msg.put("returnCode", "SUCCESS");
		msg.put("presentationName", pres.getName());
		msg.put("message", xml);
		notifyProgressListener(msg);	
	}
			
	public void setConversionProgressNotifier(ConversionProgressNotifier notifier) {
		this.notifier = notifier;
	}
	
	public void setGeneratedSlidesInfoHelper(GeneratedSlidesInfoHelper helper) {
		generatedSlidesInfoHelper = helper;
	}
}
