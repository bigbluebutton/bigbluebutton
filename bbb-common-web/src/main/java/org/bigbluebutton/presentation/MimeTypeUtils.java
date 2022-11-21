package org.bigbluebutton.presentation;

import java.util.Arrays;
import java.util.List;

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

    public Boolean extensionMatchMimeType(String mimeType, String finalExtension) {
        String mimeExtension = "";
        switch (mimeType) {
            case XLS:
                mimeExtension = FileTypeConstants.XLS;
                break;
            case XLSX:
                mimeExtension = FileTypeConstants.XLSX;
                break;
            case DOC:
                mimeExtension = FileTypeConstants.DOC;
                break;
            case DOCX:
                mimeExtension = FileTypeConstants.DOCX;
                break;
            case PPT:
                mimeExtension = FileTypeConstants.PPT;
                break;
            case PPTX:
                mimeExtension = FileTypeConstants.PPTX;
                break;
            case ODT:
                mimeExtension = FileTypeConstants.ODT;
                break;
            case RTF:
                mimeExtension = FileTypeConstants.RTF;
            case TXT:
                mimeExtension = FileTypeConstants.TXT;
                break;
            case ODS:
                mimeExtension = FileTypeConstants.ODS;
                break;
            case ODP:
                mimeExtension = FileTypeConstants.ODP;
                break;
            case PDF:
                mimeExtension = FileTypeConstants.PDF;
                break;
            case JPEG:
                if (finalExtension.equals(FileTypeConstants.JPG) || finalExtension.equals(FileTypeConstants.JPEG)){
                    mimeExtension = finalExtension;
                }
                break;
            case PNG:
                mimeExtension = FileTypeConstants.PNG;
                break;
            case SVG:
                mimeExtension = FileTypeConstants.SVG;
                break;
            default:
                return null;
        }
        return mimeExtension.equals(finalExtension);
    }

    public List<String> getValidMimeTypes() {
        List<String> validMimeTypes = Arrays.asList(XLS, XLSX,
                DOC, DOCX, PPT, PPTX, ODT, RTF, TXT, ODS, ODP,
                PDF, JPEG, PNG, SVG
        );
        return validMimeTypes;
    }
}
