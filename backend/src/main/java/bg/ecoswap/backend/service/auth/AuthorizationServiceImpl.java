package bg.ecoswap.backend.service.auth;

import bg.ecoswap.backend.dto.*;
import bg.ecoswap.backend.exceptions.InvalidCredentialsException;
import bg.ecoswap.backend.exceptions.PasswordsDismantlementException;
import bg.ecoswap.backend.exceptions.UserExistsException;
import bg.ecoswap.backend.model.User;
import bg.ecoswap.backend.model.enums.Role;
import bg.ecoswap.backend.repository.UserRepository;
import bg.ecoswap.backend.security.JwtUtils;
import jakarta.transaction.Transactional;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class AuthorizationServiceImpl implements AuthorizationService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;
    private final RabbitTemplate rabbitTemplate;

    public AuthorizationServiceImpl(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtUtils jwtUtils, RabbitTemplate rabbitTemplate) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtils = jwtUtils;
        this.rabbitTemplate = rabbitTemplate;
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
        user.setBanned(false);

        if (userRepository.count() == 0) {
            user.setRole(Role.ADMIN);
        } else {
            user.setRole(Role.USER);
        }

        sendNotification(
                user.getUsername(),
                "Dear " + user.getUsername() + ",\n" +
                        "We’re happy to let you know that your registration was completed successfully!\n" +
                        "Your account is now active, and you can start exploring all the features and services available to you. If you need any assistance or have questions, feel free to reach out to our support team at any time.\n" +
                        "Thank you for joining us—we’re glad to have you on board!\n\n" +
                        "Best regard \n" +
                        "EcoSwap Team",
                user.getEmail()
        );

        userRepository.save(user);
    }

    @Override
    public LoginResponseDto login(LoginRequestDto loginRequestDto) {
        User user = userRepository.findByUsername(loginRequestDto.getUsername())
                .orElseThrow(() -> new InvalidCredentialsException("Invalid username or password"));

        if (!passwordEncoder.matches(loginRequestDto.getPassword(), user.getPassword()) || loginRequestDto.getPassword().isEmpty()) {
            throw new InvalidCredentialsException("Invalid username or password");
        }

        if (user.isBanned()) {
            throw new InvalidCredentialsException("Your account has been banned.");
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

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));

        if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
            throw new PasswordsDismantlementException("Passwords do not match");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    @Override
    public User getUserById(Long id){
        return userRepository.findById(id).get();
    }

    private void sendNotification(String username, String message, String email) {
        try {
            NotificationEvent event = new NotificationEvent(username, "Registration Successful!", message, email);
            rabbitTemplate.convertAndSend("notification_queue", event);
            System.out.println("Нотификация пратена за потребител: " + username);
        } catch (Exception e) {
            System.err.println("Грешка при изпращане към RabbitMQ: " + e.getMessage());
        }
    }
}
