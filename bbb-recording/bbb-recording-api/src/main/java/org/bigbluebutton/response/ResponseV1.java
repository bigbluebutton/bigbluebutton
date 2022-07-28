package org.bigbluebutton.response;

import com.fasterxml.jackson.annotation.JsonAnyGetter;
import com.fasterxml.jackson.annotation.JsonProperty;
import org.bigbluebutton.response.content.Content;

public class ResponseV1 implements Response {

    @JsonProperty("returncode")
    private String returnCode;

    private Content content;

    public String getReturnCode() {
        return returnCode;
    }

    public void setReturnCode(String returnCode) {
        this.returnCode = returnCode;
    }

    public Content getContent() {
        return content;
    }

    public void setContent(Content content) {
        this.content = content;
    }
}
