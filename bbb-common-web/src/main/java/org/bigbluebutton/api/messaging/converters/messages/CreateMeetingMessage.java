package org.bigbluebutton.api.messaging.converters.messages;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

public class CreateMeetingMessage {
	public static final String CREATE_MEETING_REQUEST_EVENT  = "create_meeting_request";
	public static final String VERSION = "0.0.1";

	public final String id;
	public final String externalId;
	public final String name;
	public final Boolean record;
	public final String voiceBridge;
	public final Long duration;
	public boolean autoStartRecording;
	public boolean allowStartStopRecording;
	public boolean recordFullDurationMedia;
	public boolean webcamsOnlyForModerator;
	public final Integer meetingCameraCap;
	public final Integer userCameraCap;
	public final Integer maxPinnedCameras;
	public final String cameraBridge;
	public final String screenShareBridge;
	public final String audioBridge;
	public final String moderatorPass;
	public final String viewerPass;
	public final String learningDashboardAccessToken;
	public final ArrayList<String> disabledFeatures;
	public final Boolean notifyRecordingIsOn;
	public final String presentationUploadExternalDescription;
	public final String presentationUploadExternalUrl;
	public final Long createTime;
	public final String createDate;
	public final Map<String, String> metadata;

	public CreateMeetingMessage(String id, String externalId, String name, Boolean record,
						String voiceBridge, Long duration,
						Boolean autoStartRecording, Boolean allowStartStopRecording,
						Boolean recordFullDurationMedia,
						Boolean webcamsOnlyForModerator, Integer meetingCameraCap, Integer userCameraCap, Integer maxPinnedCameras,
						String cameraBridge,
						String screenShareBridge,
						String audioBridge,
						String moderatorPass,
						String viewerPass, String learningDashboardAccessToken,
						ArrayList<String> disabledFeatures,
						Boolean notifyRecordingIsOn,
						String presentationUploadExternalDescription,
						String presentationUploadExternalUrl,
						Long createTime, String createDate, Map<String, String> metadata) {
		this.id = id;
		this.externalId = externalId;
		this.name = name;
		this.record = record;
		this.voiceBridge = voiceBridge;
		this.duration = duration;
		this.autoStartRecording = autoStartRecording;
		this.allowStartStopRecording = allowStartStopRecording;
		this.recordFullDurationMedia = recordFullDurationMedia;
		this.webcamsOnlyForModerator = webcamsOnlyForModerator;
		this.meetingCameraCap = meetingCameraCap;
		this.userCameraCap = userCameraCap;
		this.maxPinnedCameras = maxPinnedCameras;
		this.cameraBridge = cameraBridge;
		this.screenShareBridge = screenShareBridge;
		this.audioBridge = audioBridge;
		this.moderatorPass = moderatorPass;
		this.viewerPass = viewerPass;
		this.learningDashboardAccessToken = learningDashboardAccessToken;
		this.disabledFeatures = disabledFeatures;
		this.notifyRecordingIsOn = notifyRecordingIsOn;
		this.presentationUploadExternalDescription = presentationUploadExternalDescription;
		this.presentationUploadExternalUrl = presentationUploadExternalUrl;
		this.createTime = createTime;
		this.createDate = createDate;
		this.metadata = metadata;
	}
}
