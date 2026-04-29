package bg.schoolinventory.backend.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "products")
@Data
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    private String productName;
    private String productDescription;
    private String productPrice;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;
}
