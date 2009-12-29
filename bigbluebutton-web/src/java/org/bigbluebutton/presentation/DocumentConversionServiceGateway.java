package org.bigbluebutton.presentation;

public class DocumentConversionServiceGateway {

	private DocumentConversionService documentConversionService;
	private PresentationService presentationService;
	
	public void convertDocument(UploadedPresentation pres) {
		documentConversionService.processDocument(pres);
	}
	
	public void setDocumentConversionService(
			DocumentConversionService documentConversionService) {
		this.documentConversionService = documentConversionService;
	}
	
	public void setPresentationService(PresentationService presentationService) {
		this.presentationService = presentationService;
		System.out.println("Setting PresentationService");
		presentationService.setDocumentConversionServiceGateway(this);
	}
}
