package br.com.otis.smartflow.repository;

import br.com.otis.smartflow.model.SmartFlowAlert;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SmartFlowAlertRepository extends JpaRepository<SmartFlowAlert, String> {
    List<SmartFlowAlert> findByStatusOrderByTimestampDesc(String status);
    List<SmartFlowAlert> findByIsReadFalse();
}
