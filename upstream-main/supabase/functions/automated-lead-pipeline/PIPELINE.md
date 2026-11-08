# Automated Lead Pipeline Stages

The `automated-lead-pipeline` function updates `leads.case_details.pipeline_stage` to track progress in a single field and avoid partial states.

Pipeline stages:

1. `started` – pipeline initiated.
2. `lead_validated` – lead data retrieved and validated.
3. `lawyers_search_failed` – no matching lawyers were found.
4. `lawyer_selected` – best lawyer chosen for the lead.
5. `lawyer_assigned` – lead assigned to the lawyer.
6. `quote_created` – quote generated for the customer.
7. `whatsapp_sent` – WhatsApp notification sent successfully.
8. `whatsapp_failed` – sending the WhatsApp message failed.
9. `completed` – pipeline finished successfully.
10. `failed` – unrecoverable error occurred during processing.

Tracking the stage in one place simplifies monitoring and prevents leaving a lead in a partial state.
