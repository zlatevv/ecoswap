package bg.ecoswap.backend.controller.admin;

import bg.ecoswap.backend.model.SwapRequest;
import bg.ecoswap.backend.model.User;
import bg.ecoswap.backend.service.admin.AdminService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {
    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(adminService.getAllUsers());
    }

    @PutMapping("/users/{userId}/ban")
    public ResponseEntity<String> banUser(@PathVariable Long userId, Principal principal) {
        return ResponseEntity.ok(adminService.banUser(userId, principal.getName()));
    }

    @PutMapping("/users/{userId}/unban")
    public ResponseEntity<String> unbanUser(@PathVariable Long userId) {
        return ResponseEntity.ok(adminService.unbanUser(userId));
    }

    @DeleteMapping("/products/{productId}")
    public ResponseEntity<String> deleteProduct(@PathVariable Long productId) {
        return ResponseEntity.ok(adminService.deleteProduct(productId));
    }

    @GetMapping("/swaps")
    public ResponseEntity<List<SwapRequest>> getAllSwaps() {
        return ResponseEntity.ok(adminService.getAllSwapRequests());
    }
}

