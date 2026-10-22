package br.com.otis.smartflow.repository;

import br.com.otis.smartflow.model.Employee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EmployeeRepository extends JpaRepository<Employee, String> {
    List<Employee> findByRole(String role);
    List<Employee> findByDepartment(String department);
}
