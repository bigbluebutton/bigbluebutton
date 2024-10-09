package org.bigbluebutton.dao;

import org.bigbluebutton.dao.entity.*;
import org.hibernate.Session;
import org.hibernate.SessionFactory;
import org.hibernate.Transaction;
import org.hibernate.cfg.Configuration;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.persistence.criteria.CriteriaBuilder;
import javax.persistence.criteria.CriteriaQuery;
import javax.persistence.criteria.Predicate;
import javax.persistence.criteria.Root;
import javax.persistence.*;
import java.util.List;

public class DataStore {

    private static final Logger logger = LoggerFactory.getLogger(DataStore.class);

    private SessionFactory sessionFactory;
    private static DataStore instance;

    private DataStore() {
        openConnection();
    }

    private void openConnection() {
        try {
            sessionFactory = new Configuration()
                    .configure()
                    .addAnnotatedClass(Recording.class)
                    .addAnnotatedClass(Metadata.class)
                    .addAnnotatedClass(PlaybackFormat.class)
                    .addAnnotatedClass(Thumbnail.class)
                    .addAnnotatedClass(CallbackData.class)
                    .addAnnotatedClass(Track.class)
                    .addAnnotatedClass(Events.class)
                    .buildSessionFactory();
        } catch(Exception e) {
            sessionFactory = null;
            logger.info("Failed to open connection to database. Please ensure that the database is running and that " +
                    "your credentials are correct.");
        }
    }

    public static DataStore getInstance() {
        if(instance == null) {
            instance = new DataStore();
            if(instance.sessionFactory == null) instance = null;
        }

        return instance;
    }

    public <T> void save(T entity) {
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
        Session session = sessionFactory.openSession();
        Transaction transaction = null;
        T result = null;

        try {
            transaction = session.beginTransaction();
            result = session.find(entityClass, Long.parseLong(id));
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

    public List<Recording> findRecordingsByMeetingId(String meetingId) {
        logger.info("Attempting to find recordings with meetingID {}", meetingId);
        Session session = sessionFactory.openSession();
        Transaction transaction = null;
        List<Recording> result = null;

        try {
            transaction = session.beginTransaction();
            CriteriaBuilder criteriaBuilder = session.getCriteriaBuilder();
            CriteriaQuery<Recording> criteriaQuery = criteriaBuilder.createQuery(Recording.class);
            Root<Recording> recordingRoot = criteriaQuery.from(Recording.class);
            criteriaQuery.where(criteriaBuilder.equal(recordingRoot.get("meetingId"), meetingId));
            result = session.createQuery(criteriaQuery).getResultList();
            transaction.commit();
        } catch(Exception e) {
            if(transaction != null) {
                transaction.rollback();

                if(e instanceof NoResultException) logger.info("No results found.");
                else e.printStackTrace();
            }
        } finally {
            session.close();
        }

        return result;
    }

    public List<Recording> findRecordingsByState(String state) {
        logger.info("Attempting to find recordings with state {}", state);
        Session session = sessionFactory.openSession();
        Transaction transaction = null;
        List<Recording> result = null;

        try {
            transaction = session.beginTransaction();
            CriteriaBuilder criteriaBuilder = session.getCriteriaBuilder();
            CriteriaQuery<Recording> criteriaQuery = criteriaBuilder.createQuery(Recording.class);
            Root<Recording> recordingRoot = criteriaQuery.from(Recording.class);
            criteriaQuery.where(criteriaBuilder.equal(recordingRoot.get("state"), state));
            result = session.createQuery(criteriaQuery).getResultList();
            transaction.commit();
        } catch(Exception e) {
            if(transaction != null) {
                transaction.rollback();

                if(e instanceof NoResultException) logger.info("No results found.");
                else e.printStackTrace();
            }
        } finally {
            session.close();
        }

        return result;
    }

    public List<Metadata> findMetadataByFilter(String key, String value) {
        logger.info("Attempting to find metadata with key {} and value {}", key, value);
        Session session = sessionFactory.openSession();
        Transaction transaction = null;
        List<Metadata> result = null;

        try {
            transaction = session.beginTransaction();
            CriteriaBuilder criteriaBuilder = session.getCriteriaBuilder();
            CriteriaQuery<Metadata> criteriaQuery = criteriaBuilder.createQuery(Metadata.class);
            Root<Metadata> metadataRoot = criteriaQuery.from(Metadata.class);
            Predicate predicateForKey = criteriaBuilder.equal(metadataRoot.get("key"), key);
            Predicate predicateForValue = criteriaBuilder.equal(metadataRoot.get("value"), value);
            criteriaQuery.where(criteriaBuilder.and(predicateForKey, predicateForValue));
            result = session.createQuery(criteriaQuery).getResultList();
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

    public <T> void delete(T entity) {
        logger.info("Attempting to delete {}", entity);
        Session session = sessionFactory.openSession();
        Transaction transaction = null;

        try {
            transaction = session.beginTransaction();
            session.delete(entity);
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

    public void truncateTables() {
        logger.info("Attempting to truncate tables");

        List<Recording> recordings = findAll(Recording.class);

        if(recordings != null) {
            for(Recording recording: recordings) {
                delete(recording);
            }
        }
    }
}
