package com.example.Spendly.service;

import com.example.Spendly.model.Expense;
import com.example.Spendly.repository.ExpenseRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ExpenseService {
    private final ExpenseRepository repo;

    public ExpenseService(ExpenseRepository repo) {
        this.repo = repo;
    }
    public Expense addExpense(Expense expense) {
        expense.setUserEmail(getCurrentUser());
        return repo.save(expense);
    }

    public List<Expense> getAll() {
        return repo.findByUserEmail(getCurrentUser());
    }

    public void delete(String id) {
        if (!repo.existsById(id)) {
            throw new RuntimeException("Expense not found");
        }
        repo.deleteById(id);
    }

    public Expense update(String id, Expense newExpense) {

        Expense existing = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Expense not found"));

        existing.setAmount(newExpense.getAmount());
        existing.setCategory(newExpense.getCategory());
        existing.setDate(newExpense.getDate());

        return repo.save(existing);
    }

    public double getTotal(){
        return repo.findAll()
                .stream()
                .mapToDouble(Expense::getAmount)
                .sum();
    }

    // Get email of logged in user
    private String getCurrentUser() {
        return SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();
    }
}
