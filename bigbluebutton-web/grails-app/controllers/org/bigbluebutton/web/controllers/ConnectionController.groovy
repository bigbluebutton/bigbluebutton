/**
* BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
*
* Copyright (c) 2019 BigBlueButton Inc. and by respective authors (see below).
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
package org.bigbluebutton.web.controllers

import org.bigbluebutton.api.MeetingService
import org.bigbluebutton.api.domain.UserSession
import org.bigbluebutton.api.util.ParamsUtil

class ConnectionController {
  MeetingService meetingService

  def checkAuthorization = {
    try {
      def uri = request.getHeader("x-original-uri")
      def sessionToken = ParamsUtil.getSessionToken(uri)
      UserSession userSession = meetingService.getUserSessionWithAuthToken(sessionToken)

      response.addHeader("Cache-Control", "no-cache")
      response.contentType = 'plain/text'
      if (userSession != null) {
        response.setStatus(200)
        response.outputStream << 'authorized'
      } else {
        response.setStatus(401)
        response.outputStream << 'unauthorized'
      }
    } catch (IOException e) {
      log.error("Error while authenticating connection.\n" + e.getMessage())
    }
  }
}
