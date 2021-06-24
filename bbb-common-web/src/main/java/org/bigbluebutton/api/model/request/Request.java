package org.bigbluebutton.api.model.request;

import org.bigbluebutton.api.model.shared.Checksum;

import javax.validation.Valid;
import java.util.Map;

public abstract class Request {

    @Valid
    protected Checksum checksum;

    protected Request(Checksum checksum) {
        this.checksum = checksum;
    }

    public Checksum getChecksum() {
        return checksum;
    }

    public void setChecksum(Checksum checksum) {
        this.checksum = checksum;
    }

    public abstract void populateFromParamsMap(Map<String, String[]> params);
}
