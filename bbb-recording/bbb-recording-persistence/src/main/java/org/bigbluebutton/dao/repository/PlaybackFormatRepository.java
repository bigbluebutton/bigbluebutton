package org.bigbluebutton.dao.repository;

import org.bigbluebutton.dao.entity.PlaybackFormat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PlaybackFormatRepository extends JpaRepository<PlaybackFormat, Long> {
}
