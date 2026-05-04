package bg.ecoswap.backend.controller.auth;

import bg.ecoswap.backend.dto.ChangePasswordDto;
import bg.ecoswap.backend.dto.LoginRequestDto;
import bg.ecoswap.backend.dto.LoginResponseDto;
import bg.ecoswap.backend.dto.RegisterRequestDto;
import bg.ecoswap.backend.model.User;
import bg.ecoswap.backend.service.auth.AuthorizationService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthorizationController {
    private final AuthorizationService authorizationService;

    public AuthorizationController(AuthorizationService authorizationService) {
        this.authorizationService = authorizationService;
    }

    @PostMapping("/register")
    private void registerUser(@RequestBody @Valid RegisterRequestDto registerRequestDto) {
        authorizationService.register(registerRequestDto);
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponseDto> loginUser(@RequestBody @Valid LoginRequestDto loginRequestDto) {
        LoginResponseDto response = authorizationService.login(loginRequestDto);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/changepass")
    private void changePassword(@RequestBody ChangePasswordDto changePasswordDto) {
        authorizationService.changePassword(changePasswordDto);
    }

    @DeleteMapping("/delete")
    private void deleteAccount(@RequestBody String username) {
        authorizationService.deleteAccount(username);
    }

    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(authorizationService.getUserById(id));
    }
}
