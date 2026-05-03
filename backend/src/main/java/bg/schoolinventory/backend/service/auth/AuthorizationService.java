package bg.schoolinventory.backend.service.auth;

import bg.schoolinventory.backend.dto.ChangePasswordDto;
import bg.schoolinventory.backend.dto.LoginRequestDto;
import bg.schoolinventory.backend.dto.LoginResponseDto;
import bg.schoolinventory.backend.dto.RegisterRequestDto;
import bg.schoolinventory.backend.model.User;

public interface AuthorizationService {
    void register(RegisterRequestDto registerRequestDto);
    LoginResponseDto login(LoginRequestDto loginRequestDto);
    void deleteAccount(String username);
    void changePassword(ChangePasswordDto changePasswordDto);
    User getUserById(Long id);
}
