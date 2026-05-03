package bg.schoolinventory.backend.model;

import bg.schoolinventory.backend.model.enums.SwapStatus;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "swap_requests")
@Getter
@Setter
public class SwapRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "requester_id")
    @JsonIgnoreProperties({"products", "password"})
    private User requester;

    @ManyToOne
    @JoinColumn(
            name = "offered_product_id",
            foreignKey = @ForeignKey(foreignKeyDefinition = "FOREIGN KEY (offered_product_id) REFERENCES products(id) ON DELETE SET NULL")
    )
    @JsonIgnoreProperties("user")
    private Product offeredProduct;

    @ManyToOne
    @JoinColumn(
            name = "requested_product_id",
            foreignKey = @ForeignKey(foreignKeyDefinition = "FOREIGN KEY (requested_product_id) REFERENCES products(id) ON DELETE SET NULL")
    )
    @JsonIgnoreProperties("user")
    private Product requestedProduct;

    @Column(length = 500)
    private String message;

    @Enumerated(EnumType.STRING)
    private SwapStatus status = SwapStatus.PENDING;

    private LocalDateTime createdAt = LocalDateTime.now();
}
