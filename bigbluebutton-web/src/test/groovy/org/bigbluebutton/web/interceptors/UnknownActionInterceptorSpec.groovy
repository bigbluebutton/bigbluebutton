package org.bigbluebutton.web.interceptors

import grails.core.GrailsControllerClass
import grails.testing.web.interceptor.InterceptorUnitTest
import org.bigbluebutton.web.controllers.ApiController
import org.bigbluebutton.web.controllers.ConnectionController
import org.bigbluebutton.web.controllers.PresentationController
import org.bigbluebutton.web.controllers.RecordingController
import org.grails.core.artefact.ControllerArtefactHandler
import spock.lang.Specification
import spock.lang.Unroll

/**
 * Coverage for `UnknownActionInterceptor`: a URL that names a controller but none of its
 * actions answers 404, and every request that names a real action is let through.
 */
class UnknownActionInterceptorSpec extends Specification implements InterceptorUnitTest<UnknownActionInterceptor> {

  def setup() {
    [ApiController, ConnectionController, PresentationController, RecordingController].each { Class controller ->
      ((GrailsControllerClass) grailsApplication.addArtefact(ControllerArtefactHandler.TYPE, controller)).initialize()
    }
  }

  /** What the URL mapping sets on the request before the interceptors run. */
  private void requestFor(String controller, String action) {
    webRequest.controllerName = controller
    webRequest.actionName = action
  }

  def "The interceptor applies to every controller"() {
    when:
    withRequest(controller: controller)

    then:
    interceptor.doesMatch()

    where:
    controller << ['api', 'presentation', 'recording', 'connection', 'error']
  }

  @Unroll
  def "#controller with action #action answers 404"() {
    given:
    requestFor(controller, action)
    request.requestURI = "/bigbluebutton/$controller"

    expect:
    !interceptor.before()
    response.status == 404
    response.contentType.startsWith('application/json')
    response.json.status == 404
    response.json.error == 'Not Found'
    response.json.path == "/bigbluebutton/$controller"

    where:
    controller     | action
    'presentation' | null
    'recording'    | null
    'connection'   | null
    'presentation' | 'index'
    'presentation' | 'noSuchAction'
  }

  @Unroll
  def "#controller with action #action is let through"() {
    given:
    requestFor(controller, action)

    expect:
    interceptor.before()
    response.status == 200

    where:
    controller     | action
    'api'          | null
    'api'          | 'index'
    'api'          | 'create'
    'presentation' | 'checkPresentationBeforeUploading'
    'presentation' | 'upload'
    'recording'    | 'getRecordingsHandler'
    'connection'   | 'checkAuthorization'
  }

  def "A name that is not a controller is left to the URL mappings"() {
    given:
    requestFor('noSuchController', null)

    expect:
    interceptor.before()
    response.status == 200
  }

  def "A request that names no controller is let through"() {
    expect:
    interceptor.before()
    response.status == 200
  }
}
