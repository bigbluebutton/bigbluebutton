package org.bigbluebutton.response;

import com.fasterxml.jackson.annotation.JsonAnyGetter;
import org.bigbluebutton.response.content.Content;

public class ResponseV1 implements Response {

    private String returnCode;
    private Content content;

    public String getReturnCode() {
        return returnCode;
    }

    public void setReturnCode(String returnCode) {
        this.returnCode = returnCode;
    }

    @JsonAnyGetter
    public Content getContent() {
        return content;
    }

    public void setContent(Content content) {
        this.content = content;
    }
}
