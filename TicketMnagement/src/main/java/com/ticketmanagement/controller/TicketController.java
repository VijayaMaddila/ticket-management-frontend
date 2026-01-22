package com.ticketmanagement.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.ticketmanagement.model.Ticket;
import com.ticketmanagement.model.TicketComment;
import com.ticketmanagement.model.User;
import com.ticketmanagement.service.TicketService;
import com.ticketmanagement.service.CommentService;

@RestController
@RequestMapping("/api/tickets")
@CrossOrigin(origins = "http://localhost:5173")
public class TicketController {

    private final TicketService ticketService;
    private final CommentService commentService;

    public TicketController(TicketService ticketService, CommentService commentService) {
        this.ticketService = ticketService;
        this.commentService = commentService;
    }

  
    
    // CREATE TICKET (Requester)
    @PostMapping
    public ResponseEntity<Ticket> createTicket(@RequestBody Ticket ticket) {
        Ticket createdTicket = ticketService.createTicket(ticket);
        return ResponseEntity.ok(createdTicket);
    }


    // GET ALL TICKETS (Admin)
    @GetMapping
    public ResponseEntity<List<Ticket>> getAllTickets() {
        return ResponseEntity.ok(ticketService.getAllTickets());
    }

    // GET TICKETS ASSIGNED TO A DATA MEMBER
   
    @GetMapping("/assigned-to/{userId}")
    public ResponseEntity<List<Ticket>> getTicketsAssignedToUser(
            @PathVariable Long userId
    ) {
        List<Ticket> tickets = ticketService.getTicketsAssignedToUser(userId);
        return ResponseEntity.ok(tickets);
    }

    // GET TICKET BY ID
    
    @GetMapping("/{ticketId}")
    public ResponseEntity<Ticket> getTicket(
            @PathVariable Long ticketId
    ) {
        Ticket ticket = ticketService.getTicket(ticketId);
        return ResponseEntity.ok(ticket);
    }

   
    // ASSIGN TICKET (Admin  to Data Member)
   
    @PutMapping("/{ticketId}/assign/{userId}")
    public ResponseEntity<Ticket> assignTicket(
            @PathVariable Long ticketId,
            @PathVariable Long userId
    ) {
        Ticket updatedTicket = ticketService.assignTicket(ticketId, userId);
        return ResponseEntity.ok(updatedTicket);
    }

    // UPDATE TICKET STATUS (Data Member)
   
    @PutMapping("/{ticketId}/status")
    public ResponseEntity<Ticket> updateTicketStatus(
            @PathVariable Long ticketId,
            @RequestParam String status,
            @RequestParam Long userId
    ) {
        Ticket updatedTicket =
                ticketService.updateTicketStatus(ticketId, status, userId);
        return ResponseEntity.ok(updatedTicket);
    }

   
    // GET COMMENTS (Visibility Based)
   
    @GetMapping("/{ticketId}/comments")
    public ResponseEntity<List<TicketComment>> getComments(
            @PathVariable Long ticketId,
            @RequestHeader("user-id") Long userId
    ) {
        Ticket ticket = ticketService.getTicket(ticketId);
        User user = ticketService.getUserById(userId);
        List<TicketComment> comments = commentService.getComments(ticket, user);
        return ResponseEntity.ok(comments);
    }

   
    // ADD COMMENT
   
    @PostMapping("/{ticketId}/comments")
    public ResponseEntity<TicketComment> addComment(
            @PathVariable Long ticketId,
            @RequestBody CommentRequest request,
            @RequestHeader("user-id") Long userId
    ) {
        Ticket ticket = ticketService.getTicket(ticketId);
        User user = ticketService.getUserById(userId);

        TicketComment comment = commentService.addComment(
                ticket,
                user,
                request.getComment(),
                request.getVisibility()
        );
        return ResponseEntity.ok(comment);
    }

    
    // COMMENT REQUEST DTO
    
    public static class CommentRequest {
        private String comment;
        private String visibility;

        public String getComment() {
            return comment;
        }

        public void setComment(String comment) {
            this.comment = comment;
        }

        public String getVisibility() {
            return visibility;
        }

        public void setVisibility(String visibility) {
            this.visibility = visibility;
        }
    }
}
