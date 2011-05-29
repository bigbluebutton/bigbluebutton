package org.bigbluebutton.web.controllers

import grails.test.*
import org.bigbluebutton.web.services.DynamicConferenceService;

class ApiControllerTests extends ControllerUnitTestCase {
    protected void setUp() {
        super.setUp()
    }

    protected void tearDown() {
        super.tearDown()
    }

    void testIndex() {
		ApiController controller = new ApiController()
		def service = mockFor(DynamicConferenceService)
		service.demand.apiVersion(1..1) { -> return 1 }
		controller.setDynamicConferenceService(service.createMock())		
		controller.index()
		println "controller response = " + controller.response.contentAsString
    }
	
	void testCreateAPI() {
		ApiController controller = new ApiController()
		def service = mockFor(DynamicConferenceService)
		service.demand.apiVersion(1..1) { -> return 1 }
		controller.setDynamicConferenceService(service.createMock())
		controller.create()
		println "controller response = " + controller.response.contentAsString
	}
	
}