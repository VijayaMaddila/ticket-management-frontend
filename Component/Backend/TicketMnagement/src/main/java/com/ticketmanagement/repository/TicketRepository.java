package com.ticketmanagement.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import com.ticketmanagement.model.Ticket;
import com.ticketmanagement.model.User;

@Repository
public interface TicketRepository  extends JpaRepository<Ticket,Long>,JpaSpecificationExecutor<Ticket> {

	List<Ticket> findByAssignedToIsNull();

	List<Ticket> findByAssignedTo(User user);

	List<Ticket> findByRequester(User requester);

}
