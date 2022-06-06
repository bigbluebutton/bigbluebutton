package org.bigbluebutton.response.dto;

import org.bigbluebutton.dao.entity.CallbackData;

import java.time.LocalDateTime;

public class CallbackDataDto {

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

    public static CallbackDataDto callbackDataToDto(CallbackData callbackData) {
        CallbackDataDto callbackDataDto = new CallbackDataDto();

        callbackDataDto.setMeetingId(callbackData.getMeetingId());
        callbackDataDto.setCallbackAttributes(callbackData.getCallbackAttributes());
        callbackDataDto.setCreatedAt(callbackData.getCreatedAt());
        callbackDataDto.setUpdatedAt(callbackData.getUpdatedAt());

        return callbackDataDto;
    }
}
