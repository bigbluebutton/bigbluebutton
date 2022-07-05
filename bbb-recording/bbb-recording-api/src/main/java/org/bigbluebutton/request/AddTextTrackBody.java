package org.bigbluebutton.request;

import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

@Data
public class AddTextTrackBody {

    private String kind;
    private String lang;
    private String label;
    private MultipartFile file;
}
