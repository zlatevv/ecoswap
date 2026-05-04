package bg.ecoswap.backend.model;

import bg.ecoswap.backend.model.enums.Role;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "users")
@Getter
@Setter
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
    private boolean isBanned = false;

    @Column(unique = true)
    private String phoneNumber;

    @Column
    private String profilePictureURL;

    private Integer ecoPoints = 0;

    @OneToMany(mappedBy = "user")
    @JsonIgnore
    private List<Product> products = new ArrayList<>();
}
