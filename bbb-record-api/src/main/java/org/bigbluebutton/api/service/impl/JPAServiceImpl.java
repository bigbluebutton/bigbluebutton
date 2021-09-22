package org.bigbluebutton.api.service.impl;

import org.bigbluebutton.api.service.JPAService;
import org.springframework.stereotype.Service;

import javax.persistence.EntityManager;
import javax.persistence.EntityManagerFactory;
import javax.persistence.PersistenceUnit;
import java.util.List;

@Service
public class JPAServiceImpl implements JPAService {

    @PersistenceUnit
    private EntityManagerFactory entityManagerFactory;

    public JPAServiceImpl(EntityManagerFactory entityManagerFactory) {
        this.entityManagerFactory = entityManagerFactory;
    }

    @Override
    public <T> List<T> executeQuery(String query, Class<T> entityClass) {
        EntityManager entityManager = entityManagerFactory.createEntityManager();
        return entityManager.createNativeQuery(query, entityClass).getResultList();
    }
}
