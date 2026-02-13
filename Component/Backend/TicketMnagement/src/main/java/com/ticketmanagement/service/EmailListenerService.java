package com.ticketmanagement.service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.Properties;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import jakarta.mail.Flags;
import jakarta.mail.Folder;
import jakarta.mail.Message;
import jakarta.mail.MessagingException;
import jakarta.mail.Multipart;
import jakarta.mail.Part;
import jakarta.mail.Session;
import jakarta.mail.Store;
import jakarta.mail.internet.InternetAddress;
import jakarta.mail.search.FlagTerm;

@Service
public class EmailListenerService {

    @Autowired
    private TicketService ticketService;

    @Value("${spring.mail.username}")
    private String username; 

    @Value("${spring.mail.password}")
    private String password;

    @Value("${mail.imap.host}")
    private String imapHost;

    @Value("${mail.imap.port}")
    private String imapPort;

    @Scheduled(fixedDelay = 6)
    public void checkEmail() {
        System.out.println("📩 Email listener triggered");

        Store store = null;
        Folder inbox = null;

        try {
            Properties props = new Properties();
            props.put("mail.store.protocol", "imaps");
            props.put("mail.imaps.host", imapHost);
            props.put("mail.imaps.port", imapPort);
            props.put("mail.imaps.ssl.enable", "true");
            props.put("mail.imaps.auth", "true");

            Session session = Session.getInstance(props);
            store = session.getStore("imaps");
            store.connect(imapHost, username, password);
            System.out.println("✅ IMAP LOGIN SUCCESS");

            inbox = store.getFolder("INBOX");
            if (!inbox.isOpen()) inbox.open(Folder.READ_WRITE);

           
            Message[] messages = inbox.search(new FlagTerm(new Flags(Flags.Flag.SEEN), false));
            System.out.println("📨 New mails found: " + messages.length);

            for (Message message : messages) {
                try {
                    String from = ((InternetAddress) message.getFrom()[0]).getAddress();

                    // ⚠️ Skip system emails to prevent duplicate ticket creation
                    if (from.equalsIgnoreCase(username)) {
                        System.out.println("⚠️ Ignored system email from: " + from);
                        message.setFlag(Flags.Flag.SEEN, true); // mark as read
                        continue;
                    }

                    String body = getTextFromMessage(message);

                    // Extract fields
                    String title       = extractField(body, "Title");
                    String description = extractMultiLineField(body, "Description");
                    String status      = extractField(body, "Status");
                    String priority    = extractField(body, "Priority");
                    String requestType = extractField(body, "Request Type");
                    String assignedTo  = extractField(body, "Assigned To");
                    String dueDate     = extractField(body, "Due Date");

                    if (assignedTo.equalsIgnoreCase("Not assigned yet")) assignedTo = "";

                    String parsedDueDate = parseDueDate(dueDate);

                    // Create ticket
                    ticketService.createTicketFromEmail(
                            from, title, description, status, priority, requestType, assignedTo, parsedDueDate
                    );

                    // Mark as read
                    message.setFlag(Flags.Flag.SEEN, true);

                } catch (Exception e) {
                    System.err.println("⚠️ Failed to process email: " + e.getMessage());
                    e.printStackTrace();
                }
            }

        } catch (MessagingException e) {
            System.err.println("⚠️ Mail server error: " + e.getMessage());
            e.printStackTrace();
        } catch (Exception e) {
            System.err.println("⚠️ Unexpected error: " + e.getMessage());
            e.printStackTrace();
        } finally {
            try {
                if (inbox != null && inbox.isOpen()) inbox.close(false);
                if (store != null && store.isConnected()) store.close();
            } catch (Exception e) {
                System.err.println("⚠️ Failed to close mail resources: " + e.getMessage());
            }
        }
    }

    // -------------------- Helper Methods --------------------

    private String getTextFromMessage(Message message) throws Exception {
        if (message.isMimeType("text/plain")) {
            return message.getContent().toString();
        } else if (message.isMimeType("text/html")) {
            return message.getContent().toString().replaceAll("\\<.*?\\>", "");
        } else if (message.isMimeType("multipart/*")) {
            Multipart multipart = (Multipart) message.getContent();
            for (int i = 0; i < multipart.getCount(); i++) {
                Part part = multipart.getBodyPart(i);
                if (part.isMimeType("text/plain")) return part.getContent().toString();
                if (part.isMimeType("text/html")) return part.getContent().toString().replaceAll("\\<.*?\\>", "");
            }
        }
        return "";
    }

    private String extractField(String body, String fieldName) {
        for (String line : body.split("\\r?\\n")) {
            line = line.trim();
            if (line.toLowerCase().startsWith(fieldName.toLowerCase())) {
                String[] parts = line.split(":", 2);
                if (parts.length > 1) return parts[1].trim();
            }
        }
        return "";
    }

    private String extractMultiLineField(String body, String fieldName) {
        StringBuilder value = new StringBuilder();
        boolean capture = false;

        for (String line : body.split("\\r?\\n")) {
            line = line.trim();
            if (line.toLowerCase().startsWith(fieldName.toLowerCase())) {
                String[] parts = line.split(":", 2);
                if (parts.length > 1) value.append(parts[1].trim());
                capture = true;
                continue;
            }
            if (capture) {
                if (line.matches("(?i)(Title|Description|Status|Priority|Request Type|Assigned To|Due Date)\\s*:.*")) break;
                value.append(" ").append(line);
            }
        }
        return value.toString().trim();
    }

    private String parseDueDate(String dueDateStr) {
        if (dueDateStr == null || dueDateStr.isEmpty()) return "";
        String[] patterns = {"d/M/yyyy", "dd/MM/yyyy", "yyyy-MM-dd"}; // added ISO format
        for (String pattern : patterns) {
            try {
                LocalDate date = LocalDate.parse(dueDateStr.trim(), DateTimeFormatter.ofPattern(pattern));
                return date.toString(); // ISO format yyyy-MM-dd
            } catch (DateTimeParseException ignored) {}
        }
        return ""; 
    }

}
