package br.com.otis.smartflow.repository;

import br.com.otis.smartflow.model.MaintenanceCampaign;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MaintenanceCampaignRepository extends JpaRepository<MaintenanceCampaign, String> {
    List<MaintenanceCampaign> findByStatus(String status);
}
