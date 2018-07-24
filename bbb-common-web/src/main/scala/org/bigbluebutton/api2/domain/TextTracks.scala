package org.bigbluebutton.api2.domain

import java.io.File
import java.util

case class CaptionsDirPaths(captionsDir: String, inboxDir: String, statusDir: String)
case class UploadedTrack(recordId: String,
												 kind: String,
												 lang: String,
												 label: String,
												 origFilename: String,
												 track: File,
												 trackId: String,
												 inboxDir: String)
case class UploadedTrackInfo(recordId: String,
														 kind: String,
														 lang: String,
														 label: String,
														 origFilename: String)
case class Track(kind: String,
								 lang: String,
								 label: String,
								 source: String,
								 href: String)
case class GetRecTextTracksResult(returncode: String,
																	tracks: util.ArrayList[Track])
case class GetRecTextTracksResp(response: GetRecTextTracksResult)
case class GetRecTextTracksResultFailed(returncode: String,
																				messageKey: String,
																				message: String)
case class GetRecTextTracksRespFailed(response: GetRecTextTracksResultFailed)
case class PutRecTextTrackResult(returncode: String,
																 recordId: String,
																 messageKey: String,
																 message: String)
case class PutRecTextTrackResp(response: PutRecTextTrackResult)