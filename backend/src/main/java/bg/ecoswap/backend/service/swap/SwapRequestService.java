package bg.ecoswap.backend.service.swap;

import bg.ecoswap.backend.dto.NotificationEvent;
import bg.ecoswap.backend.dto.SwapRequestDto;
import bg.ecoswap.backend.model.Product;
import bg.ecoswap.backend.model.SwapRequest;
import bg.ecoswap.backend.model.User;
import bg.ecoswap.backend.model.enums.SwapStatus;
import bg.ecoswap.backend.repository.ProductRepository;
import bg.ecoswap.backend.repository.SwapRequestRepository;
import bg.ecoswap.backend.repository.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SwapRequestService {

    private final SwapRequestRepository swapRequestRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final RabbitTemplate rabbitTemplate;

    public SwapRequestService(SwapRequestRepository swapRequestRepository,
                              ProductRepository productRepository,
                              UserRepository userRepository, RabbitTemplate rabbitTemplate) {
        this.swapRequestRepository = swapRequestRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
        this.rabbitTemplate = rabbitTemplate;
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

            int newRequesterPoints = currentRequesterPoints + 100;
            int newOwnerPoints = currentOwnerPoints + 100;

            requester.setEcoPoints(newRequesterPoints);
            productOwner.setEcoPoints(newOwnerPoints);
            offeredProduct.setUnavailable();
            requestedProduct.setUnavailable();

            userRepository.save(requester);
            userRepository.save(productOwner);
            productRepository.save(offeredProduct);
            productRepository.save(requestedProduct);

            String emailSubject = "Swap Confirmation: Transaction Successful & Points Awarded";

            // Notify Requester
            String requesterMsg = buildSuccessEmail(requester.getUsername(), newRequesterPoints);
            sendNotification(requester.getUsername(), emailSubject, requesterMsg, requester.getEmail());

            // Notify Product Owner
            String ownerMsg = buildSuccessEmail(productOwner.getUsername(), newOwnerPoints);
            sendNotification(productOwner.getUsername(), emailSubject, ownerMsg, productOwner.getEmail());
        }
        return swapRequestRepository.save(swap);
    }

    private void sendNotification(String username, String title, String message, String email) {
        try {
            NotificationEvent event = new NotificationEvent(username, title, message, email);
            rabbitTemplate.convertAndSend("notification_queue", event);
            System.out.println("Нотификация пратена за потребител: " + username);
        } catch (Exception e) {
            System.err.println("Грешка при изпращане към RabbitMQ: " + e.getMessage());
        }
    }

    private String buildSuccessEmail(String username, int totalPoints) {
        return "Dear " + username + ",\n\n" +
                "We are writing to confirm that your recent transaction on EcoSwap has been successfully completed. " +
                "Thank you for utilizing our platform and actively contributing to a more sustainable, circular economy.\n\n" +
                "To recognize your successful exchange, we have updated your account balance with a reward.\n\n" +
                "Transaction Summary:\n" +
                "- Status: Successfully Completed\n" +
                "- Reward Earned: +100 Points\n" +
                "- Updated Balance: " + totalPoints + " Points\n\n" +
                "Your newly acquired points are immediately available for use. You can apply them toward future swaps, " +
                "premium listings, or other exclusive platform rewards.\n\n" +
                "To view your complete transaction history or to start browsing for your next exchange, please log in to your EcoSwap account dashboard.\n\n" +
                "If you have any questions regarding this transaction or your account balance, please do not hesitate to reach out to our support team.\n\n" +
                "Thank you for being a valued member of the EcoSwap community.\n\n" +
                "Best regards,\n" +
                "The EcoSwap Team";
    }
}
