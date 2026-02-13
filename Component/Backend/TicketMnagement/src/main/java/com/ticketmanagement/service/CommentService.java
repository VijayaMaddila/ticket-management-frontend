package com.ticketmanagement.service;

import com.ticketmanagement.model.TicketComment;

import com.ticketmanagement.repository.TicketCommentRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class CommentService {
	
	@Autowired
    private  TicketCommentRepository commentRepository;

   

    public List<TicketComment> getCommentsByTicketId(Long ticketId) {
        return commentRepository.findByTicketId(ticketId);
    }

    public TicketComment addComment(TicketComment comment) {
        // createdAt is automatically set in entity
        return commentRepository.save(comment);
    }
   
    public void deleteComment(Long id)
    {
    	commentRepository.deleteById(id);
    }

	public TicketComment getCommentById(Long commentId) {
		
		return commentRepository.findById(commentId).orElse(null);
	}
}
