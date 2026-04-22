package org.bigbluebutton.presentation.handlers;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class Png2SvgConversionHandler extends AbstractCommandHandler {

    private static Logger log = LoggerFactory.getLogger(Png2SvgConversionHandler.class);

    private final String id;

    public Png2SvgConversionHandler(String id) {
        this.id = id;
    }

    @Override
    protected String getIdTag() {
        return id;
    }
}
