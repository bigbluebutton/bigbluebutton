package org.bigbluebutton.request;

import lombok.Data;
import org.bigbluebutton.validation.constraint.KindConstraint;
import org.bigbluebutton.validation.constraint.LangConstraint;

import javax.validation.constraints.NotBlank;

@Data
public class TextTrackInfo {

    @NotBlank(message = "7005")
    @KindConstraint
    private String kind;

    @NotBlank(message = "7006")
    @LangConstraint
    private String lang;

    private String label;
}
