package org.bigbluebutton.presentation.handlers;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.nio.ByteBuffer;
import java.nio.charset.StandardCharsets;

public class Png2SvgConversionHandler extends AbstractCommandHandler {

    private final StringBuilder stderr = new StringBuilder();

    @Override
    public void onStderr(ByteBuffer buffer, boolean closed) {
        if (!closed) {
            byte[] bytes = new byte[buffer.remaining()];
            buffer.get(bytes);
            stderr.append(new String(bytes, StandardCharsets.UTF_8));
        }
    }

    public String getStderrString() {
        return stderr.toString();
    }


    private static Logger log = LoggerFactory.getLogger(Png2SvgConversionHandler.class);
}
