-- Create function to assign lawyer and log activity atomically
CREATE OR REPLACE FUNCTION public.assign_lawyer_and_log(
  p_lead_id uuid,
  p_lawyer_id uuid,
  p_assignment_note text
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_case_details jsonb;
BEGIN
  SELECT case_details INTO v_case_details
  FROM leads
  WHERE id = p_lead_id;

  UPDATE leads
  SET assigned_lawyer_id = p_lawyer_id,
      status = 'assigned',
      case_details = jsonb_set(
        jsonb_set(
          COALESCE(v_case_details, '{}'::jsonb),
          '{pipeline_stage}',
          to_jsonb('lawyer_assigned')
        ),
        '{lawyer_assigned_at}',
        to_jsonb(now()::text)
      )
  WHERE id = p_lead_id;

  INSERT INTO lead_assignments (
    lead_id,
    lawyer_id,
    assignment_type,
    status,
    notes,
    response_deadline
  ) VALUES (
    p_lead_id,
    p_lawyer_id,
    'automatic',
    'completed',
    p_assignment_note,
    now() + interval '24 hours'
  );
END;
$$;
