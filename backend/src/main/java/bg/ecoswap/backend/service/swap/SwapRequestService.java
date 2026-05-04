package bg.ecoswap.backend.service.swap;

import bg.ecoswap.backend.dto.SwapRequestDto;
import bg.ecoswap.backend.model.Product;
import bg.ecoswap.backend.model.SwapRequest;
import bg.ecoswap.backend.model.User;
import bg.ecoswap.backend.model.enums.SwapStatus;
import bg.ecoswap.backend.repository.ProductRepository;
import bg.ecoswap.backend.repository.SwapRequestRepository;
import bg.ecoswap.backend.repository.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SwapRequestService {

    private final SwapRequestRepository swapRequestRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public SwapRequestService(SwapRequestRepository swapRequestRepository,
                              ProductRepository productRepository,
                              UserRepository userRepository) {
        this.swapRequestRepository = swapRequestRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
    }

    public SwapRequest createSwapRequest(SwapRequestDto dto, String requesterUsername) {
        User requester = userRepository.findByUsername(requesterUsername)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Product requestedProduct = productRepository.findById(dto.getRequestedProductId())
                .orElseThrow(() -> new RuntimeException("Requested product not found"));

        Product offeredProduct = productRepository.findById(dto.getOfferedProductId())
                .orElseThrow(() -> new RuntimeException("Offered product not found"));

        if (requestedProduct.getUser().getId().equals(requester.getId())) {
            throw new RuntimeException("You cannot request a swap on your own product");
        }

        if (!offeredProduct.getUser().getId().equals(requester.getId())) {
            throw new RuntimeException("You can only offer your own products");
        }

        SwapRequest swapRequest = new SwapRequest();
        swapRequest.setRequester(requester);
        swapRequest.setRequestedProduct(requestedProduct);
        swapRequest.setOfferedProduct(offeredProduct);
        swapRequest.setMessage(dto.getMessage());

        return swapRequestRepository.save(swapRequest);
    }

    public List<SwapRequest> getIncomingRequests(Long userId) {
        return swapRequestRepository.findByRequestedProduct_User_Id(userId);
    }

    public List<SwapRequest> getOutgoingRequests(Long userId) {
        return swapRequestRepository.findByRequester_Id(userId);
    }

    public List<SwapRequest> getAllRequests() {
        return swapRequestRepository.findAll();
    }

    @Transactional
    public SwapRequest updateStatus(Long swapId, SwapStatus status, String username) {
        SwapRequest swap = swapRequestRepository.findById(swapId)
                .orElseThrow(() -> new RuntimeException("Swap request not found"));

        User requester = swap.getRequester();
        User productOwner = swap.getRequestedProduct().getUser();
        Product offeredProduct = swap.getOfferedProduct();
        Product requestedProduct = swap.getRequestedProduct();

        // Only the owner of the requested product can accept/reject
        if (!productOwner.getUsername().equals(username)) {
            throw new RuntimeException("Not authorized to update this swap request");
        }

        swap.setStatus(status);

        if (status == SwapStatus.ACCEPTED) {
            int currentRequesterPoints = (requester.getEcoPoints() != null) ? requester.getEcoPoints() : 0;
            int currentOwnerPoints = (productOwner.getEcoPoints() != null) ? productOwner.getEcoPoints() : 0;

            requester.setEcoPoints(currentRequesterPoints + 100);
            productOwner.setEcoPoints(currentOwnerPoints + 100);
            offeredProduct.setUnavailable();
            requestedProduct.setUnavailable();

            userRepository.save(requester);
            userRepository.save(productOwner);
            productRepository.save(offeredProduct);
            productRepository.save(requestedProduct);
        }
        return swapRequestRepository.save(swap);
    }
}
