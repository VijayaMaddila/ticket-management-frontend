package com.ticketmanagement.controller;


import java.util.List;

import org.springframework.web.bind.annotation.*;

import com.ticketmanagement.model.Ticket;
import com.ticketmanagement.model.TicketComment;
import com.ticketmanagement.model.User;
import com.ticketmanagement.service.CommentService;
import com.ticketmanagement.service.TicketService;

@RestController
@RequestMapping("/api/comments")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class CommentController {

    private final CommentService commentService;
    private final TicketService ticketService;

    public CommentController(CommentService commentService, TicketService ticketService) {
        this.commentService = commentService;
        this.ticketService = ticketService;
    }

    // Get all comments for a ticket 
    @GetMapping("/ticket/{ticketId}")
    public List<TicketComment> getComments(
            @PathVariable Long ticketId,
            @RequestHeader("user-id") Long userId 
    ) {
        Ticket ticket = ticketService.getTicket(ticketId);
        User user = ticketService.getUserById(userId);

        
        return commentService.getComments(ticket, user);
    }

    
    @PostMapping("/ticket/{ticketId}")
    public TicketComment addComment(
            @PathVariable Long ticketId,
            @RequestBody CommentRequest request,
            @RequestHeader("user-id") Long userId 
    ) {
        Ticket ticket = ticketService.getTicket(ticketId);
        User user = ticketService.getUserById(userId);

        // Add comment with role-based rules
        return commentService.addComment(
                ticket,
                user,
                request.getComment(),
                request.getVisibility() 
        );
    }

    
    public static class CommentRequest {
        private String comment;
        private String visibility; 

        public String getComment() { return comment; }
        public void setComment(String comment) { this.comment = comment; }

        public String getVisibility() { return visibility; }
        public void setVisibility(String visibility) { this.visibility = visibility; }
    }
}
