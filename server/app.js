const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 4000;

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE || ''
);

app.use(express.json());
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || '*',
  })
);

// simple health check
app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

// Simple auth register
app.post('/auth/register', async (req, res) => {
  const { email, password, fullName } = req.body;
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName || '' },
  });
  if (error) {
    return res.status(400).json({ error: error.message });
  }
  res.json({ user: data.user });
});

// login
app.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return res.status(400).json({ error: error.message });
  res.json({ session: data.session, user: data.user });
});

// reset password (send email)
app.post('/auth/reset-password', async (req, res) => {
  const { email } = req.body;
  const { error } = await supabase.auth.resetPasswordForEmail(email);
  if (error) return res.status(400).json({ error: error.message });
  res.json({ ok: true });
});

// Leads CRUD
app.post('/api/leads', async (req, res) => {
  const lead = req.body;
  const { data, error } = await supabase.from('leads').insert(lead).select().single();
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

app.get('/api/leads', async (req, res) => {
  const { data, error } = await supabase.from('leads').select('*');
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

app.patch('/api/leads/:id', async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  const { data, error } = await supabase
    .from('leads')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

