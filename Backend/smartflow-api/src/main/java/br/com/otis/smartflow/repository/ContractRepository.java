package br.com.otis.smartflow.repository;

import br.com.otis.smartflow.model.Contract;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ContractRepository extends JpaRepository<Contract, String> {
    List<Contract> findByStatus(String status);
}
