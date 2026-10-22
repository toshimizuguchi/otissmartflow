package br.com.otis.smartflow.controller;

import br.com.otis.smartflow.model.Contract;
import br.com.otis.smartflow.repository.ContractRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/contracts")
@Tag(name = "Contratos & Financeiro", description = "Endpoints para acompanhamento de margens operacionais, DRE e contratos em risco")
public class ContractController {

    private final ContractRepository contractRepository;

    public ContractController(ContractRepository contractRepository) {
        this.contractRepository = contractRepository;
    }

    @GetMapping
    @Operation(summary = "Listar todos os contratos ou filtrar por status")
    public List<Contract> getAllContracts(@RequestParam(required = false) String status) {
        if (status != null && !status.isBlank()) {
            return contractRepository.findByStatus(status.toUpperCase());
        }
        return contractRepository.findAll();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obter detalhes do contrato por ID")
    public ResponseEntity<Contract> getContractById(@PathVariable String id) {
        return contractRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @Operation(summary = "Criar ou atualizar contrato")
    public Contract saveContract(@RequestBody Contract contract) {
        if (contract.getId() == null || contract.getId().isBlank()) {
            contract.setId("ctr-" + System.currentTimeMillis());
        }
        return contractRepository.save(contract);
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Atualizar status do contrato (ATIVO, EM_RISCO, RENOVACAO_PENDENTE)")
    public ResponseEntity<Contract> updateContractStatus(@PathVariable String id, @RequestParam String status) {
        return contractRepository.findById(id).map(c -> {
            c.setStatus(status.toUpperCase());
            return ResponseEntity.ok(contractRepository.save(c));
        }).orElse(ResponseEntity.notFound().build());
    }
}
