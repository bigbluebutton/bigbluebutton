package org.bigbluebutton.web.interceptors

import grails.core.GrailsControllerClass
import groovy.json.JsonOutput
import org.grails.core.artefact.ControllerArtefactHandler

/**
 * A URL that names a controller without one of its actions, such as /bigbluebutton/presentation,
 * is not a resource: answer 404 instead of letting Grails invoke a default action the
 * controller does not have. The body is the one Spring Boot's error page gives an unknown
 * path; it is rendered here because a response committed from an interceptor never reaches
 * that page (sendError leaves it empty).
 */
class UnknownActionInterceptor {

  UnknownActionInterceptor() {
    matchAll()
  }

  boolean before() {
    GrailsControllerClass controllerClass = controllerName ? (GrailsControllerClass) grailsApplication
        .getArtefactByLogicalPropertyName(ControllerArtefactHandler.TYPE, controllerName) : null
    if (controllerClass == null || controllerClass.actions.contains(actionName ?: controllerClass.defaultAction)) {
      return true
    }
    render(status: 404, contentType: 'application/json', text: JsonOutput.toJson([
        timestamp: System.currentTimeMillis(),
        status   : 404,
        error    : 'Not Found',
        path     : request.forwardURI,
    ]))
    return false
  }
}
