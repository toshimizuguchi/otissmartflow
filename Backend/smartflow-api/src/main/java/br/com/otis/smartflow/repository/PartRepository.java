package br.com.otis.smartflow.repository;

import br.com.otis.smartflow.model.Part;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PartRepository extends JpaRepository<Part, String> {
    List<Part> findByCategory(String category);
    List<Part> findByAbnormalConsumptionAlertTrue();
}
