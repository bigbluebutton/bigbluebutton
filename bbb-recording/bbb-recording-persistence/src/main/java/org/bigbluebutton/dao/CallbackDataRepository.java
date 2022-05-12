package org.bigbluebutton.dao;

import org.bigbluebutton.entity.CallbackData;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CallbackDataRepository extends JpaRepository<CallbackData, Long> {
}
