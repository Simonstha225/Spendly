package com.example.Spendly.Controller;

import com.example.Spendly.model.Expense;
import com.example.Spendly.service.ExpenseService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/expenses")
@CrossOrigin(origins = "*")
public class ExpenseController {

    private final ExpenseService service;

    public ExpenseController(ExpenseService service) {
        this.service=service;
    }

    @PostMapping
    public Expense add(@RequestBody Expense expense){
        return service.addExpense(expense);
    }

    @GetMapping
    public List<Expense> getAll(){
        return service.getAll();
    }

    @DeleteMapping("/{id}")
    public String delete(@PathVariable String id) {
        service.delete(id);
        return "Deleted successfully";
    }
    @PutMapping("/{id}")
    public Expense update(@PathVariable String id,@RequestBody Expense expense){
        return service.update(id,expense);
    }

    @GetMapping("/total")
    public double total(){
        return service.getTotal();
    }


}
