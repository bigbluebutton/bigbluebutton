package org.bigbluebutton.dao.repository;

import org.bigbluebutton.dao.entity.CallbackData;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CallbackDataRepository extends JpaRepository<CallbackData, Long> {
}
