package com.ticketmanagement.repository;

import com.ticketmanagement.model.Ticket;
import com.ticketmanagement.model.TicketComment;
import com.ticketmanagement.model.role.CommentVisibility;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TicketCommentRepository extends JpaRepository<TicketComment, Long> {
    
    

	List<TicketComment> findByTicketId(Long ticketId);
}
