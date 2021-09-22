package org.bigbluebutton.api.service;

import java.util.List;

public interface JPAService {

    public <T> List<T> executeQuery(String query, Class<T> entityClass);
}
