package bg.schoolinventory.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class RegisterRequestDto {
    @Pattern(
            regexp = "^[a-zA-Z0-9._-]{3,}$\n",
            message = "Invalid username!"
    )
    private String username;
    @Pattern(
            regexp = "^[A-Z][a-zA-Z '.-]*[A-Za-z][^-]$",
            message = "Invalid First Name!"
    )
    private String firstName;

    @Pattern(
            regexp = "^[A-Z][a-zA-Z '.-]*[A-Za-z][^-]$",
            message = "Invalid Last Name!"
    )
    private String lastName;

    @Email(
            regexp = "[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,3}",
            message = "Invalid Email!")
    private String email;

    @Pattern(
            regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&]).{8,}$",
            message = "Password Must Contain At Least 1 lowercase letter, 1 uppercase letter, 1 digit and 1 special symbol!"
    )
    private String password;

    @Pattern(
            regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&]).{8,}$",
            message = "Password Must Contain At Least 1 lowercase letter, 1 uppercase letter, 1 digit and 1 special symbol!"
    )
    private String confirmPassword;

    @Pattern(
            regexp = "^[+]?[(]?[0-9]{3}[)]?[-\\s.]?[0-9]{3}[-\\s.]?[0-9]{4,6}$",
            message = "Invalid phone number!"
    )
    private String phoneNumber;
}
