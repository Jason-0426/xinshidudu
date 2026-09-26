import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://xnitxnjqlkjabyrabksf.supabase.co';
const SUPABASE_KEY = 'sb_publishable_qvUjs_gFTfUd_dX0HeupaA_rG-lf3So';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);