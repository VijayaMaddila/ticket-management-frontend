package com.ticketmanagement.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ticketmanagement.model.Ticket;
import com.ticketmanagement.model.TicketComment;
import com.ticketmanagement.model.User;
import com.ticketmanagement.model.role.Role;
import com.ticketmanagement.repository.TicketCommentRepository;

@Service
@Transactional
public class CommentService {

    private final TicketCommentRepository commentRepository;
    private final TicketAuditLogService auditLogService;

    public CommentService(TicketCommentRepository commentRepository,
                          TicketAuditLogService auditLogService) {
        this.commentRepository = commentRepository;
        this.auditLogService = auditLogService;
    }

    // Add a new comment
    public TicketComment addComment(Ticket ticket, User user, String commentText, String visibility) {
        if (user == null) throw new RuntimeException("User is required");

        Role role = user.getRole();

        // Requesters can only add requester-visible comments
        if (role == Role.requester && !"requester".equalsIgnoreCase(visibility)) {
            throw new RuntimeException("Requesters cannot create internal comments");
        }

        // Only requester or datamember can comment
        if (role != Role.requester && role != Role.datamember) {
            throw new RuntimeException("Only Requester or Data Member can add comments");
        }

        // Create comment
        TicketComment comment = new TicketComment();
        comment.setTicket(ticket);
        comment.setCreatedBy(user);
        comment.setComment(commentText);
        comment.setVisibility(visibility.toLowerCase()); 
        comment.setCreatedAt(LocalDateTime.now());

        TicketComment savedComment = commentRepository.save(comment);

        //Audit log
        try {
            auditLogService.logChange(
                ticket.getId(),
                "COMMENT_ADDED",
                null,
                commentText,
                user.getId()
            );
        } catch (Exception e) {
            System.err.println("Failed to save audit log: " + e.getMessage());
        }

        return savedComment;
    }

    // Get comments based on user role
    public List<TicketComment> getComments(Ticket ticket, User user) {
        List<TicketComment> allComments = commentRepository.findByTicketOrderByCreatedAtAsc(ticket);

        if (user.getRole() == Role.requester) {
            
            return allComments.stream()
                    .filter(c -> "requester".equalsIgnoreCase(c.getVisibility()))
                    .toList();
        }
        
        return allComments;
    }
}
