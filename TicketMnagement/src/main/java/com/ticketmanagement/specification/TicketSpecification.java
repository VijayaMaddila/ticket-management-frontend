package com.ticketmanagement.specification;

import org.springframework.data.jpa.domain.Specification;

import com.ticketmanagement.model.Ticket;
import com.ticketmanagement.model.User;
import com.ticketmanagement.model.role.Priority;
import com.ticketmanagement.model.role.RequestType;
import com.ticketmanagement.model.role.Status;

public class TicketSpecification {

    public static Specification<Ticket> hasStatus(Status status) {
        return (root, query, cb) -> cb.equal(root.get("status"), status);
    }

    public static Specification<Ticket> hasPriority(Priority priority) {
        return (root, query, cb) -> cb.equal(root.get("priority"), priority);
    }

    public static Specification<Ticket> hasRequestType(RequestType requestType) {
        return (root, query, cb) -> cb.equal(root.get("requestType"), requestType);
    }

    public static Specification<Ticket> hasAssignedTo(User assignedTo) {
        return (root, query, cb) -> cb.equal(root.get("assignedTo"), assignedTo);
    }

    public static Specification<Ticket> hasRequester(User requester) {
        return (root, query, cb) -> cb.equal(root.get("requester"), requester);
    }
}
