package org.bigbluebutton.response.content;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Data;

@Data
public class MessageContent implements Content {

    private String messageKey;
    private String message;

    @JsonInclude(JsonInclude.Include.NON_NULL)
    private String recordId;
}
