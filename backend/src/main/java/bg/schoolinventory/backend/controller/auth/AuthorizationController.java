package bg.schoolinventory.backend.controller.auth;

import bg.schoolinventory.backend.dto.LoginRequestDto;
import bg.schoolinventory.backend.dto.RegisterRequestDto;
import bg.schoolinventory.backend.service.auth.AuthorizationService;
import jakarta.validation.Valid;
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

    @GetMapping("/login")
    private void loginUser(@RequestBody @Valid LoginRequestDto loginRequestDto) {
        authorizationService.login(loginRequestDto);
    }

    @PutMapping("/changepass")
    private void changePassword(@RequestBody String username,
                                @RequestBody String oldPassword,
                                @RequestBody String newPassword) {
        authorizationService.changePassword(username, oldPassword, newPassword);
    }

    @DeleteMapping("/delete")
    private void deleteAccount(@RequestBody String username) {
        authorizationService.deleteAccount(username);
    }
}
