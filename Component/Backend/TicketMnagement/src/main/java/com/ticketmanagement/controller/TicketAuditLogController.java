package com.ticketmanagement.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ticketmanagement.model.TicketAuditLog;
import com.ticketmanagement.service.TicketAuditLogService;

@RestController
@RequestMapping("/api/tickets/audit")
@CrossOrigin(origins = "http://localhost:5173")
public class TicketAuditLogController {

    private final TicketAuditLogService auditLogService;

    public TicketAuditLogController(TicketAuditLogService auditLogService) {
        this.auditLogService = auditLogService;
    }

    @GetMapping("/{ticketId}")
    public ResponseEntity<List<TicketAuditLog>> getAuditHistory(@PathVariable Long ticketId) {
        return ResponseEntity.ok(auditLogService.getTicketHistory(ticketId));
    }
}
