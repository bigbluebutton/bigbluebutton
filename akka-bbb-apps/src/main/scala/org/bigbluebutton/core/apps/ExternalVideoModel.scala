package org.bigbluebutton.core.apps

object ExternalVideoModel {
  def start(externalVideoModel: ExternalVideoModel, videoUrl: String) {
    externalVideoModel.externalVideoUrl = Some(videoUrl)
  }

  def stop(externalVideoModel: ExternalVideoModel) {
    externalVideoModel.externalVideoUrl = None: Option[String]
  }

  def isPlaying(externalVideoModel: ExternalVideoModel): Boolean = {
    !externalVideoModel.externalVideoUrl.isEmpty
  }
}

class ExternalVideoModel {
  private var externalVideoUrl = None: Option[String]
}