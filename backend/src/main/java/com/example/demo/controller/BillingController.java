package com.example.demo.controller;

import com.example.demo.entity.Invoice;
import com.example.demo.repository.InvoiceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/billing")
public class BillingController {

    @Autowired
    private InvoiceRepository invoiceRepository;

    @GetMapping("/invoices")
    @PreAuthorize("hasAnyRole('ADMIN', 'RECEPTIONIST', 'PATIENT')")
    public List<Invoice> getAllInvoices() {
        return invoiceRepository.findAll();
    }

    @PostMapping("/invoices")
    @PreAuthorize("hasAnyRole('ADMIN', 'RECEPTIONIST')")
    public Invoice createInvoice(@RequestBody Invoice invoice) {
        if (invoice.getStatus() == null) {
            invoice.setStatus("PENDING");
        }
        return invoiceRepository.save(invoice);
    }

    @PutMapping("/invoices/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'RECEPTIONIST')")
    public ResponseEntity<Invoice> updateInvoiceStatus(@PathVariable Long id, @RequestParam String status) {
        return invoiceRepository.findById(id).map(inv -> {
            inv.setStatus(status);
            return ResponseEntity.ok(invoiceRepository.save(inv));
        }).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/stats")
    @PreAuthorize("hasAnyRole('ADMIN', 'RECEPTIONIST')")
    public Map<String, Object> getBillingStats() {
        List<Invoice> invoices = invoiceRepository.findAll();
        double total = invoices.stream()
                .filter(i -> i.getAmount() != null)
                .mapToDouble(Invoice::getAmount)
                .sum();
        double paid = invoices.stream()
                .filter(i -> "PAID".equals(i.getStatus()) && i.getAmount() != null)
                .mapToDouble(Invoice::getAmount)
                .sum();
        double pending = invoices.stream()
                .filter(i -> "PENDING".equals(i.getStatus()) && i.getAmount() != null)
                .mapToDouble(Invoice::getAmount)
                .sum();
        long totalCount = invoices.size();
        long paidCount = invoices.stream().filter(i -> "PAID".equals(i.getStatus())).count();
        long pendingCount = invoices.stream().filter(i -> "PENDING".equals(i.getStatus())).count();

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalRevenue", total);
        stats.put("paidRevenue", paid);
        stats.put("pendingRevenue", pending);
        stats.put("totalInvoices", totalCount);
        stats.put("paidInvoices", paidCount);
        stats.put("pendingInvoices", pendingCount);
        return stats;
    }
}
