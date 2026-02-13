package com.ticketmanagement.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.ticketmanagement.model.TicketAuditLog;

@Repository
public interface TicketAuditLogRepository extends JpaRepository<TicketAuditLog, Long> {
    List<TicketAuditLog> findByTicketIdOrderByTimestampDesc(Long ticketId);
}
