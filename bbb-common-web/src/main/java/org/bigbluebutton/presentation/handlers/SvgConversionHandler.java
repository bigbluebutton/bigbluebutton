package org.bigbluebutton.presentation.handlers;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class SvgConversionHandler extends AbstractCommandHandler {
    private static Logger log = LoggerFactory.getLogger(SvgConversionHandler.class);

    private static String PATH_OUTPUT = "<path";
    private static String IMAGE_TAG_OUTPUT = "<image";
    private static String PATH_PATTERN = "\\d+\\s" + PATH_OUTPUT;
    private static String IMAGE_TAG_PATTERN = "\\d+\\s" + IMAGE_TAG_OUTPUT;

    /**
     * 
     * @return The number of <path/> tags in the generated SVG
     */
    public int numberOfPaths() {
        if (stdoutContains(PATH_OUTPUT)) {
            try {
                String out = stdoutBuilder.toString();
                Pattern r = Pattern.compile(PATH_PATTERN);
                Matcher m = r.matcher(out);
                m.find();
                return Integer.parseInt(m.group(0).replace(PATH_OUTPUT, "").trim());
            } catch (Exception e) {
                log.error("Exception counting the number of paths", e);
                return 0;
            }
        }
        return 0;
    }

    /**
     * 
     * @return The number of <image/> tags in the generated SVG.
     */
    public int numberOfImageTags() {
        if (stdoutContains(IMAGE_TAG_OUTPUT)) {
            try {
                String out = stdoutBuilder.toString();
                Pattern r = Pattern.compile(IMAGE_TAG_PATTERN);
                Matcher m = r.matcher(out);
                m.find();
                return Integer.parseInt(m.group(0).replace(IMAGE_TAG_OUTPUT, "").trim());
            } catch (Exception e) {
                log.error("Exception counting the number of image tags", e);
                return 0;
            }
        }
        return 0;
    }
}
