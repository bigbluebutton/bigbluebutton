package org.bigbluebutton.core.apps.presentationpod

import java.net.URLEncoder
import java.nio.charset.StandardCharsets

object PresentationDownloadUrlBuilder {
  private def encodeQueryValue(value: String): String = {
    URLEncoder.encode(value, StandardCharsets.UTF_8).replace("+", "%20")
  }

  def buildFileUri(
      meetingId:        String,
      presentationId:   String,
      fileExtension:    String,
      downloadFilename: String
  ): String = {
    val storedFilename = encodeQueryValue(s"${presentationId}.${fileExtension}")
    val encodedDownloadFilename = encodeQueryValue(downloadFilename)

    s"presentation/download/${meetingId}/${presentationId}" +
      s"?presFilename=${storedFilename}&filename=${encodedDownloadFilename}"
  }
}
