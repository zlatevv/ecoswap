package bg.ecoswap.backend.controller.notification;

import bg.ecoswap.backend.model.Notification;
import bg.ecoswap.backend.service.notification.NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {
    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping("/user/{username}")
    public ResponseEntity<List<Notification>> getUserNotifications(@PathVariable String username) {
        List<Notification> notifications = notificationService.getUserNotifications(username);
        return ResponseEntity.ok(notifications);
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<String> markAsRead(@PathVariable("id") Long id) {
        notificationService.markNotificationAsRead(id);
        return ResponseEntity.ok("Notification marked as read successfully.");
    }
}
