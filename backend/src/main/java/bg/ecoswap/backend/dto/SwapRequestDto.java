package bg.ecoswap.backend.dto;

import lombok.Data;

@Data
public class SwapRequestDto {
    private Long requestedProductId;  // the product the user wants
    private Long offeredProductId;    // the product they're offering in exchange
    private String message;
}
