package com.ticketmanagement.controller;

import java.security.Principal;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.ticketmanagement.model.Ticket;
import com.ticketmanagement.service.TicketService;

@RestController
@RequestMapping("/api/tickets")
@CrossOrigin(origins = "http://localhost:5173")
public class TicketController {

    @Autowired
    private TicketService ticketService;

    @PostMapping
    public ResponseEntity<Ticket> createTicket(@RequestBody Ticket ticket) {
        Ticket createdTicket = ticketService.createTicket(ticket);
        return ResponseEntity.ok(createdTicket);
    }

   
    @GetMapping
    public ResponseEntity<List<Ticket>> getAllTickets() {
        return ResponseEntity.ok(ticketService.getAllTickets());
    }

    
    @GetMapping("/{ticketId}")
    public ResponseEntity<Ticket> getTicket(@PathVariable Long ticketId) {
        return ResponseEntity.ok(ticketService.getTicket(ticketId));
    }

    
    @GetMapping("/assigned-to/{userId}")
    public ResponseEntity<List<Ticket>> getTicketsAssignedToUser(
            @PathVariable Long userId) {

        List<Ticket> tickets = ticketService.getTicketsAssignedToUser(userId);
        return ResponseEntity.ok(tickets);
    }


    @PutMapping("/{ticketId}/assign/{userId}")
    public ResponseEntity<Ticket> assignTicket(
            @PathVariable Long ticketId,
            @PathVariable Long userId,
            Principal principal) {

        String assignedBy =
                principal != null ? principal.getName() : "Admin";

        Ticket updatedTicket =
                ticketService.assignTicket(ticketId, userId, assignedBy);

        return ResponseEntity.ok(updatedTicket);
    }

    @PutMapping("/{ticketId}/status")
    public ResponseEntity<Ticket> updateTicketStatus(
            @PathVariable Long ticketId,
            @RequestParam String status,
            @RequestParam Long userId) {

        Ticket updatedTicket =
                ticketService.updateTicketStatus(ticketId, status, userId);

        return ResponseEntity.ok(updatedTicket);
    }
}
