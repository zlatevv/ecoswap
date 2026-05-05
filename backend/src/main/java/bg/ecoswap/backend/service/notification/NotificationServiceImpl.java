package bg.ecoswap.backend.service.notification;

import bg.ecoswap.backend.dto.NotificationEvent;
import bg.ecoswap.backend.model.Notification;
import bg.ecoswap.backend.repository.NotificationRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.transaction.Transactional;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class NotificationServiceImpl implements NotificationService {
    private final NotificationRepository notificationRepository;
    private final RabbitTemplate rabbitTemplate;
    private final ObjectMapper objectMapper;

    public NotificationServiceImpl(NotificationRepository notificationRepository, RabbitTemplate rabbitTemplate, ObjectMapper objectMapper) {
        this.notificationRepository = notificationRepository;
        this.rabbitTemplate = rabbitTemplate;
        this.objectMapper = objectMapper;
    }

    @Override
    public void createNotification(NotificationEvent event) {
        Notification notification = new Notification();

        notification.setUsername(event.getUsername());
        notification.setMessage(event.getMessage());
        notification.setTitle(event.getTitle());

        notificationRepository.save(notification);

        String targetEmail = event.getEmail();

        if (targetEmail != null && !targetEmail.isEmpty()) {
            sendEmailToNodeJs(targetEmail, event.getTitle(), event.getMessage());
        } else {
            System.out.println("⚠️ Няма имейл адрес за потребител " + event.getUsername() + ". Имейл няма да бъде изпратен.");
        }
    }

    private void sendEmailToNodeJs(String targetEmail, String title, String message) {
        try {
            Map<String, String> emailData = new HashMap<>();
            emailData.put("targetEmail", targetEmail);
            emailData.put("title", title);
            emailData.put("message", message);

            String jsonPayload = objectMapper.writeValueAsString(emailData);

            rabbitTemplate.convertAndSend("email_queue", jsonPayload);
            System.out.println("Съобщението за имейл е изпратено към RabbitMQ (email_queue)!");

        } catch (Exception e) {
            System.err.println("Грешка при пращане към RabbitMQ: " + e.getMessage());
        }
    }

    @Override
    public List<Notification> getUserNotifications(String username) {
        return notificationRepository.findByUsernameOrderByCreatedAtDesc(username);
    }

    @Override
    @Transactional
    public void markNotificationAsRead(Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Error - no such notification"));

        notification.setRead(true);

        notificationRepository.save(notification);
    }
}
