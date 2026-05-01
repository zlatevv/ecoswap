package bg.schoolinventory.backend.exceptions;

public class ProductDoesNotExistException extends RuntimeException {
    public ProductDoesNotExistException(String message) {
        super(message);
    }
}
