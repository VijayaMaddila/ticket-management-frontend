package com.ticketmanagement.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import com.ticketmanagement.model.Ticket;
import com.ticketmanagement.model.User;
import com.ticketmanagement.model.role.Priority;
import com.ticketmanagement.model.role.RequestType;
import com.ticketmanagement.model.role.Role;
import com.ticketmanagement.model.role.Status;
import com.ticketmanagement.repository.TicketRepository;
import com.ticketmanagement.repository.UserRepository;

@Service
public class TicketService {

    @Autowired
    private TicketRepository ticketRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TicketAuditLogService auditLogService;

    @Autowired
    private EmailService emailService;
    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    private User resolveRequester(User requesterInput) {

        if (requesterInput == null) {
            throw new RuntimeException("Requester is required");
        }

        
        if (requesterInput.getId() != null) {
            return userRepository.findById(requesterInput.getId())
                    .orElseThrow(() -> new RuntimeException("Requester not found"));
        }

       
        if (requesterInput.getEmail() != null && !requesterInput.getEmail().isEmpty()) {
            return userRepository.findByEmail(requesterInput.getEmail())
                    .orElseGet(() -> {
                        User newUser = new User();
                        newUser.setEmail(requesterInput.getEmail());
                        newUser.setName(
                                requesterInput.getName() != null
                                        ? requesterInput.getName()
                                        : requesterInput.getEmail().split("\\d")[0]
                                       
                        );
                        newUser.setRole(Role.requester);
                        newUser.setPassword(passwordEncoder.encode("Segmento@2004"));
                        return userRepository.save(newUser);
                    });
        }

        throw new RuntimeException("Requester ID or Email is required");
    }

    public Ticket createTicket(Ticket ticket) {

        User requester = resolveRequester(ticket.getRequester());

        ticket.setRequester(requester);

        if (ticket.getStatus() == null) ticket.setStatus(Status.OPEN);
        if (ticket.getPriority() == null) ticket.setPriority(Priority.LOW);
        if (ticket.getRequestType() == null) ticket.setRequestType(RequestType.ACCESS);
        if (ticket.getCreatedAt() == null) ticket.setCreatedAt(LocalDateTime.now());

        Ticket savedTicket = ticketRepository.save(ticket);

        // 🧾 Audit log
        auditLogService.logChange(
                savedTicket.getId(),
                "TICKET_CREATED",
                null,
                "Ticket created with status " + savedTicket.getStatus(),
                requester.getId()
        );

        // 📧 Mail to requester
        if (requester.getEmail() != null && !requester.getEmail().isEmpty()) {
            emailService.sendMail(
                    requester.getEmail(),
                    "Ticket Created Successfully : " + savedTicket.getId(),
                    "Hello " + requester.getName() + ",\n\n" +
                            "Your ticket has been created successfully.\n\n" +
                            "Ticket ID   : " + savedTicket.getId() + "\n" +
                            "Title       : " + savedTicket.getTitle() + "\n" +
                            "Priority    : " + savedTicket.getPriority() + "\n" +
                            "Status      : " + savedTicket.getStatus() + "\n" +
                            "Assigned To : " + (savedTicket.getAssignedTo() != null ? savedTicket.getAssignedTo().getName() : "Not assigned yet") + "\n" +
                            "Due Date    : " + (savedTicket.getDueDate() != null ? savedTicket.getDueDate(): "Not set") + "\n\n" +
                            "Thank you,\nSegmento Resolve"
            );
        }

        return savedTicket;
    }
    private String parseDueDate(String dueDateStr) {
        if (dueDateStr == null || dueDateStr.isEmpty()) return "";
        String[] patterns = {"d/M/yyyy", "dd/MM/yyyy", "yyyy-MM-dd"}; 
        for (String pattern : patterns) {
            try {
                LocalDate date = LocalDate.parse(dueDateStr.trim(), DateTimeFormatter.ofPattern(pattern));
                return date.toString(); // ISO format yyyy-MM-dd
            } catch (Exception ignored) {}
        }
        return ""; // unable to parse
    }

