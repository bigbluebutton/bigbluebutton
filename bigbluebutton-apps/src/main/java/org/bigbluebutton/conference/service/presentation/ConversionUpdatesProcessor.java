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
package org.bigbluebutton.conference.service.presentation;

import org.slf4j.Logger;
import org.red5.logging.Red5LoggerFactory;
public class ConversionUpdatesProcessor {
	private static Logger log = Red5LoggerFactory.getLogger(ConversionUpdatesProcessor.class, "bigbluebutton");

	private PresentationApplication presentationApplication;
	
	public void sendConversionUpdate(String messageKey, String conference, 
                      String code, String presentationId) {
		presentationApplication.sendConversionUpdate(messageKey, conference,
              code, presentationId);
    }
	
	public void sendPageCountError(String messageKey, String conference, 
            String code, String presentationId, int numberOfPages,
            int maxNumberPages) {
		presentationApplication.sendPageCountError(messageKey, conference, 
	            code, presentationId, numberOfPages,
	            maxNumberPages);
	}
	
	public void sendSlideGenerated(String messageKey, String conference, 
            String code, String presentationId, int numberOfPages,
            int pagesCompleted) {
		presentationApplication.sendSlideGenerated(messageKey, conference, 
	            code, presentationId, numberOfPages, pagesCompleted);
	}
	
	public void sendConversionCompleted(String messageKey, String conference, 
            String code, String presentation, String slidesInfo) {
		presentationApplication.sendConversionCompleted(messageKey, conference, 
	            code, presentation, slidesInfo);
	}
	
	public void setPresentationApplication(PresentationApplication a) {
		presentationApplication = a;
	}	
}
