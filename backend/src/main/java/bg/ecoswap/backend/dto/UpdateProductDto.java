package bg.ecoswap.backend.dto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class UpdateProductDto {
    private String productName;
    private String productDescription;
    private BigDecimal productPrice;
}
