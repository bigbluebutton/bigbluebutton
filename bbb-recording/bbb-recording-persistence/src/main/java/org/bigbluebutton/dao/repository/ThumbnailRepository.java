package org.bigbluebutton.dao.repository;

import org.bigbluebutton.dao.entity.Thumbnail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ThumbnailRepository extends JpaRepository<Thumbnail, Long> {
}
