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
    try {
      if(!request.getHeader("User-Agent").startsWith('hasura-graphql-engine')) {
        throw new Exception("Invalid User Agent")
      }

      String sessionToken = request.getHeader("x-session-token")

      UserSession userSession = meetingService.getUserSessionWithSessionToken(sessionToken)
      Boolean allowRequestsWithoutSession = meetingService.getAllowRequestsWithoutSession(sessionToken)
      Boolean isSessionTokenInvalid = !session[sessionToken] && !allowRequestsWithoutSession

      response.addHeader("Cache-Control", "no-cache")

      if (userSession != null && !isSessionTokenInvalid) {
        Meeting m = meetingService.getMeeting(userSession.meetingID)
        User u
        if(m) {
          u = m.getUserById(userSession.internalUserId)
        }

        Boolean cursorLocked = false
        Boolean annotationsLocked = false
        Boolean userListLocked = false
        Boolean webcamOnlyForMod = false
        if(u && u.isLocked() && !u.isModerator()) {
          cursorLocked = m.lockSettingsParams.hideViewersCursor
          annotationsLocked = m.lockSettingsParams.hideViewersAnnotation
          userListLocked = m.lockSettingsParams.hideUserList
          webcamOnlyForMod = m.getWebcamsOnlyForModerator()
        }

        response.setStatus(200)
        withFormat {
          json {
            def builder = new JsonBuilder()
            builder {
              "response" "authorized"
              "X-Hasura-Role" m && u && !u.hasLeft() ? "bbb_client" : "not_joined_bbb_client"
              "X-Hasura-ModeratorInMeeting" u && u.isModerator() ? userSession.meetingID : ""
              "X-Hasura-PresenterInMeeting" u && u.isPresenter() ? userSession.meetingID : ""
              "X-Hasura-UserId" userSession.internalUserId
              "X-Hasura-MeetingId" userSession.meetingID
              "X-Hasura-CursorNotLockedInMeeting" cursorLocked ? "" : userSession.meetingID
              "X-Hasura-CursorLockedUserId" cursorLocked ? userSession.internalUserId : ""
              "X-Hasura-AnnotationsNotLockedInMeeting" annotationsLocked ? "" : userSession.meetingID
              "X-Hasura-AnnotationsLockedUserId" annotationsLocked ? userSession.internalUserId : ""
              "X-Hasura-UserListNotLockedInMeeting" userListLocked ? "" : userSession.meetingID
              "X-Hasura-WebcamsNotLockedInMeeting" webcamOnlyForMod ? "" : userSession.meetingID
              "X-Hasura-WebcamsLockedUserId" webcamOnlyForMod ? userSession.internalUserId : ""
            }
            render(contentType: "application/json", text: builder.toPrettyString())
          }
        }
      } else {
        UserSessionBasicData removedUserSession = meetingService.getRemovedUserSessionWithSessionToken(sessionToken)
        if(removedUserSession) {
          response.setStatus(200)
          withFormat {
            json {
              def builder = new JsonBuilder()
              builder {
                "response" "authorized"
                "X-Hasura-Role" "not_joined_bbb_client"
                "X-Hasura-ModeratorInMeeting" ""
                "X-Hasura-PresenterInMeeting" ""
                "X-Hasura-UserId" removedUserSession.userId
                "X-Hasura-MeetingId" removedUserSession.meetingId
              }
              render(contentType: "application/json", text: builder.toPrettyString())
            }
          }
        } else {
          throw new Exception("Invalid User Session")
        }
      }
    } catch (Exception e) {
      log.debug("Error while authenticating graphql connection: " + e.getMessage())
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
