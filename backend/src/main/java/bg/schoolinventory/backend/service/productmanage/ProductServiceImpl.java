package bg.schoolinventory.backend.service.productmanage;

import bg.schoolinventory.backend.dto.UpdateProductDto;
import bg.schoolinventory.backend.exceptions.ProductDoesNotExistException;
import bg.schoolinventory.backend.model.Product;
import bg.schoolinventory.backend.repository.ProductRepository;
import jakarta.transaction.Transactional;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProductServiceImpl implements ProductService {
    private final ProductRepository productRepository;

    public ProductServiceImpl(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    @Override
    public void addProduct(Product product) {
        productRepository.save(product);
    }

    @Override
    @Transactional
    public void updateProduct(Long productId, UpdateProductDto updateDto, String currentUsername) {
        Product existingProduct = productRepository.findById(productId)
                .orElseThrow(() -> new ProductDoesNotExistException("Product does not exist"));

        if (!existingProduct.getUser().getUsername().equals(currentUsername)) {
            throw new AccessDeniedException("You do not have permission to update this product.");
        }

        if (updateDto.getProductName() != null) {
            existingProduct.setProductName(updateDto.getProductName());
        }
        if (updateDto.getProductDescription() != null) {
            existingProduct.setProductDescription(updateDto.getProductDescription());
        }
        if (updateDto.getProductPrice() != null) {
            existingProduct.setProductPrice(updateDto.getProductPrice());
        }

        productRepository.save(existingProduct);
    }

    @Override
    public void deleteProduct(Long productId, String currentUsername) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ProductDoesNotExistException("Product does not exist"));

        if (!product.getUser().getUsername().equals(currentUsername)) {
            throw new org.springframework.security.access.AccessDeniedException("You do not have permission to delete this product.");
        }

        productRepository.delete(product);
    }

    @Override
    public Product getProduct(Long productId) {
        return productRepository.findById(productId)
                .orElseThrow(() -> new ProductDoesNotExistException("Product does not exist"));
    }

    @Override
    public List<Product> getUserProducts(Long userId) {
        return productRepository.findByUserId(userId);
    }

    @Override
    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }
}
