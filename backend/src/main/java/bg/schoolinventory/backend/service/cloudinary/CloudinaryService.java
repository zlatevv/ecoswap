package bg.schoolinventory.backend.service.cloudinary;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Service
public class CloudinaryService {

    private final Cloudinary cloudinary;

    public CloudinaryService(Cloudinary cloudinary) {
        this.cloudinary = cloudinary;
    }

    public String uploadImage(MultipartFile file) throws IOException {
        Map<?, ?> result = cloudinary.uploader().upload(
                file.getBytes(),
                ObjectUtils.asMap("folder", "ecoswap/products")
        );
        return (String) result.get("secure_url");
    }

    public void deleteImage(String imageUrl) throws IOException {
        // Extract public_id from URL: ecoswap/products/<public_id>
        String publicId = extractPublicId(imageUrl);
        if (publicId != null) {
            cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
        }
    }

    private String extractPublicId(String imageUrl) {
        if (imageUrl == null) return null;
        try {
            // URL format: https://res.cloudinary.com/<cloud>/image/upload/v123/ecoswap/products/filename.jpg
            int uploadIdx = imageUrl.indexOf("/upload/");
            if (uploadIdx == -1) return null;
            String afterUpload = imageUrl.substring(uploadIdx + 8);
            // Remove version segment (v12345/)
            if (afterUpload.startsWith("v") && afterUpload.contains("/")) {
                afterUpload = afterUpload.substring(afterUpload.indexOf("/") + 1);
            }
            // Remove file extension
            int dotIdx = afterUpload.lastIndexOf(".");
            return dotIdx != -1 ? afterUpload.substring(0, dotIdx) : afterUpload;
        } catch (Exception e) {
            return null;
        }
    }
}
