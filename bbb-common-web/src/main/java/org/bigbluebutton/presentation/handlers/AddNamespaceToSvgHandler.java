package org.bigbluebutton.presentation.handlers;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class AddNamespaceToSvgHandler extends AbstractCommandHandler {
    private static Logger log = LoggerFactory.getLogger(AddNamespaceToSvgHandler.class);

    private final String id;

    public AddNamespaceToSvgHandler(String id) {
        this.id = id;
    }

    @Override
    protected String getIdTag() {
        return id;
    }
}
