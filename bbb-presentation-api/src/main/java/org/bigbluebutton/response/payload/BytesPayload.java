package org.bigbluebutton.response.payload;

import lombok.Data;

@Data
public class BytesPayload implements Payload {

    private byte[] bytes;
}
