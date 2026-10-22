package br.com.otis.smartflow.controller;

import br.com.otis.smartflow.model.Employee;
import br.com.otis.smartflow.model.TimePunch;
import br.com.otis.smartflow.repository.EmployeeRepository;
import br.com.otis.smartflow.repository.TimePunchRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/employees")
@Tag(name = "Colaboradores, Ponto & Folha", description = "Endpoints para gestão de quadro de equipes, aprovações de bônus, horas extras e registro de ponto")
public class EmployeeController {

    private final EmployeeRepository employeeRepository;
    private final TimePunchRepository timePunchRepository;

    public EmployeeController(EmployeeRepository employeeRepository, TimePunchRepository timePunchRepository) {
        this.employeeRepository = employeeRepository;
        this.timePunchRepository = timePunchRepository;
    }

    @GetMapping
    @Operation(summary = "Listar todos os colaboradores ou filtrar por cargo")
    public List<Employee> getAllEmployees(@RequestParam(required = false) String role) {
        if (role != null && !role.isBlank()) {
            return employeeRepository.findByRole(role.toUpperCase());
        }
        return employeeRepository.findAll();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obter dados do colaborador por ID")
    public ResponseEntity<Employee> getEmployeeById(@PathVariable String id) {
        return employeeRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/punches")
    @Operation(summary = "Listar registros de ponto por colaborador")
    public List<TimePunch> getPunches(@RequestParam(required = false) String employeeId) {
        if (employeeId != null && !employeeId.isBlank()) {
            return timePunchRepository.findByEmployeeIdOrderByTimestampDesc(employeeId);
        }
        return timePunchRepository.findAll();
    }

    @PostMapping("/punches")
    @Operation(summary = "Registrar novo ponto de colaborador")
    public TimePunch registerPunch(@RequestBody TimePunch punch) {
        if (punch.getId() == null || punch.getId().isBlank()) {
            punch.setId("punch-" + System.currentTimeMillis());
        }
        return timePunchRepository.save(punch);
    }

    @PatchMapping("/{id}/bonus")
    @Operation(summary = "Aprovar ou rejeitar bônus de colaborador")
    public ResponseEntity<Employee> approveBonus(@PathVariable String id, @RequestParam Boolean approved) {
        return employeeRepository.findById(id).map(emp -> {
            emp.setBonusApproved(approved);
            return ResponseEntity.ok(employeeRepository.save(emp));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/{id}/overtime")
    @Operation(summary = "Aprovar ou rejeitar horas extras de colaborador")
    public ResponseEntity<Employee> approveOvertime(@PathVariable String id, @RequestParam Boolean approved) {
        return employeeRepository.findById(id).map(emp -> {
            emp.setOvertimeApproved(approved);
            return ResponseEntity.ok(employeeRepository.save(emp));
        }).orElse(ResponseEntity.notFound().build());
    }
}
