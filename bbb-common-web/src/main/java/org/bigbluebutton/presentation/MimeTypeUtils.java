package org.bigbluebutton.presentation;

import java.util.*;

import static org.bigbluebutton.presentation.FileTypeConstants.*;

public class MimeTypeUtils {
    private  static final String XLS = "application/vnd.ms-excel";
    private  static final String XLSX = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
    private  static final String DOC = "application/msword";
    private  static final String DOCX = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    private  static final String PPT = "application/vnd.ms-powerpoint";
    private  static final String PPTX = "application/vnd.openxmlformats-officedocument.presentationml.presentation";
    private  static final String ODT = "application/vnd.oasis.opendocument.text";
    private  static final String RTF = "application/rtf";
    private  static final String TXT = "text/plain";
    private  static final String ODS = "application/vnd.oasis.opendocument.spreadsheet";
    private  static final String ODP = "application/vnd.oasis.opendocument.presentation";
    private  static final String PDF = "application/pdf";
    private  static final String JPEG = "image/jpeg";
    private  static final String PNG = "image/png";
    private  static final String SVG = "image/svg+xml";

    private static final HashMap<String,String> EXTENSIONS_MIME = new HashMap<String,String>(16) {
        {
            // Add all the supported files
            put(FileTypeConstants.XLS, XLS);
            put(FileTypeConstants.XLSX, XLSX);
            put(FileTypeConstants.DOC, DOC);
            put(FileTypeConstants.DOCX, DOCX);
            put(FileTypeConstants.PPT, PPT);
            put(FileTypeConstants.PPTX, PPTX);
            put(FileTypeConstants.ODT, ODT);
            put(FileTypeConstants.RTF, RTF);
            put(FileTypeConstants.TXT, TXT);
            put(FileTypeConstants.ODS, ODS);
            put(FileTypeConstants.ODP, ODP);
            put(FileTypeConstants.PDF, PDF);
            put(FileTypeConstants.JPG, JPEG);
            put(FileTypeConstants.JPEG, JPEG);
            put(FileTypeConstants.PNG, PNG);
            put(FileTypeConstants.SVG, SVG);
        }
    };

    public Boolean extensionMatchMimeType(String mimeType, String finalExtension) {
        if(EXTENSIONS_MIME.containsKey(finalExtension.toLowerCase()) &&
            EXTENSIONS_MIME.get(finalExtension.toLowerCase()).equalsIgnoreCase(mimeType)) {
            return true;
        } else if(EXTENSIONS_MIME.containsKey(finalExtension.toLowerCase() + 'x') &&
                    EXTENSIONS_MIME.get(finalExtension.toLowerCase() + 'x').equalsIgnoreCase(mimeType)) {
            //Exception for MS Office files named with old extension but using internally the new mime type
            //e.g. a file named with extension `ppt` but has the content of a `pptx`
            return true;
        }

        return false;
    }

    public List<String> getValidMimeTypes() {
        List<String> validMimeTypes = Arrays.asList(XLS, XLSX,
                DOC, DOCX, PPT, PPTX, ODT, RTF, TXT, ODS, ODP,
                PDF, JPEG, PNG, SVG
        );
        return validMimeTypes;
    }
}
