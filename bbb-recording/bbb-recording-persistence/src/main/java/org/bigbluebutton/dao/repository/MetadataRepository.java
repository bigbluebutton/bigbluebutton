package org.bigbluebutton.dao.repository;

import org.bigbluebutton.dao.entity.Metadata;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MetadataRepository extends JpaRepository<Metadata, Long> {

    List<Metadata> findByKeyAndValue(String key, String value);
}
