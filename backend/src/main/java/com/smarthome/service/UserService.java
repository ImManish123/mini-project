package com.smarthome.service;

import com.smarthome.entity.User;
import com.smarthome.entity.Role;
import com.smarthome.exception.ResourceNotFoundException;
import com.smarthome.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserService {

    private final UserRepository userRepository;

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public List<User> getUsersByRole(Role role) {
        return userRepository.findByRole(role);
    }

    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
    }

    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
    }

    @Transactional
    public User updateUser(Long id, User updatedUser) {
        User user = getUserById(id);
        user.setName(updatedUser.getName());
        user.setPhone(updatedUser.getPhone());
        user.setAddress(updatedUser.getAddress());
        if (updatedUser.getProfileImage() != null) {
            user.setProfileImage(updatedUser.getProfileImage());
        }
        return userRepository.save(user);
    }

    @Transactional
    public User toggleUserStatus(Long id) {
        User user = getUserById(id);
        user.setActive(!user.getActive());
        return userRepository.save(user);
    }

    @Transactional
    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }

    public long countCustomers() {
        return userRepository.countByRole(Role.CUSTOMER);
    }
}
