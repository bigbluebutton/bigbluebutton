package org.bigbluebutton.api.meeting

object GenericResponse {

  case class SuccessResponse(messageKey: String, msg: String) {
    def toXml: xml.Elem = <response>
                            <returncode>SUCCESS</returncode>
                            <messageKey>{ messageKey }</messageKey>
                            <message>{ msg }</message>
                          </response>
  }

  case class FailedResponse(messageKey: String, msg: String) {
    def toXml: xml.Elem = <response>
                            <returncode>FAILED</returncode>
                            <messageKey>{ messageKey }</messageKey>
                            <message>{ msg }</message>
                          </response>
  }

}
