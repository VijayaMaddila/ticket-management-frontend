package com.ticketmanagement.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ticketmanagement.model.Ticket;
import com.ticketmanagement.model.User;
import com.ticketmanagement.model.role.Role;
import com.ticketmanagement.model.role.Status;
import com.ticketmanagement.repository.TicketRepository;
import com.ticketmanagement.repository.UserRepository;

@Service
@Transactional
public class TicketService {

    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;
    private final TicketAuditLogService auditLogService; 

    public TicketService(TicketRepository ticketRepository,
                         UserRepository userRepository,
                         TicketAuditLogService auditLogService) { 
        this.ticketRepository = ticketRepository;
        this.userRepository = userRepository;
        this.auditLogService = auditLogService;
    }

    // CREATE TICKET (Requester) 
    public Ticket createTicket(Ticket ticket) {
        if (ticket.getRequester() == null || ticket.getRequester().getId() == null) {
            throw new RuntimeException("Requester is required");
        }

        User requester = userRepository.findById(ticket.getRequester().getId())
                .orElseThrow(() -> new RuntimeException("Requester not found"));

        ticket.setRequester(requester);
        ticket.setStatus(Status.OPEN);
        ticket.setAssignedTo(null);

        Ticket savedTicket = ticketRepository.save(ticket);

        // Audit log for creation
        auditLogService.logChange(
            savedTicket.getId(),
            "TICKET_CREATED",
            null,
            "Ticket created with status OPEN",
            requester.getId()
        );

        return savedTicket;
    }

    // ASSIGN TICKET (Admin → Data Member)
    public Ticket assignTicket(Long ticketId, Long userId) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        User assignee = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (assignee.getRole() != Role.datamember) {
            throw new RuntimeException("Ticket can only be assigned to a Data Member");
        }

        User oldAssignee = ticket.getAssignedTo();
        String oldValue = oldAssignee != null ? oldAssignee.getId().toString() : null;

        ticket.setAssignedTo(assignee);
        ticket.setStatus(Status.INPROGRESS);
        Ticket updatedTicket = ticketRepository.save(ticket);

        // Audit log for assignment
        auditLogService.logChange(
            ticketId,
            "ASSIGNED",
            oldValue,
            assignee.getId().toString(),
            userId // Admin ID
        );

        return updatedTicket;
    }

    // UPDATE TICKET STATUS (Data Member)
    public Ticket updateTicketStatus(Long ticketId, String statusStr, Long userId) {
        Ticket ticket = getTicket(ticketId);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!user.equals(ticket.getAssignedTo())) {
            throw new RuntimeException("You are not assigned to this ticket");
        }

        Status oldStatus = ticket.getStatus();
        Status status;
        try {
            status = Status.valueOf(statusStr.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid status");
        }

        ticket.setStatus(status);
        Ticket updatedTicket = ticketRepository.save(ticket);

        // Audit log for status change
        auditLogService.logChange(
            ticketId,
            "STATUS_CHANGED",
            oldStatus.name(),
            updatedTicket.getStatus().name(),
            userId
        );

        return updatedTicket;
    }

    // GET ALL TICKETS (Admin) 
    public List<Ticket> getAllTickets() {
        return ticketRepository.findAll();
    }

    //GET UNASSIGNED TICKETS 
    public List<Ticket> getUnassignedTickets() {
        return ticketRepository.findByAssignedToIsNull();
    }

    // GET TICKET BY ID 
    public Ticket getTicket(Long ticketId) {
        return ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));
    }

    //GET TICKETS ASSIGNED TO A USER
    public List<Ticket> getTicketsAssignedToUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ticketRepository.findByAssignedTo(user);
    }

    //GET USER BY ID
    public User getUserById(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}
