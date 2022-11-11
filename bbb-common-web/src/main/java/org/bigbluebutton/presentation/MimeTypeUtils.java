package org.bigbluebutton.presentation;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class MimeTypeUtils {
    private static String XLS = "application/vnd.ms-excel";
    private static String XLSX = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
    private static String DOC = "application/msword";
    private static String DOCX = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    private static String PPT = "application/vnd.ms-powerpoint";
    private static String PPTX = "application/vnd.openxmlformats-officedocument.presentationml.presentation";
    private static String ODT = "application/vnd.oasis.opendocument.text";
    private static String RTF = "application/rtf";
    private static String TXT = "text/plain";
    private static String ODS = "application/vnd.oasis.opendocument.spreadsheet";
    private static String ODP = "application/vnd.oasis.opendocument.presentation";
    private static String PDF = "application/pdf";
    private static String JPEG = "image/jpeg";
    private static String PNG = "image/png";
    private static String SVG = "image/svg+xml";

    public List<String> getValidMimeTypes() {
        List<String> validMimeTypes = Arrays.asList(XLS, XLSX,
                DOC, DOCX, PPT, PPTX, ODT, RTF, TXT, ODS, ODP,
                PDF, JPEG, PNG, SVG
        );
        return validMimeTypes;
    }
}
