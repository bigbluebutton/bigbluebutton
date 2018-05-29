package org.bigbluebutton.api2.domain

import java.io.File
import java.util

case class CaptionsDirPaths(captionsDir: String, inboxDir: String, statusDir: String)
case class UploadedTrack(recordId: String, kind: String, lang: String, label: Option[String], origFilename: String, track: File)
case class Track(kind: String, lang: String, label: String, source: String, href: String)
case class Tracks(tracks: util.ArrayList[Track])
case class GetRecTextTracksResult(returncode: String, tracks: Tracks)
case class GetRecTextTracksResp(response: GetRecTextTracksResult)
case class GetRecTextTracksResultFailed(returncode: String, key: String, msg: String)
case class GetRecTextTracksRespFailed(response: GetRecTextTracksResultFailed)