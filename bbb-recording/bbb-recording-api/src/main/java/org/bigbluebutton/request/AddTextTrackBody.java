package org.bigbluebutton.request;

import lombok.Data;
import org.bigbluebutton.validation.constraint.KindConstraint;
import org.bigbluebutton.validation.constraint.LangConstraint;
import org.springframework.web.multipart.MultipartFile;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotEmpty;

@Data
public class AddTextTrackBody {

    @NotBlank(message = "7005")
    @KindConstraint
    private String kind;

    @NotBlank(message = "7006")
    @LangConstraint
    private String lang;

    private String label;

    @NotEmpty(message = "7009")
    private MultipartFile file;
}
