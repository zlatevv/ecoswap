package bg.ecoswap.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@AllArgsConstructor
@NoArgsConstructor
public class NotificationEvent {
    private String username;
    private String title;
    private String message;
    private String email;
}
