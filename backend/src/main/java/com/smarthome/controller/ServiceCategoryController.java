package com.smarthome.controller;

import com.smarthome.dto.ApiResponse;
import com.smarthome.entity.ServiceCategory;
import com.smarthome.service.ServiceCategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class ServiceCategoryController {

    private final ServiceCategoryService categoryService;

    @GetMapping
    public ResponseEntity<List<ServiceCategory>> getAllCategories() {
        return ResponseEntity.ok(categoryService.getActiveCategories());
    }

    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<ServiceCategory>> getAllCategoriesAdmin() {
        return ResponseEntity.ok(categoryService.getAllCategories());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ServiceCategory> getCategoryById(@PathVariable Long id) {
        return ResponseEntity.ok(categoryService.getCategoryById(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ServiceCategory> createCategory(@RequestBody ServiceCategory category) {
        return ResponseEntity.ok(categoryService.createCategory(category));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ServiceCategory> updateCategory(@PathVariable Long id, @RequestBody ServiceCategory category) {
        return ResponseEntity.ok(categoryService.updateCategory(id, category));
    }

    @PatchMapping("/{id}/toggle")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ServiceCategory> toggleCategory(@PathVariable Long id) {
        return ResponseEntity.ok(categoryService.toggleCategoryStatus(id));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse> deleteCategory(@PathVariable Long id) {
        categoryService.deleteCategory(id);
        return ResponseEntity.ok(ApiResponse.success("Category deleted successfully"));
    }
}
