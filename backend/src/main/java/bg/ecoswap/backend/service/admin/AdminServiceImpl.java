package bg.ecoswap.backend.service.admin;

import bg.ecoswap.backend.model.SwapRequest;
import bg.ecoswap.backend.model.User;
import bg.ecoswap.backend.repository.ProductRepository;
import bg.ecoswap.backend.repository.SwapRequestRepository;
import bg.ecoswap.backend.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AdminServiceImpl implements AdminService {
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final SwapRequestRepository swapRequestRepository;

    public AdminServiceImpl(UserRepository userRepository, ProductRepository productRepository, SwapRequestRepository swapRequestRepository) {
        this.userRepository = userRepository;
        this.productRepository = productRepository;
        this.swapRequestRepository = swapRequestRepository;
    }

    @Override
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @Override
    public String banUser(Long userId, String username) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getUsername().equals(username)) {
            return "You cannot ban yourself.";
        }

        user.setBanned(true);
        userRepository.save(user);
        return "User banned successfully.";
    }

    @Override
    public String unbanUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setBanned(false);
        userRepository.save(user);
        return "User unbanned successfully.";
    }

    @Override
    public String deleteProduct(Long productId) {
        productRepository.deleteById(productId);
        return "Product deleted successfully.";
    }

    @Override
    public List<SwapRequest> getAllSwapRequests() {
        return swapRequestRepository.findAll();
    }
}
