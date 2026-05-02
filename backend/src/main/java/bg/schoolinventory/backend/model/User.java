package bg.schoolinventory.backend.model;

import bg.schoolinventory.backend.model.enums.Role;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "users")
@Data
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    private Role role;

    private String username;
    private String firstName;
    private String lastName;
    private String email;
    private String password;

    @Column(unique = true)
    private String phoneNumber;

    @Column
    private String profilePictureURL;

    @OneToMany(mappedBy = "user")
    @JsonIgnore
    private List<Product> products = new ArrayList<>();
}
