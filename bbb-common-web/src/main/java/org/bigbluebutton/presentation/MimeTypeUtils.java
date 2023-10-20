package org.bigbluebutton.presentation;

import org.bigbluebutton.api.domain.Extension;

import java.util.*;

import static org.bigbluebutton.presentation.FileTypeConstants.*;

public class MimeTypeUtils {
    private  static final String XLS = "application/vnd.ms-excel";
    private  static final String XLSX = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
    private  static final String DOC = "application/msword";
    private  static final String DOCX = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    private  static final String PPT = "application/vnd.ms-powerpoint";
    private  static final String PPTX = "application/vnd.openxmlformats-officedocument.presentationml.presentation";
    private  static final String TIKA_MSOFFICE = "application/x-tika-msoffice";
    private  static final String TIKA_MSOFFICE_X = "application/x-tika-ooxml";
    private  static final String ODT = "application/vnd.oasis.opendocument.text";
    private  static final String RTF = "application/rtf";
    private  static final String TXT = "text/plain";
    private  static final String ODS = "application/vnd.oasis.opendocument.spreadsheet";
    private  static final String ODP = "application/vnd.oasis.opendocument.presentation";
    private  static final String PDF = "application/pdf";
    private  static final String JPEG = "image/jpeg";
    private  static final String PNG = "image/png";
    private  static final String SVG = "image/svg+xml";

    private static final HashMap<String, List<String>> EXTENSIONS_MIME = new HashMap<String, List<String>>(16) {
        {
            put(FileTypeConstants.DOC, Arrays.asList(DOC, DOCX, TIKA_MSOFFICE, TIKA_MSOFFICE_X));
            put(FileTypeConstants.XLS, Arrays.asList(XLS, XLSX, TIKA_MSOFFICE, TIKA_MSOFFICE_X));
            put(FileTypeConstants.PPT, Arrays.asList(PPT, PPTX, TIKA_MSOFFICE, TIKA_MSOFFICE_X));
            put(FileTypeConstants.DOCX, Arrays.asList(DOC, DOCX, TIKA_MSOFFICE, TIKA_MSOFFICE_X));
            put(FileTypeConstants.PPTX, Arrays.asList(PPT, PPTX, TIKA_MSOFFICE, TIKA_MSOFFICE_X));
            put(FileTypeConstants.XLSX, Arrays.asList(XLS, XLSX, TIKA_MSOFFICE, TIKA_MSOFFICE_X));
            put(FileTypeConstants.ODT, Arrays.asList(ODT));
            put(FileTypeConstants.RTF, Arrays.asList(RTF));
            put(FileTypeConstants.TXT, Arrays.asList(TXT));
            put(FileTypeConstants.ODS, Arrays.asList(ODS));
            put(FileTypeConstants.ODP, Arrays.asList(ODP));
            put(FileTypeConstants.PDF, Arrays.asList(PDF));
            put(FileTypeConstants.JPG, Arrays.asList(JPEG));
            put(FileTypeConstants.JPEG, Arrays.asList(JPEG));
            put(FileTypeConstants.PNG, Arrays.asList(PNG));
            put(FileTypeConstants.SVG, Arrays.asList(SVG));
        }
    };

    public String getExtensionBasedOnMimeType(String mimeType) {
        return EXTENSIONS_MIME.entrySet()
                .stream()
                .filter(entry -> entry.getValue().contains(mimeType))
                .map(Map.Entry::getKey)
                .findFirst()
                .orElse(null);
    }

    public Boolean extensionMatchMimeType(String mimeType, String finalExtension) {
        finalExtension = finalExtension.toLowerCase();

        if (EXTENSIONS_MIME.containsKey(finalExtension)) {
            for (String validMimeType : EXTENSIONS_MIME.get(finalExtension)) {
                if (validMimeType.equalsIgnoreCase(mimeType)) {
                    return true;
                }
            }
        }
    
        return false;
    }

    public List<String> getValidMimeTypes() {
        List<String> validMimeTypes = Arrays.asList(XLS, XLSX,
                DOC, DOCX, PPT, PPTX, ODT, RTF, TXT, ODS, ODP,
                PDF, JPEG, PNG, SVG, TIKA_MSOFFICE, TIKA_MSOFFICE_X
        );
        return validMimeTypes;
    }
}
