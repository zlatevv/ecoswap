package bg.ecoswap.backend.dto;

import bg.ecoswap.backend.model.enums.Role;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class LoginResponseDto {
    private String token;
    private String username;
    private Role role;
    private Long id;
}
