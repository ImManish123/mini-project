package com.smarthome.repository;

import com.smarthome.entity.ServiceCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ServiceCategoryRepository extends JpaRepository<ServiceCategory, Long> {
    List<ServiceCategory> findByActiveTrue();
    Boolean existsByCategoryName(String categoryName);
    java.util.Optional<ServiceCategory> findByCategoryName(String categoryName);
}
