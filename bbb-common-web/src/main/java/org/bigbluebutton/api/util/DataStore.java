package org.bigbluebutton.api.util;

import org.bigbluebutton.api.model.entity.*;
import org.hibernate.Session;
import org.hibernate.SessionFactory;
import org.hibernate.Transaction;
import org.hibernate.cfg.Configuration;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.persistence.NoResultException;
import javax.persistence.criteria.CriteriaBuilder;
import javax.persistence.criteria.CriteriaQuery;
import javax.persistence.criteria.Root;
import java.util.List;

public class DataStore {

    private static final Logger logger = LoggerFactory.getLogger(DataStore.class);

    private SessionFactory sessionFactory;
    private static DataStore instance;

    private DataStore() {
        openConnection();
    }

    private void openConnection() {
        sessionFactory = new Configuration()
                .configure("project/hibernate.cfg.xml")
                .addAnnotatedClass(Recording.class)
                .addAnnotatedClass(Metadata.class)
                .addAnnotatedClass(PlaybackFormat.class)
                .addAnnotatedClass(Thumbnail.class)
                .addAnnotatedClass(CallbackData.class)
                .buildSessionFactory();
    }

    public static DataStore getInstance() {
        if(instance == null) {
            instance = new DataStore();
        }
        return instance;
    }

    public <T> void save(T entity) {
        logger.info("Attempting to save entity {}", entity);
        Session session = sessionFactory.openSession();
        Transaction transaction = null;

        try {
            transaction = session.beginTransaction();
            session.saveOrUpdate(entity);
            transaction.commit();
        } catch(Exception e) {
            if(transaction != null) {
                transaction.rollback();
                e.printStackTrace();
            }
        } finally {
            session.close();
        }
    }

    public <T> T find(String id, Class<T> entityClass) {
        logger.info("Attempting to find {} with ID {}", entityClass.getSimpleName(), id);
        Session session = sessionFactory.openSession();
        Transaction transaction = null;
        T result = null;

        try {
            transaction = session.beginTransaction();
            switch(entityClass.getSimpleName()) {
                case "Recording":
                    result = session.find(entityClass, id);
                    break;
                default:
                    result = session.find(entityClass, Long.parseLong(id));
                    break;
            }
            transaction.commit();
        } catch(Exception e) {
            if(transaction != null) {
                transaction.rollback();

                if(e instanceof NoResultException) logger.info("No result found.");
                else e.printStackTrace();
            }
        } finally {
            session.close();
        }

        return result;
    }

    public <T> List<T> findAll(Class<T> entityClass) {
        logger.info("Attempting to fetch all {}", entityClass.getSimpleName());
        Session session = sessionFactory.openSession();
        Transaction transaction = null;
        List<T> result = null;

        try {
            transaction = session.beginTransaction();
            CriteriaBuilder criteriaBuilder = session.getCriteriaBuilder();
            CriteriaQuery<T> criteriaQuery = criteriaBuilder.createQuery(entityClass);
            Root<T> root = criteriaQuery.from(entityClass);
            CriteriaQuery<T> allEntities = criteriaQuery.select(root);
            result = session.createQuery(allEntities).getResultList();
        } catch(Exception e) {
            if(transaction != null) {
                transaction.rollback();

                if(e instanceof NoResultException) logger.info("No result found.");
                else e.printStackTrace();
            }
        } finally {
            session.close();
        }

        return result;
    }

    public Recording findRecordingByRecordId(String recordId) {
        logger.info("Attempting to find recording with recordId {}", recordId);
        Session session = sessionFactory.openSession();
        Transaction transaction = null;
        Recording result = null;

        try {
            transaction = session.beginTransaction();
            CriteriaBuilder criteriaBuilder = session.getCriteriaBuilder();
            CriteriaQuery<Recording> criteriaQuery = criteriaBuilder.createQuery(Recording.class);
            Root<Recording> recordingRoot = criteriaQuery.from(Recording.class);
            criteriaQuery.where(criteriaBuilder.equal(recordingRoot.get("recordId"), recordId));
            result = session.createQuery(criteriaQuery).getSingleResult();
            transaction.commit();
        } catch(Exception e) {
            if(transaction != null) {
                transaction.rollback();

                if(e instanceof NoResultException) logger.info("No result found.");
                else e.printStackTrace();
            }
        } finally {
            session.close();
        }

        return result;
    }
}
