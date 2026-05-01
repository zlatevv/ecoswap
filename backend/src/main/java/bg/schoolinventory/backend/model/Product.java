package bg.schoolinventory.backend.model;

import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;

@Entity
@Table(name = "products")
@Data
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String productName;
    private String productDescription;
    private BigDecimal productPrice;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;
}