    public Ticket createTicketFromEmail(
            String requesterEmail,
            String title,
            String description,
            String statusStr,
            String priorityStr,
            String requestTypeStr,
            String assignedToStr,
            String dueDateStr
    ) {
        Ticket ticket = new Ticket();

        ticket.setTitle(title.isEmpty() ? "No Subject" : title);
        ticket.setDescription(description);

        // Set requester
        User requester = new User();
        requester.setEmail(requesterEmail);
        ticket.setRequester(requester);

        // Priority
        if (!priorityStr.isEmpty()) {
            try {
                ticket.setPriority(Priority.valueOf(priorityStr.toUpperCase()));
            } catch (Exception e) {
                ticket.setPriority(Priority.LOW);
            }
        } else {
            ticket.setPriority(Priority.LOW);
        }

        // Request Type
        if (!requestTypeStr.isEmpty()) {
            try {
                ticket.setRequestType(RequestType.valueOf(requestTypeStr.toUpperCase()));
            } catch (Exception e) {
                ticket.setRequestType(RequestType.ACCESS);
            }
        } else {
            ticket.setRequestType(RequestType.ACCESS);
        }

        // Status
        if (!statusStr.isEmpty()) {
            try {
                ticket.setStatus(Status.valueOf(statusStr.toUpperCase()));
            } catch (Exception e) {
                ticket.setStatus(Status.OPEN);
            }
        } else {
            ticket.setStatus(Status.OPEN);
        }

        // Assigned To
        if (!assignedToStr.isEmpty() && !assignedToStr.equalsIgnoreCase("Not assigned yet")) {
            User assignee = userRepository.findByEmail(assignedToStr).orElse(null);
            ticket.setAssignedTo(assignee);
        }

     // Due Date
        if (!dueDateStr.isEmpty()) {
            String parsedDueDate = parseDueDate(dueDateStr);
            if (!parsedDueDate.isEmpty()) {
                ticket.setDueDate(LocalDate.parse(parsedDueDate));
            } else {
                System.err.println("⚠️ Unable to parse Due Date: " + dueDateStr);
            }
        }



        return createTicket(ticket);
    }

    public Ticket updateTicketStatus(Long ticketId, String statusStr, Long userId) {

        Ticket ticket = getTicket(ticketId);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!user.equals(ticket.getAssignedTo())) {
            throw new RuntimeException("You are not assigned to this ticket");
        }

        Status oldStatus = ticket.getStatus();
        Status newStatus;

        try {
            newStatus = Status.valueOf(statusStr.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid status");
        }

        ticket.setStatus(newStatus);
        Ticket updatedTicket = ticketRepository.save(ticket);

        // 🧾 Audit log
        auditLogService.logChange(
                ticketId,
                "STATUS_CHANGED",
                oldStatus.name(),
                newStatus.name(),
                userId
        );

        // 📧 Mail to requester
        User requester = updatedTicket.getRequester();
        if (requester != null && requester.getEmail() != null) {
            emailService.sendMail(
                    requester.getEmail(),
                    "Ticket Status Updated",
                    "Hello " + requester.getName() + ",\n\n" +
                            "Your ticket status has been updated.\n\n" +
                            "Ticket ID       : " + updatedTicket.getId() + "\n" +
                            "Title           : " + updatedTicket.getTitle() + "\n" +
                            "Previous Status : " + oldStatus + "\n" +
                            "Current Status  : " + newStatus + "\n\n" +
                            "Regards,\nSegmento Resolve"
            );
        }

        return updatedTicket;
    }

    public List<Ticket> getAllTickets() {
        return ticketRepository.findAll();
    }

    public List<Ticket> getUnassignedTickets() {
        return ticketRepository.findByAssignedToIsNull();
    }

    public Ticket getTicket(Long ticketId) {
        return ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));
    }

    public List<Ticket> getTicketsAssignedToUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ticketRepository.findByAssignedTo(user);
    }

    public Ticket assignTicket(Long ticketId, Long assigneeId, String assignedBy) {

        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        User assignee = userRepository.findById(assigneeId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        User oldAssignee = ticket.getAssignedTo();
        User requester = ticket.getRequester();

        ticket.setAssignedTo(assignee);
        ticket.setStatus(Status.INPROGRESS);

        Ticket savedTicket = ticketRepository.save(ticket);

        // 📧 Mail to assignee
        if (oldAssignee == null || !oldAssignee.getId().equals(assignee.getId())) {
            emailService.sendMail(
                    assignee.getEmail(),
                    "New Ticket Assigned",
                    "Hello " + assignee.getName() + ",\n\n" +
                            "A ticket has been assigned to you.\n\n" +
                            "Ticket Title : " + savedTicket.getTitle() + "\n" +
                            "Assigned By  : " + assignedBy + "\n\n" +
                            "Regards,\nSegmento Resolve"
            );
        }

        // 📧 Mail to requester
        if (requester != null && requester.getEmail() != null) {
            emailService.sendMail(
                    requester.getEmail(),
                    "Your Ticket Is Now In Progress",
                    "Hello " + requester.getName() + ",\n\n" +
                            "Your ticket is now being worked on.\n\n" +
                            "Ticket ID   : " + savedTicket.getId() + "\n" +
                            "Title       : " + savedTicket.getTitle() + "\n" +
                            "Status      : " + savedTicket.getStatus() + "\n" +
                            "Assigned To : " + assignee.getName() + "\n\n" +
                            "Regards,\nSegmento Resolve"
            );
        }

        return savedTicket;
    }
}
