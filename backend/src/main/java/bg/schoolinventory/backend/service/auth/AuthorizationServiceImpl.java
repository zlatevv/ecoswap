package bg.schoolinventory.backend.service.auth;

import bg.schoolinventory.backend.dto.ChangePasswordDto;
import bg.schoolinventory.backend.dto.LoginRequestDto;
import bg.schoolinventory.backend.dto.LoginResponseDto;
import bg.schoolinventory.backend.dto.RegisterRequestDto;
import bg.schoolinventory.backend.exceptions.InvalidCredentialsException;
import bg.schoolinventory.backend.exceptions.PasswordsDismantlementException;
import bg.schoolinventory.backend.exceptions.UserExistsException;
import bg.schoolinventory.backend.model.User;
import bg.schoolinventory.backend.model.enums.Role;
import bg.schoolinventory.backend.repository.UserRepository;
import bg.schoolinventory.backend.security.JwtUtils;
import jakarta.transaction.Transactional;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class AuthorizationServiceImpl implements AuthorizationService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;

    public AuthorizationServiceImpl(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtUtils jwtUtils) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtils = jwtUtils;
    }

    @Override
    @Transactional
    public void register(RegisterRequestDto registerRequest) {
        if (userRepository.findByUsername(registerRequest.getUsername()).isPresent()) {
            throw new UserExistsException("User already exists");
        }
        if (userRepository.findByEmail(registerRequest.getEmail()).isPresent()) {
            throw new UserExistsException("Email already exists");
        }

        if (!registerRequest.getPassword().equals(registerRequest.getConfirmPassword())) {
            throw new PasswordsDismantlementException("Passwords do not match");
        }

        User user = new User();

        user.setUsername(registerRequest.getUsername());
        user.setEmail(registerRequest.getEmail());
        user.setPassword(passwordEncoder.encode(registerRequest.getPassword()));
        user.setFirstName(registerRequest.getFirstName());
        user.setLastName(registerRequest.getLastName());
        user.setPhoneNumber(registerRequest.getPhoneNumber());
        user.setProfilePictureURL(registerRequest.getProfilePictureUrl());

        if (userRepository.count() == 0) {
            user.setRole(Role.ADMIN);
        }

        userRepository.save(user);
    }

    @Override
    public LoginResponseDto login(LoginRequestDto loginRequestDto) {
        User user = userRepository.findByUsername(loginRequestDto.getUsername())
                .orElseThrow(() -> new InvalidCredentialsException("Invalid username or password"));

        if (!passwordEncoder.matches(loginRequestDto.getPassword(), user.getPassword()) || loginRequestDto.getPassword().isEmpty()) {
            throw new InvalidCredentialsException("Invalid username or password");
        }
        String token = jwtUtils.generateToken(user.getUsername(), user.getRole().name(), user.getId());

        return new LoginResponseDto(token, user.getUsername(), user.getRole(), user.getId());
    }

    @Override
    public void deleteAccount(String username) {
        Optional<User> user = userRepository.findByUsername(username);

        user.ifPresent(userRepository::delete);
    }

    @Override
    public void changePassword(ChangePasswordDto changePasswordDto) {
        String oldPassword = changePasswordDto.getOldPassword();
        String newPassword = changePasswordDto.getNewPassword();
        String username = changePasswordDto.getUsername();

        userRepository.findByUsername(username).ifPresent(user -> {
            if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
                throw new PasswordsDismantlementException("Passwords do not match");
            }
            user.setPassword(passwordEncoder.encode(newPassword));
        });
    }
}
