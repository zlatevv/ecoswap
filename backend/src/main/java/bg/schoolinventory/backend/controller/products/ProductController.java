package bg.schoolinventory.backend.controller.products;

import bg.schoolinventory.backend.dto.UpdateProductDto;
import bg.schoolinventory.backend.model.Product;
import bg.schoolinventory.backend.model.User;
import bg.schoolinventory.backend.repository.ProductRepository;
import bg.schoolinventory.backend.repository.UserRepository;
import bg.schoolinventory.backend.service.cloudinary.CloudinaryService;
import bg.schoolinventory.backend.service.productmanage.ProductService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.security.Principal;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ProductService productService;
    private final UserRepository userRepository;
    private final CloudinaryService cloudinaryService;
    private final ProductRepository productRepository;

    public ProductController(ProductService productService,
                             UserRepository userRepository,
                             CloudinaryService cloudinaryService,
                             ProductRepository productRepository) {
        this.productService = productService;
        this.userRepository = userRepository;
        this.cloudinaryService = cloudinaryService;
        this.productRepository = productRepository;
    }

    @GetMapping("/all")
    public ResponseEntity<List<Product>> getAllProducts() {
        return ResponseEntity.ok(productService.getAllProducts());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Product> getProduct(@PathVariable Long id) {
        return ResponseEntity.ok(productService.getProduct(id));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Product>> getUserProducts(@PathVariable Long userId) {
        return ResponseEntity.ok(productService.getUserProducts(userId));
    }

    @PostMapping
    public ResponseEntity<Product> addProduct(@RequestBody Product product, Principal principal) {
        User currentUser = userRepository.findByUsername(principal.getName()).get();
        product.setUser(currentUser);
        productService.addProduct(product);
        return ResponseEntity.status(HttpStatus.CREATED).body(product);
    }

    @PostMapping("/{id}/images")
    public ResponseEntity<List<String>> uploadImages(
            @PathVariable Long id,
            @RequestParam("files") List<MultipartFile> files,
            Principal principal) throws IOException {

        Product product = productService.getProduct(id);

        if (!product.getUser().getUsername().equals(principal.getName())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        List<String> uploadedUrls = new ArrayList<>();
        for (MultipartFile file : files) {
            String url = cloudinaryService.uploadImage(file);
            uploadedUrls.add(url);
        }

        product.getImageUrls().addAll(uploadedUrls);
        productRepository.save(product);

        return ResponseEntity.ok(product.getImageUrls());
    }

    @DeleteMapping("/{id}/images/{index}")
    public ResponseEntity<List<String>> deleteImage(
            @PathVariable Long id,
            @PathVariable int index,
            Principal principal) throws IOException {

        Product product = productService.getProduct(id);

        if (!product.getUser().getUsername().equals(principal.getName())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        List<String> urls = product.getImageUrls();
        if (index < 0 || index >= urls.size()) {
            return ResponseEntity.badRequest().build();
        }

        String urlToDelete = urls.get(index);
        cloudinaryService.deleteImage(urlToDelete);
        urls.remove(index);
        productRepository.save(product);

        return ResponseEntity.ok(product.getImageUrls());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteProduct(@PathVariable Long id, Principal principal) {
        productService.deleteProduct(id, principal.getName());
        return ResponseEntity.ok("Product deleted successfully!");
    }

    @PutMapping("/{id}")
    public ResponseEntity<String> updateProduct(@PathVariable Long id,
                                                @RequestBody UpdateProductDto updateDto,
                                                Principal principal) {
        productService.updateProduct(id, updateDto, principal.getName());
        return ResponseEntity.ok("Product updated successfully!");
    }
}