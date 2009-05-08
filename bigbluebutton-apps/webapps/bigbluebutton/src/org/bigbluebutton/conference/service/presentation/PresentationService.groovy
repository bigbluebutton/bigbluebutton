package org.bigbluebutton.conference.service.presentation
import org.slf4j.Loggerimport org.slf4j.LoggerFactory
import org.red5.logging.Red5LoggerFactory
import org.red5.server.api.Red5
import org.red5.server.api.IScopeimport org.bigbluebutton.conference.service.participants.ParticipantsApplication

public class PresentationService {
	
	private static Logger log = Red5LoggerFactory.getLogger( PresentationService.class, "bigbluebutton" );
	
	private ParticipantsApplication participantsApplication
	private PresentationApplication presentationApplication

	def assignPresenter(userid, name, assignedBy) {
		log.debug("assignPresenter $userid $name $assignedBy")
		IScope scope = Red5.connectionLocal.scope
		def presenter = [userid, name, assignedBy]
		def curPresenter = presentationApplication.getCurrentPresenter(scope.name)
		participantsApplication.setParticipantStatus(scope.name, userid.toLong(), "presenter", true)
		if (curPresenter != null && (curPresenter[0] != userid)) {
			log.debug("Changing presenter from ${curPresenter[0]} to $userid")
			participantsApplication.setParticipantStatus(scope.name, curPresenter[0].toLong(), "presenter", false)
		}
		presentationApplication.assignPresenter(scope.name, presenter)
	}
	
	def getPresentationInfo() {
		log.debug("Getting presentation information.")
		IScope scope = Red5.connectionLocal.scope
		def curPresenter = presentationApplication.getCurrentPresenter(scope.name)
		def curSlide = presentationApplication.getCurrentSlide(scope.name)
		def isSharing = presentationApplication.getSharingPresentation(scope.name)
		def currentPresentation = presentationApplication.getCurrentPresentation(scope.name)
		
		Map presenter = new HashMap()		
		if (curPresenter != null) {
			presenter.put('hasPresenter', true)
			presenter.put('user', curPresenter[0])
			presenter.put('name', curPresenter[1])
			presenter.put('assignedBy',curPresenter[2] )
			log.debug("Presenter: ${curPresenter[0]} ${curPresenter[1]} ${curPresenter[2]}")
		} else {
			presenter.put('hasPresenter', false)
		}
				
		Map presentation = new HashMap()
		if (isSharing) {
			presentation.put('sharing', true)
			presentation.put('slide', curSlide)
			presentation.put('currentPresentation', currentPresentation)
			log.debug("Presentation: presentation= $currentPresentation slide= $curSlide")
		} else {
			presentation.put('sharing', false)
		}
		
		Map presentationInfo = new HashMap()
		presentationInfo.put('presenter', presenter)
		presentationInfo.put('presentation', presentation)
		
		log.info("getPresentationInfo::service - Sending presentation information...");
		return presentationInfo
	}
	
	public void gotoSlide(slideNum) {
		log.debug("Request to go to slide $slideNum")
		IScope scope = Red5.connectionLocal.scope
		presentationApplication.gotoSlide(scope.name, slideNum)
	}
	
	public void sharePresentation(presentationName, share) {
		log.debug("Request to go to sharePresentation $presentationName $share")
		IScope scope = Red5.connectionLocal.scope
		presentationApplication.sharePresentation(scope.name, presentationName, share)
	}
	
	public void setParticipantsApplication(ParticipantsApplication a) {
		log.debug("Setting participants application")
		participantsApplication = a
	}
	
	public void setPresentationApplication(PresentationApplication a) {
		log.debug("Setting Presentation Applications")
		presentationApplication = a
	}
}
