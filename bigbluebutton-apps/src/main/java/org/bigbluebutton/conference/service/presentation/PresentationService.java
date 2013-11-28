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

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;
import org.slf4j.Logger;
import org.red5.logging.Red5LoggerFactory;
import org.red5.server.api.Red5;
import org.red5.server.api.scope.IScope;
import org.bigbluebutton.conference.service.participants.ParticipantsApplication;

public class PresentationService {	
	private static Logger log = Red5LoggerFactory.getLogger( PresentationService.class, "bigbluebutton" );
	
	private ParticipantsApplication participantsApplication;
	private PresentationApplication presentationApplication;

	public void removePresentation(String name) {
		log.debug("removePresentation " + name);
		IScope scope = Red5.getConnectionLocal().getScope();
		presentationApplication.removePresentation(scope.getName(), name);
	}
	
	@SuppressWarnings("unchecked")
	public Map<String, Object> getPresentationInfo() {
		log.debug("Getting presentation information.");
		IScope scope = Red5.getConnectionLocal().getScope();
		ArrayList<String> curPresenter = participantsApplication.getCurrentPresenter(scope.getName());
		int curSlide = presentationApplication.getCurrentSlide(scope.getName());
		Boolean isSharing = presentationApplication.getSharingPresentation(scope.getName());
		String currentPresentation = presentationApplication.getCurrentPresentation(scope.getName());
		Map<String, Object> presentersSettings = presentationApplication.getPresenterSettings(scope.getName());
		ArrayList<String> presentationNames = presentationApplication.getPresentations(scope.getName());
		
		Map<String, Object> presenter = new HashMap<String, Object>();		
		if (curPresenter != null) {
			presenter.put("hasPresenter", true);
			presenter.put("user", curPresenter.get(0));
			presenter.put("name", curPresenter.get(1));
			presenter.put("assignedBy",curPresenter.get(2));
			log.debug("Presenter: " + curPresenter.get(0) + " " + curPresenter.get(1) + " " + curPresenter.get(2));
		} else {
			presenter.put("hasPresenter", false);
		}
				
		Map<String, Object> presentation = new HashMap<String, Object>();
		if (isSharing.booleanValue()) {
			presentation.put("sharing", true);
			presentation.put("slide", curSlide);
			presentation.put("currentPresentation", currentPresentation);
			if (presentersSettings!=null) {
				presentation.put("xOffset", presentersSettings.get("xOffset"));
				presentation.put("yOffset", presentersSettings.get("yOffset"));
				presentation.put("widthRatio", presentersSettings.get("widthRatio"));
				presentation.put("heightRatio", presentersSettings.get("heightRatio"));
			}
			log.debug("Presentation: presentation=" + currentPresentation + " slide=" + curSlide);
		} else {
			presentation.put("sharing", false);
		}
		
		Map<String, Object> presentationInfo = new HashMap<String, Object>();
		presentationInfo.put("presenter", presenter);
		presentationInfo.put("presentation", presentation);
		presentationInfo.put("presentations", presentationNames);
		
		log.info("getPresentationInfo::service - Sending presentation information...");
		return presentationInfo;
	}

	@SuppressWarnings("unchecked")
	public Map<String, Object> getFileNames() {
		log.debug("Getting the downloadable file names.");
		IScope scope = Red5.getConnectionLocal().getScope();

		ArrayList<String> downloadableFileNames = presentationApplication.getFileNamesToDownload(scope.getName());

		Map<String, Object> fileNames = new HashMap<String, Object>();
		fileNames.put("fileNames", downloadableFileNames);

		log.info("getFileNames::service - Sending downloadable file names...");
		return fileNames;
		
	}
	
	public void gotoSlide(int slideNum) {
		log.debug("Request to go to slide " + slideNum);
		IScope scope = Red5.getConnectionLocal().getScope();
		presentationApplication.gotoSlide(scope.getName(), slideNum);
	}
	
	public void sharePresentation(String presentationName, Boolean share) {
		log.debug("Request to go to sharePresentation " + presentationName + " " + share);
		IScope scope = Red5.getConnectionLocal().getScope();
		presentationApplication.sharePresentation(scope.getName(), presentationName, share);
	}
	
	public void sendCursorUpdate(Double xPercent,Double yPercent) {
		log.debug("Request update cursor[" + xPercent + "," + yPercent + "]" );
		IScope scope = Red5.getConnectionLocal().getScope();
		presentationApplication.sendCursorUpdate(scope.getName(), xPercent, yPercent);
	}
	
	public void resizeAndMoveSlide(Double xOffset,Double yOffset,Double widthRatio,Double heightRatio) {
		log.debug("Request to resize and move slide[" + xOffset + "," + yOffset + "," + widthRatio + "," + heightRatio);
		IScope scope = Red5.getConnectionLocal().getScope();
		presentationApplication.resizeAndMoveSlide(scope.getName(), xOffset, yOffset, widthRatio, heightRatio);
	}

	public void setParticipantsApplication(ParticipantsApplication a) {
	    log.debug("Setting participants application");
	    participantsApplication = a;
	}
	
	public void setPresentationApplication(PresentationApplication a) {
		log.debug("Setting Presentation Applications");
		presentationApplication = a;
	}
}
