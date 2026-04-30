package com.example.Spendly.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.annotation.Id;
import org.bson.types.ObjectId;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection  = "expenses")
public class Expense {
    @Id
    private ObjectId id;
    private double amount;
    private String category;
    private LocalDate date;

    public String getId() {
        return id != null ? id.toHexString() : null;
    }

}
