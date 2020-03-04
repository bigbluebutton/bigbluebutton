/**
* BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
* 
* Copyright (c) 2012 BigBlueButton Inc. and by respective authors (see below).
*
* This program is free software; you can redistribute it and/or modify it under the
* terms of the GNU Lesser General Public License as published by the Free Software
* Foundation; either version 3.0 of the License, or (at your option) any later
* version.
* 
* BigBlueButton is distributed in the hope that it will be useful, but WITHOUT ANY
* WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
* PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
*
* You should have received a copy of the GNU Lesser General Public License along
* with BigBlueButton; if not, see <http://www.gnu.org/licenses/>.
*
*/

package org.bigbluebutton.presentation;

public class ConversionMessageConstants {
    public static final String OFFICE_DOC_CONVERSION_SUCCESS_KEY = "OFFICE_DOC_CONVERSION_SUCCESS";
    public static final String OFFICE_DOC_CONVERSION_FAILED_KEY = "OFFICE_DOC_CONVERSION_FAILED";
    public static final String OFFICE_DOC_CONVERSION_INVALID_KEY = "OFFICE_DOC_CONVERSION_INVALID";
    public static final String SUPPORTED_DOCUMENT_KEY = "SUPPORTED_DOCUMENT";
    public static final String UNSUPPORTED_DOCUMENT_KEY = "UNSUPPORTED_DOCUMENT";
    public static final String PAGE_COUNT_FAILED_KEY = "PAGE_COUNT_FAILED";
    public static final String PAGE_COUNT_EXCEEDED_KEY = "PAGE_COUNT_EXCEEDED";
    public static final String PDF_HAS_BIG_PAGE = "PDF_HAS_BIG_PAGE";
    public static final String GENERATED_SLIDE_KEY = "GENERATED_SLIDE";
    public static final String GENERATING_THUMBNAIL_KEY = "GENERATING_THUMBNAIL";
    public static final String GENERATED_THUMBNAIL_KEY = "GENERATED_THUMBNAIL";
    public static final String GENERATING_TEXTFILES_KEY = "GENERATING_TEXTFILES";
    public static final String GENERATED_TEXTFILES_KEY = "GENERATED_TEXTFILES";
    public static final String GENERATING_SVGIMAGES_KEY = "GENERATING_SVGIMAGES";
    public static final String GENERATED_SVGIMAGES_KEY = "GENERATED_SVGIMAGES";
    public static final String CONVERSION_STARTED_KEY = "CONVERSION_STARTED_KEY";
    public static final String CONVERSION_COMPLETED_KEY = "CONVERSION_COMPLETED";

    private ConversionMessageConstants() {
        throw new IllegalStateException("ConversionMessageConstants is a utility class. Instanciation is forbidden.");
    }
}
