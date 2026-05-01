package bg.schoolinventory.backend.service.productmanage;

import bg.schoolinventory.backend.dto.UpdateProductDto;
import bg.schoolinventory.backend.model.Product;

import java.util.List;

public interface ProductService {
    void addProduct(Product product);
    void updateProduct(Long productId, UpdateProductDto updateDto, String currentUsername);
    void deleteProduct(Long productId, String username);
    Product getProduct(Long productId);
    List<Product> getUserProducts(Long userId);

}
