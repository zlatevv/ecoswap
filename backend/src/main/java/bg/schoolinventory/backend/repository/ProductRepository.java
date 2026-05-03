package bg.schoolinventory.backend.repository;

import bg.schoolinventory.backend.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findByUserId(Long userId);
    @Query("SELECT p FROM Product p LEFT JOIN FETCH p.imageUrls WHERE p.id = :id")
    Optional<Product> findByIdWithImages(@Param("id") Long id);
    @Query("SELECT DISTINCT p FROM Product p LEFT JOIN FETCH p.imageUrls")
    List<Product> findAllWithImages();
    @Query("SELECT DISTINCT p FROM Product p LEFT JOIN FETCH p.imageUrls WHERE p.user.id = :userId")
    List<Product> findByUserIdWithImages(@Param("userId") Long userId);
}
