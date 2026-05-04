package bg.ecoswap.backend.service.auth;

import bg.ecoswap.backend.dto.ChangePasswordDto;
import bg.ecoswap.backend.dto.LoginRequestDto;
import bg.ecoswap.backend.dto.LoginResponseDto;
import bg.ecoswap.backend.dto.RegisterRequestDto;
import bg.ecoswap.backend.model.User;

public interface AuthorizationService {
    void register(RegisterRequestDto registerRequestDto);
    LoginResponseDto login(LoginRequestDto loginRequestDto);
    void deleteAccount(String username);
    void changePassword(ChangePasswordDto changePasswordDto);
    User getUserById(Long id);
}
