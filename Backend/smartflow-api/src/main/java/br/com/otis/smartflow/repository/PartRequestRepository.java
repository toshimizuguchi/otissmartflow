package br.com.otis.smartflow.repository;

import br.com.otis.smartflow.model.PartRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PartRequestRepository extends JpaRepository<PartRequest, String> {
    List<PartRequest> findByTechnicianId(String technicianId);
    List<PartRequest> findByStatus(String status);
}
