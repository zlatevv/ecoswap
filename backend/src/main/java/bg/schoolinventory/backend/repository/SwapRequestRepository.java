package bg.schoolinventory.backend.repository;

import bg.schoolinventory.backend.model.SwapRequest;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SwapRequestRepository extends JpaRepository<SwapRequest, Long> {
    List<SwapRequest> findByRequestedProduct_User_Id(Long userId);

    List<SwapRequest> findByRequester_Id(Long userId);
}
