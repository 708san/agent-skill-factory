import { json } from '../lib/http.js';
export default { async fetch() { return json({ ok: true, service: 'agent-skill-factory' }); } };
