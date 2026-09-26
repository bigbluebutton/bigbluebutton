package org.bigbluebutton.presentation.handlers;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class SvgConversionHandler extends AbstractCommandHandler {
    private static Logger log = LoggerFactory.getLogger(SvgConversionHandler.class);

    private static String PATH_OUTPUT = "<path";
    private static String PATH_PATTERN = "\\d+\\s" + PATH_OUTPUT;

    private static String IMAGE_TAG_OUTPUT = "<image";
    private static String IMAGE_TAG_PATTERN = "\\d+\\s" + IMAGE_TAG_OUTPUT;

    private static String USE_TAG_OUTPUT = "<use";
    private static String USE_TAG_PATTERN = "\\d+\\s" + USE_TAG_OUTPUT;

    private static String MASK_TAG_OUTPUT = "<mask";
    private static String MASK_TAG_PATTERN = "\\d+\\s" + MASK_TAG_OUTPUT;

    private static String FILTER_TAG_OUTPUT = "<filter";
    private static String FILTER_TAG_PATTERN = "\\d+\\s" + FILTER_TAG_OUTPUT;

    private final String id;

    public SvgConversionHandler(String id) {
        this.id = id;
    }

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

    /**
     *
     * @return The number of <use/> tags in the generated SVG.
     */
    public int numberOfUseTags() {
        if (stdoutContains(USE_TAG_OUTPUT)) {
            try {
                String out = stdoutBuilder.toString();
                Pattern r = Pattern.compile(USE_TAG_PATTERN);
                Matcher m = r.matcher(out);
                m.find();
                return Integer.parseInt(m.group(0).replace(USE_TAG_OUTPUT, "").trim());
            } catch (Exception e) {
                log.error("Exception counting the number of use tags", e);
                return 0;
            }
        }
        return 0;
    }

    /**
     *
     * @return The number of <mask/> tags in the generated SVG.
     */
    public int numberOfMaskTags() {
        if (stdoutContains(MASK_TAG_OUTPUT)) {
            try {
                String out = stdoutBuilder.toString();
                Pattern r = Pattern.compile(MASK_TAG_PATTERN);
                Matcher m = r.matcher(out);
                m.find();
                return Integer.parseInt(m.group(0).replace(MASK_TAG_OUTPUT, "").trim());
            } catch (Exception e) {
                log.error("Exception counting the number of mask tags", e);
                return 0;
            }
        }
        return 0;
    }

    /**
     *
     * @return The number of &lt;filter/&gt; tags in the generated SVG. pdftocairo emits a
     * &lt;filter&gt; (an alpha-to-luminance feColorMatrix) when it converts a PDF transparency
     * group used as a soft mask (SMask). Browsers render this construct unreliably and it can
     * show up blank, so its presence is used to fall back to a rasterized slide. Note: plain
     * alpha images produce only &lt;mask&gt; (no &lt;filter&gt;) and render fine, so gating on
     * &lt;filter&gt; avoids needlessly rasterizing them. See issue #23953.
     */
    public int numberOfFilterTags() {
        if (stdoutContains(FILTER_TAG_OUTPUT)) {
            try {
                String out = stdoutBuilder.toString();
                Pattern r = Pattern.compile(FILTER_TAG_PATTERN);
                Matcher m = r.matcher(out);
                m.find();
                return Integer.parseInt(m.group(0).replace(FILTER_TAG_OUTPUT, "").trim());
            } catch (Exception e) {
                log.error("Exception counting the number of filter tags", e);
                return 0;
            }
        }
        return 0;
    }

    @Override
    protected String getIdTag() {
        return id;
    }
}
