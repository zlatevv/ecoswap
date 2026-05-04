package bg.ecoswap.backend.service.auth;

import bg.ecoswap.backend.dto.ChangePasswordDto;
import bg.ecoswap.backend.dto.LoginRequestDto;
import bg.ecoswap.backend.dto.LoginResponseDto;
import bg.ecoswap.backend.dto.RegisterRequestDto;
import bg.ecoswap.backend.exceptions.InvalidCredentialsException;
import bg.ecoswap.backend.exceptions.PasswordsDismantlementException;
import bg.ecoswap.backend.exceptions.UserExistsException;
import bg.ecoswap.backend.model.User;
import bg.ecoswap.backend.model.enums.Role;
import bg.ecoswap.backend.repository.UserRepository;
import bg.ecoswap.backend.security.JwtUtils;
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
        user.setBanned(false);

        if (userRepository.count() == 0) {
            user.setRole(Role.ADMIN);
        } else {
            user.setRole(Role.USER);
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

        userRepository.findByUsername(username).ifPresent(user -> {
            if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
                throw new PasswordsDismantlementException("Passwords do not match");
            }
            user.setPassword(passwordEncoder.encode(newPassword));
        });
    }

    @Override
    public User getUserById(Long id){
        return userRepository.findById(id).get();
    }
}
