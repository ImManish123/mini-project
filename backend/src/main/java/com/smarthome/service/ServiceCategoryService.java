package com.smarthome.service;

import com.smarthome.entity.ServiceCategory;
import com.smarthome.exception.BadRequestException;
import com.smarthome.exception.ResourceNotFoundException;
import com.smarthome.repository.ServiceCategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ServiceCategoryService {

    private final ServiceCategoryRepository categoryRepository;

    public List<ServiceCategory> getAllCategories() {
        return categoryRepository.findAll();
    }

    public List<ServiceCategory> getActiveCategories() {
        return categoryRepository.findByActiveTrue();
    }

    public ServiceCategory getCategoryById(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));
    }

    @Transactional
    public ServiceCategory createCategory(ServiceCategory category) {
        if (categoryRepository.existsByCategoryName(category.getCategoryName())) {
            throw new BadRequestException("Category already exists: " + category.getCategoryName());
        }
        category.setActive(true);
        return categoryRepository.save(category);
    }

    @Transactional
    public ServiceCategory updateCategory(Long id, ServiceCategory updatedCategory) {
        ServiceCategory category = getCategoryById(id);
        category.setCategoryName(updatedCategory.getCategoryName());
        category.setDescription(updatedCategory.getDescription());
        category.setIcon(updatedCategory.getIcon());
        category.setImageUrl(updatedCategory.getImageUrl());
        return categoryRepository.save(category);
    }

    @Transactional
    public ServiceCategory toggleCategoryStatus(Long id) {
        ServiceCategory category = getCategoryById(id);
        category.setActive(!category.getActive());
        return categoryRepository.save(category);
    }

    @Transactional
    public void deleteCategory(Long id) {
        categoryRepository.deleteById(id);
    }
}
