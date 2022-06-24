package org.bigbluebutton.response;

import lombok.Data;
import org.bigbluebutton.response.content.Content;

@Data
public class ResponseV1 implements Response{

    private String returnCode;
    private Content content;
}
