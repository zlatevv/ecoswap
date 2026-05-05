package bg.ecoswap.backend.service.notification;

import bg.ecoswap.backend.dto.NotificationEvent;
import bg.ecoswap.backend.model.Notification;

import java.util.List;

public interface NotificationService {
    void createNotification(NotificationEvent event);
    List<Notification> getUserNotifications(String username);
    void markNotificationAsRead(Long notificationId);
}
