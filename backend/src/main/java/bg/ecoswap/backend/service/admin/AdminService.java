package bg.ecoswap.backend.service.admin;

import bg.ecoswap.backend.model.SwapRequest;
import bg.ecoswap.backend.model.User;

import java.util.List;

public interface AdminService {
    List<User> getAllUsers();
    String banUser(Long userId, String username);
    String unbanUser(Long userId);
    String deleteProduct(Long productId);
    List<SwapRequest> getAllSwapRequests();
}
