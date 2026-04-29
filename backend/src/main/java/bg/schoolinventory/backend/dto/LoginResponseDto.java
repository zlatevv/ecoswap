package bg.schoolinventory.backend.dto;

import bg.schoolinventory.backend.model.enums.Role;
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
