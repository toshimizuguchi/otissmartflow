package br.com.otis.smartflow.repository;

import br.com.otis.smartflow.model.TimePunch;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TimePunchRepository extends JpaRepository<TimePunch, String> {
    List<TimePunch> findByEmployeeIdOrderByTimestampDesc(String employeeId);
}
