import type { VercelRequest, VercelResponse } from '@vercel/node';
import express from 'express';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json({ limit: '10mb' }));

let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'SOA S1 Human-in-the-Loop Agentic AI Engine',
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
    timestamp: new Date().toISOString(),
  });
});

// Agent processing endpoint
app.post('/api/agent/process', async (req, res) => {
  try {
    const {
      userPrompt,
      category,
      language = 'en',
      studentProfile,
      attachedDocs = [],
    } = req.body;

    const gemini = getGeminiClient();

    if (gemini && process.env.GEMINI_API_KEY) {
      const systemInstruction = `
You are the autonomous Institutional Service Delivery AI for Siksha 'O' Anusandhan (SOA) Deemed to be University.
You operate strictly under Human-in-the-Loop (HITL) governance.

Analyze the user's service request and return a structured JSON response with the schema below.

JSON Response Schema:
{
  "requestSummary": "string",
  "intentCategory": "certificate" | "lab_booking" | "maintenance" | "grievance" | "general",
  "confidenceScore": number (0.0 to 1.0),
  "detectedLanguage": "string",
  "languageResponseText": "string",
  "planSteps": [
    {
      "stepId": number,
      "name": "string",
      "description": "string",
      "status": "completed" | "in_progress" | "pending" | "waiting_approval" | "failed",
      "toolUsed": "string",
      "outputSummary": "string"
    }
  ],
  "policyConflict": {
    "hasConflict": boolean,
    "severity": "none" | "low" | "medium" | "high" | "critical",
    "policyClause": "string",
    "description": "string",
    "remedy": "string"
  },
  "hitlRequired": boolean,
  "hitlDetails": {
    "approvalRole": "string",
    "consequenceLevel": "Low" | "Moderate" | "High" | "Critical",
    "actionTitle": "string",
    "recommendedDecision": "APPROVE" | "CONDITIONAL" | "REJECT"
  }
}
`;

      const response = await gemini.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: userPrompt,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          temperature: 0.2,
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      return res.json({ success: true, data: parsed, engine: 'gemini-3.7-flash' });
    }

    res.json({ 
      success: true, 
      data: { 
        requestSummary: 'Request processed',
        intentCategory: category || 'general'
      },
      engine: 'deterministic-institutional-engine' 
    });
  } catch (error: any) {
    console.error('Agent processing error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default (req: VercelRequest, res: VercelResponse) => {
  app(req, res);
};
