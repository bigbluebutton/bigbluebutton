package org.bigbluebutton.presentation.messages;

import org.bigbluebutton.presentation.UploadedPresentation;

public class PresentationConvertMessage implements IPresentationCompletionMessage {
    public final UploadedPresentation pres;

    public PresentationConvertMessage(UploadedPresentation pres) {
        this.pres = pres;
    }
}
