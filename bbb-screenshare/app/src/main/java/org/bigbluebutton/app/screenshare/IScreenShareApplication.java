package org.bigbluebutton.app.screenshare;


import org.bigbluebutton.app.screenshare.events.IsScreenSharingResponse;

public interface IScreenShareApplication {
  

  ScreenShareInfoResponse getScreenShareInfo(String meetingId, String token);
  SharingStatus getSharingStatus(String meetingId, String streamId);
  Boolean recordStream(String meetingId, String streamId);

  void isScreenSharing(String meetingId, String userId);
  void requestShareToken(String meetingId, String userId, Boolean record, Boolean tunnel);
  void startShareRequest(String meetingId, String userId, String session);
  void pauseShareRequest(String meetingId, String userId, String streamId);
  void restartShareRequest(String meetingId, String userId);
  void stopShareRequest(String meetingId, String streamId);
  void streamStarted(String meetingId, String streamId, String url);
  void streamStopped(String meetingId, String streamId);
  void sharingStarted(String meetingId, String streamId, Integer width, Integer height);
  void sharingStopped(String meetingId, String streamId);
  void updateShareStatus(String meetingId, String streamId, Integer seqNum);
  void userDisconnected(String meetingId, String userId);
  void userConnected(String meetingId, String userId);
  void meetingHasEnded(String meetingId);
  void meetingCreated(String meetingId, Boolean record);
  void screenShareClientPongMessage(String meetingId, String userId, String streamId, Long timestamp);
  void authorizeBroadcastStream(String meetingId, String streamId, String connId, String scope);
}
