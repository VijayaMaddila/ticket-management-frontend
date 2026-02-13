package com.ticketmanagement.model;


import java.time.LocalDateTime;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

@Entity
public class TicketAuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long ticketId;

    private String action; 

    private String oldValue;
    private String newValue;

    private Long updatedBy; 

    private LocalDateTime timestamp;
    
    
    public TicketAuditLog()
    {
    	
    }


	public TicketAuditLog(Long id, Long ticketId, String action, String oldValue, String newValue, Long updatedBy,
			LocalDateTime timestamp) {
		super();
		this.id = id;
		this.ticketId = ticketId;
		this.action = action;
		this.oldValue = oldValue;
		this.newValue = newValue;
		this.updatedBy = updatedBy;
		this.timestamp = timestamp;
	}


	public Long getId() {
		return id;
	}


	public void setId(Long id) {
		this.id = id;
	}


	public Long getTicketId() {
		return ticketId;
	}


	public void setTicketId(Long ticketId) {
		this.ticketId = ticketId;
	}


	public String getAction() {
		return action;
	}


	public void setAction(String action) {
		this.action = action;
	}


	public String getOldValue() {
		return oldValue;
	}


	public void setOldValue(String oldValue) {
		this.oldValue = oldValue;
	}


	public String getNewValue() {
		return newValue;
	}


	public void setNewValue(String newValue) {
		this.newValue = newValue;
	}


	public Long getUpdatedBy() {
		return updatedBy;
	}


	public void setUpdatedBy(Long updatedBy) {
		this.updatedBy = updatedBy;
	}


	public LocalDateTime getTimestamp() {
		return timestamp;
	}


	public void setTimestamp(LocalDateTime timestamp) {
		this.timestamp = timestamp;
	}
    

    
}
