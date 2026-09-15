/**
 * THINKPOINT Frontend AI Service Layer (Legacy Path Re-export)
 * All frontend requests route to POST http://localhost:5000/api/ai
 */

import { sendToThinkpointAI } from './ai';

export { sendToThinkpointAI };
export default sendToThinkpointAI;
