package org.bigbluebutton.api.model.request;

import jakarta.ws.rs.core.MediaType;
import org.bigbluebutton.api.model.constraint.*;
import org.bigbluebutton.api.model.shared.Checksum;

import javax.servlet.http.HttpServletRequest;
import java.util.Map;
import java.util.Set;

@ContentTypeConstraint
public class InsertDocument extends RequestWithChecksum<InsertDocument.Params> {

    public enum Params implements RequestParameters {
        MEETING_ID("meetingID");

        private final String value;

        Params(String value) { this.value = value; }

        public String getValue() { return value; }
    }

    @MeetingIDConstraint
    private String meetingID;

    public InsertDocument(Checksum checksum, HttpServletRequest servletRequest) {
        super(checksum, servletRequest);
    }

    public String getMeetingID() {
        return meetingID;
    }

    public void setMeetingID(String meetingID) {
        this.meetingID = meetingID;
    }

    @Override
    public void populateFromParamsMap(Map<String, String[]> params) {
        if(params.containsKey(Params.MEETING_ID.getValue())) setMeetingID(params.get(Params.MEETING_ID.getValue())[0]);
    }

    @Override
    public Set<String> getSupportedContentTypes() {
        return Set.of(MediaType.APPLICATION_XML, MediaType.TEXT_XML);
    }
}
