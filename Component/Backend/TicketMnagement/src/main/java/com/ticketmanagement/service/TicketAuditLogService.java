package com.ticketmanagement.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import com.ticketmanagement.model.TicketAuditLog;
import com.ticketmanagement.repository.TicketAuditLogRepository;

@Service
public class TicketAuditLogService {

    private final TicketAuditLogRepository auditLogRepository;

    public TicketAuditLogService(TicketAuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

   
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public TicketAuditLog logChange(Long ticketId, String action, String oldValue, String newValue, Long updatedBy) {
        TicketAuditLog log = new TicketAuditLog();
        log.setTicketId(ticketId);
        log.setAction(action);
        log.setOldValue(oldValue);
        log.setNewValue(newValue);
        log.setUpdatedBy(updatedBy);
        log.setTimestamp(LocalDateTime.now());

        return auditLogRepository.save(log);
    }

        public List<TicketAuditLog> getTicketHistory(Long ticketId) {
        return auditLogRepository.findByTicketIdOrderByTimestampDesc(ticketId);
    }
}
