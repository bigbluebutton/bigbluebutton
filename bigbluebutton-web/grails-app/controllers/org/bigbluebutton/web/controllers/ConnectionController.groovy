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

import groovy.json.JsonBuilder
import org.bigbluebutton.api.MeetingService
import org.bigbluebutton.api.domain.Meeting
import org.bigbluebutton.api.domain.UserSession
import org.bigbluebutton.api.domain.User
import org.bigbluebutton.api.domain.UserSessionBasicData
import org.bigbluebutton.api.util.ParamsUtil
import org.bigbluebutton.api.ParamsProcessorUtil
import java.nio.charset.StandardCharsets


class ConnectionController {
  MeetingService meetingService
  ParamsProcessorUtil paramsProcessorUtil

  def checkAuthorization = {
    try {
      def uri = request.getHeader("x-original-uri")
      def sessionToken = ParamsUtil.getSessionToken(uri)
      UserSession userSession = meetingService.getUserSessionWithSessionToken(sessionToken)
      Boolean allowRequestsWithoutSession = meetingService.getAllowRequestsWithoutSession(sessionToken)
      Boolean isSessionTokenInvalid = !session[sessionToken] && !allowRequestsWithoutSession

      response.addHeader("Cache-Control", "no-cache")
      response.contentType = 'plain/text'

      if (userSession != null && !isSessionTokenInvalid) {
        response.addHeader("User-Id", userSession.internalUserId)
        response.addHeader("Meeting-Id", userSession.meetingID)
        response.addHeader("Voice-Bridge", userSession.voicebridge )
        response.addHeader("User-Name", URLEncoder.encode(userSession.fullname, StandardCharsets.UTF_8.name()))
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

  def checkGraphqlAuthorization = {
    String sessionToken = ""

    try {
      /* the graphql connection in cluster setups is a CORS request. The OPTIONS
       * call is done as a preflight quest by the browser and does not contain
       * secrets. The Access-Allow-Origin Header is added by Grails. This is just
       * the auth_request endpoint called by nginx to check authorization.
       */
      if (request.getHeader("x-original-method") == 'OPTIONS') {
          log.debug "OPTIONS SUCCESS \n"
          response.setStatus(200)
          response.addHeader("Cache-Control", "no-cache")
          response.contentType = 'plain/text'
          response.outputStream << 'graphql-success';
          return;
      }
      sessionToken = request.getHeader("x-session-token")

      UserSession userSession = meetingService.getUserSessionWithSessionToken(sessionToken)
      Boolean allowRequestsWithoutSession = meetingService.getAllowRequestsWithoutSession(sessionToken)
      Boolean isSessionTokenValid = session[sessionToken] != null || allowRequestsWithoutSession

      response.addHeader("Cache-Control", "no-cache")

      if (userSession != null && isSessionTokenValid) {
        Meeting m = meetingService.getMeeting(userSession.meetingID)
        User u
        if(m) {
          u = m.getUserById(userSession.internalUserId)
        }

        response.addHeader("Meeting-Id", userSession.meetingID)
        response.addHeader("Meeting-External-Id", userSession.externMeetingID)
        response.addHeader("User-Id", userSession.internalUserId)
        response.addHeader("User-External-Id", userSession.externUserID)
        response.addHeader("User-Name", URLEncoder.encode(userSession.fullname, StandardCharsets.UTF_8.name()))
        response.addHeader("User-Is-Moderator", u && u.isModerator() ? "true" : "false")
        response.addHeader("User-Is-Presenter", u && u.isPresenter() ? "true" : "false")
        response.setStatus(200)
        withFormat {
          json {
            def builder = new JsonBuilder()
            builder {
              "response" "authorized"
              "X-Currently-Online" m && u && !u.hasLeft() ? "true" : "false"
              "X-Moderator" u && u.isModerator() ? "true" : "false"
              "X-Presenter" u && u.isPresenter() ? "true" : "false"
              "X-UserId" userSession.internalUserId
              "X-MeetingId" userSession.meetingID
            }
            render(contentType: "application/json", text: builder.toPrettyString())
          }
        }
      } else if(isSessionTokenValid) {
        UserSessionBasicData removedUserSession = meetingService.getRemovedUserSessionWithSessionToken(sessionToken)
        if(removedUserSession) {
          response.addHeader("Meeting-Id", removedUserSession.meetingId)
          response.addHeader("Meeting-External-Id", removedUserSession.extMeetingId)
          response.addHeader("User-Id", removedUserSession.userId)
          response.addHeader("User-External-Id", removedUserSession.extUserId)
          response.addHeader("User-Name", URLEncoder.encode(removedUserSession.userFullName, StandardCharsets.UTF_8.name()))
          response.addHeader("User-Is-Moderator", removedUserSession.isModerator() ? "true" : "false")
          response.addHeader("User-Is-Presenter", "false")
          response.setStatus(200)
          withFormat {
            json {
              def builder = new JsonBuilder()
              builder {
                "response" "authorized"
                "X-Currently-Online" "false"
                "X-Moderator" removedUserSession.isModerator()  ? "true" : "false"
                "X-Presenter" "false"
                "X-UserId" removedUserSession.userId
                "X-MeetingId" removedUserSession.meetingId
              }
              render(contentType: "application/json", text: builder.toPrettyString())
            }
          }
        } else {
          throw new Exception("Invalid User Session")
        }
      } else {
        throw new Exception("Invalid sessionToken")
      }
    } catch (Exception e) {
      log.debug("Error while authenticating graphql connection {"+sessionToken+"}: " + e.getMessage())
      response.setStatus(401)
      withFormat {
        json {
          def builder = new JsonBuilder()
          builder {
            "response" "unauthorized"
          }
          render(contentType: "application/json", text: builder.toPrettyString())
        }
      }
    }
  }

  def legacyCheckAuthorization = {
    try {
      def uri = request.getHeader("x-original-uri")
      def sessionToken = ParamsUtil.getSessionToken(uri)
      UserSession userSession = meetingService.getUserSessionWithSessionToken(sessionToken)

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
