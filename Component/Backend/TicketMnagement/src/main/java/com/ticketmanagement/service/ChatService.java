package com.ticketmanagement.service;

import java.time.LocalDate;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.ticketmanagement.model.Ticket;
import com.ticketmanagement.model.User;
import com.ticketmanagement.model.role.ConversationState;
import com.ticketmanagement.model.role.Priority;
import com.ticketmanagement.model.role.RequestType;
import com.ticketmanagement.model.role.Role;

@Service
public class ChatService {

    @Autowired
    private TicketService ticketService;

    @Autowired
    private UserService userService;

    private Map<Long, ConversationState> userStates = new ConcurrentHashMap<>();
    private Map<Long, Ticket> userTickets = new ConcurrentHashMap<>();

    public String processMessage(Long userId, String message) {
        message = message.trim();
        ConversationState state = userStates.getOrDefault(userId, ConversationState.START);

        switch (state) {

            case START:
                userStates.put(userId, ConversationState.MENU);
                return """
                        Welcome 👋 to Segmento Resolve
                        1. Create Ticket
                        2. Check your ticket status
                        Enter option:
                        """;

            case MENU:
                User user = userService.getUser(userId);

                if (message.equals("1")) {
                    if (user == null) {
                        return "User not found ❌";
                    }
                    if (user.getRole() != Role.requester) {
                        return "Only requesters can create tickets ❌";
                    }

                    userTickets.remove(userId);
                    Ticket newTicket = new Ticket();
                    userTickets.put(userId, newTicket);
                    userStates.put(userId, ConversationState.ASK_TITLE);
                    return "Enter Title:";

                } else if (message.equals("2")) {
                    userStates.put(userId, ConversationState.ASK_TICKET_ID);
                    return "Enter Ticket ID:";

                } else {
                    return "Invalid option ❌ Enter 1 or 2.";
                }


            case ASK_TITLE: {
                Ticket ticket = userTickets.get(userId);
                if (ticket == null) return "Session expired. Please start again.";
                ticket.setTitle(message);
                userStates.put(userId, ConversationState.ASK_DESCRIPTION);
                return "Enter Description:";
            }

            case ASK_DESCRIPTION: {
                Ticket ticket = userTickets.get(userId);
                if (ticket == null) return "Session expired. Please start again.";
                ticket.setDescription(message);
                userStates.put(userId, ConversationState.ASK_REQUEST_TYPE);
                return """
                        Enter Request Type:
                        BUG
                        FEATURE
                        DATA_ACCESS
                        """;
            }

            case ASK_REQUEST_TYPE: {
                Ticket ticket = userTickets.get(userId);
                if (ticket == null) return "Session expired. Please start again.";

                try {
                    ticket.setRequestType(RequestType.valueOf(message.toUpperCase()));
                } catch (Exception e) {
                    return "Invalid Request Type ❌ Enter BUG / FEATURE / DATA_ACCESS";
                }

                userStates.put(userId, ConversationState.ASK_DUE_DATE);
                return "Enter Due Date (YYYY-MM-DD):";
            }

            case ASK_DUE_DATE: {
                Ticket ticket = userTickets.get(userId);
                if (ticket == null) return "Session expired. Please start again.";

                try {
                    LocalDate dueDate = LocalDate.parse(message);
                    if (dueDate.isBefore(LocalDate.now())) {
                        return "Due date cannot be in the past ❌ Enter future date (YYYY-MM-DD)";
                    }
                    ticket.setDueDate(dueDate);
                } catch (Exception e) {
                    return "Invalid date format ❌ Use YYYY-MM-DD";
                }

                userStates.put(userId, ConversationState.ASK_PRIORITY);
                return "Enter Priority (LOW / MEDIUM / HIGH):";
            }

            case ASK_PRIORITY: {
                Ticket ticket = userTickets.get(userId);
                if (ticket == null) return "Session expired. Please start again.";

                try {
                    ticket.setPriority(Priority.valueOf(message.toUpperCase()));
                } catch (Exception e) {
                    return "Invalid Priority ❌ Enter LOW / MEDIUM / HIGH";
                }
                
                User requester = userService.getUser(userId);
                if (requester == null) {
                    userStates.remove(userId);
                    userTickets.remove(userId);
                    return "User not found ❌";
                }

               

                ticket.setRequester(requester);
                ticketService.createTicket(ticket);

                
                userStates.remove(userId);
                userTickets.remove(userId);

                return "Ticket created successfully ✅";
            }

            case ASK_TICKET_ID: {
                Long ticketId;
                try {
                    ticketId = Long.parseLong(message);
                } catch (Exception e) {
                    return "Invalid Ticket ID ❌ Enter numeric ID.";
                }

                Ticket ticket = ticketService.getTicket(ticketId);
                if (ticket == null) return "Ticket not found ❌";

                if (!ticket.getRequester().getId().equals(userId)) {
                    return "You are not authorized to view this ticket ❌";
                    
                }

                userStates.remove(userId);

                return """
                        Ticket Details 📄
                        ID: """ + ticket.getId() + """
                        Title: """ + ticket.getTitle() + """
                        Status: """ + ticket.getStatus() + """
                        Priority: """ + ticket.getPriority() + """
                        Due Date: """ + ticket.getDueDate();
            }

            default:
                userStates.remove(userId);
                userTickets.remove(userId);
                return "Restarting...";
        }
    }
}
