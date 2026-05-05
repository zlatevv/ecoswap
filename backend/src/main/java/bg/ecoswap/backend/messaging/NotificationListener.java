package bg.ecoswap.backend.messaging;

import bg.ecoswap.backend.dto.NotificationEvent;
import bg.ecoswap.backend.service.notification.NotificationService;
import org.springframework.amqp.rabbit.annotation.Queue;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Component
public class NotificationListener {
    private final NotificationService notificationService;

    public NotificationListener(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @RabbitListener(queuesToDeclare = @Queue("notification_queue"))
    public void handleNotificationEvent(NotificationEvent event) {
        System.out.println("🔔 Получено ново съобщение от RabbitMQ за потребител ID: " + event.getUsername());

        notificationService.createNotification(event);
    }
}
