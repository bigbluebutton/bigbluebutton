package org.bigbluebutton.response.model;

import org.bigbluebutton.dao.entity.CallbackData;

import java.time.LocalDateTime;

public class CallbackDataModel {

    private String meetingId;
    private String callbackAttributes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public String getMeetingId() {
        return meetingId;
    }

    public void setMeetingId(String meetingId) {
        this.meetingId = meetingId;
    }

    public String getCallbackAttributes() {
        return callbackAttributes;
    }

    public void setCallbackAttributes(String callbackAttributes) {
        this.callbackAttributes = callbackAttributes;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public static CallbackDataModel toModel(CallbackData callbackData) {
        if (callbackData == null)
            return null;

        CallbackDataModel callbackDataModel = new CallbackDataModel();

        callbackDataModel.setMeetingId(callbackData.getMeetingId());
        callbackDataModel.setCallbackAttributes(callbackData.getCallbackAttributes());
        callbackDataModel.setCreatedAt(callbackData.getCreatedAt());
        callbackDataModel.setUpdatedAt(callbackData.getUpdatedAt());

        return callbackDataModel;
    }
}
