package org.bigbluebutton.api2.domain

import java.util


case class Track(kind: String, lang: String, label: String, source: String, href: String)
case class Tracks(tracks: util.ArrayList[Track])
case class GetRecTextTracksResult(returncode: String, tracks: Tracks)
case class GetRecTextTracksResp(response: GetRecTextTracksResult)
case class GetRecTextTracksResultFailed(returncode: String, key: String, msg: String)
case class GetRecTextTracksRespFailed(response: GetRecTextTracksResultFailed)