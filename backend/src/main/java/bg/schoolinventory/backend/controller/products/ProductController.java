package bg.schoolinventory.backend.controller.products;

import bg.schoolinventory.backend.dto.UpdateProductDto;
import bg.schoolinventory.backend.model.Product;
import bg.schoolinventory.backend.model.User;
import bg.schoolinventory.backend.repository.UserRepository;
import bg.schoolinventory.backend.service.productmanage.ProductService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/products")
public class ProductController {
    private final ProductService productService;
    private final UserRepository userRepository;

    public ProductController(ProductService productService, UserRepository userRepository) {
        this.productService = productService;
        this.userRepository = userRepository;
    }
    @GetMapping("/{id}")
    public ResponseEntity<Product> getProduct(@PathVariable Long id) {
        Product product = productService.getProduct(id);
        return ResponseEntity.ok(product);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Product>> getUserProducts(@PathVariable Long userId) {
        List<Product> products = productService.getUserProducts(userId);
        return ResponseEntity.ok(products);
    }

    @PostMapping
    public ResponseEntity<String> addProduct(@RequestBody Product product, Principal principal) {
        User currentUser = userRepository.findByUsername(principal.getName()).get();
        product.setUser(currentUser);

        productService.addProduct(product);
        return ResponseEntity.status(HttpStatus.CREATED).body("Product created successfully!");
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteProduct(@PathVariable Long id, Principal principal) {
        productService.deleteProduct(id, principal.getName());

        return ResponseEntity.ok("Product deleted successfully!");
    }

    @PutMapping("/{id}")
    public ResponseEntity<String> updateProduct(
            @PathVariable Long id,
            @RequestBody UpdateProductDto updateDto,
            Principal principal) {

        productService.updateProduct(id, updateDto, principal.getName());

        return ResponseEntity.ok("Product updated successfully!");
    }
}
