package bg.schoolinventory.backend.model;

import bg.schoolinventory.backend.model.enums.SwapStatus;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Table(name = "swap_requests")
@Data
public class SwapRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "requester_id")
    @JsonIgnoreProperties({"products", "password"})
    private User requester;

    @ManyToOne
    @JoinColumn(name = "offered_product_id")
    @JsonIgnoreProperties("user")
    private Product offeredProduct;

    @ManyToOne
    @JoinColumn(name = "requested_product_id")
    @JsonIgnoreProperties("user")
    private Product requestedProduct;

    @Column(length = 500)
    private String message;

    @Enumerated(EnumType.STRING)
    private SwapStatus status = SwapStatus.PENDING;

    private LocalDateTime createdAt = LocalDateTime.now();
}
