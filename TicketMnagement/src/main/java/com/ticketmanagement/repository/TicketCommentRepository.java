package com.ticketmanagement.repository;

import com.ticketmanagement.model.Ticket;
import com.ticketmanagement.model.TicketComment;
import com.ticketmanagement.model.role.CommentVisibility;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TicketCommentRepository extends JpaRepository<TicketComment, Long> {
    
    // Find all comments for a ticket
    List<TicketComment> findByTicketOrderByCreatedAtAsc(Ticket ticket);
    
    // Find comments by visibility
    List<TicketComment> findByTicketAndVisibilityOrderByCreatedAtAsc(
        Ticket ticket, 
        CommentVisibility visibility
    );
    
    // Count comments for a ticket
    long countByTicket(Ticket ticket);

	List<TicketComment> findByTicket(Ticket ticket);
}
