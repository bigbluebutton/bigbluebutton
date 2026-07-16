package org.bigbluebutton.api.service;

import org.springframework.data.domain.*;

public interface XmlService {

    String constructPaginatedResponse(Page<?> page, int offset, String response);
    String noRecordings();
}
