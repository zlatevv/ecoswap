package bg.schoolinventory.backend.controller.swap;

import bg.schoolinventory.backend.dto.SwapRequestDto;
import bg.schoolinventory.backend.model.SwapRequest;
import bg.schoolinventory.backend.model.enums.SwapStatus;
import bg.schoolinventory.backend.service.swap.SwapRequestService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/swaps")
public class SwapRequestController {

    private final SwapRequestService swapRequestService;

    public SwapRequestController(SwapRequestService swapRequestService) {
        this.swapRequestService = swapRequestService;
    }

    // Create a swap request
    @PostMapping
    public ResponseEntity<SwapRequest> createSwapRequest(@RequestBody SwapRequestDto dto,
                                                         Principal principal) {
        SwapRequest created = swapRequestService.createSwapRequest(dto, principal.getName());
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    // Get incoming swap requests (on my products)
    @GetMapping("/incoming/{userId}")
    public ResponseEntity<List<SwapRequest>> getIncoming(@PathVariable Long userId) {
        return ResponseEntity.ok(swapRequestService.getIncomingRequests(userId));
    }

    // Get outgoing swap requests (sent by me)
    @GetMapping("/outgoing/{userId}")
    public ResponseEntity<List<SwapRequest>> getOutgoing(@PathVariable Long userId) {
        return ResponseEntity.ok(swapRequestService.getOutgoingRequests(userId));
    }

    // Accept or reject a swap request
    @PutMapping("/{swapId}/status")
    public ResponseEntity<SwapRequest> updateStatus(@PathVariable Long swapId,
                                                    @RequestParam SwapStatus status,
                                                    Principal principal) {
        SwapRequest updated = swapRequestService.updateStatus(swapId, status, principal.getName());
        return ResponseEntity.ok(updated);
    }
}
