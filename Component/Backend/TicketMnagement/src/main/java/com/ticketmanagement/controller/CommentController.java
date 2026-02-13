package com.ticketmanagement.controller;

import com.ticketmanagement.model.TicketComment;
import com.ticketmanagement.model.Ticket;
import com.ticketmanagement.model.User;
import com.ticketmanagement.repository.TicketRepository;
import com.ticketmanagement.repository.UserRepository;
import com.ticketmanagement.service.CommentService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.util.List;

@RestController
@RequestMapping("/api/comments")
@CrossOrigin(origins = "http://localhost:5173")
public class CommentController {

	@Autowired
    private  CommentService commentService;
	@Autowired
    private TicketRepository ticketRepository;
	@Autowired
	private UserRepository userRepository;


    // Get all comments for a ticket
    @GetMapping("/ticket/{ticketId}")
    public List<TicketComment> getCommentsByTicket(@PathVariable Long ticketId) {

        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> 
                    new ResponseStatusException(HttpStatus.NOT_FOUND, "Ticket not found")
                );

        return commentService.getCommentsByTicketId(ticketId);
    }

    // Add a new comment to a ticket
    @PostMapping("/ticket/{ticketId}")
    public TicketComment addComment(
            @PathVariable Long ticketId,
            @RequestBody TicketComment comment) {

        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> 
                    new ResponseStatusException(HttpStatus.NOT_FOUND, "Ticket not found")
                );

        if (comment.getComment() == null || comment.getComment().trim().isEmpty()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Comment cannot be empty");
        }

        if (comment.getUser() == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "User is required");
        }
        User user = userRepository.findById(comment.getUser().getId())
                .orElseThrow(() ->
                        new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        comment.setTicket(ticket);
        comment.setUser(user);

        return commentService.addComment(comment);
    }
    @DeleteMapping("/{commentId}/user/{userId}")
    public String deleteComment(
            @PathVariable Long commentId,
            @PathVariable Long id) {

        TicketComment comment = commentService.getCommentById(commentId);

        if (comment == null) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND, "Comment not found");
        }

        if (!comment.getUser().getId().equals(id)) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN, "You cannot delete this comment");
        }

        commentService.deleteComment(commentId);
        return "Comment deleted successfully";
    }

    }

