import { serve } from "bun";
import { readFile } from "fs/promises";
import twilio from "twilio";

const PORT = Bun.env.PORT ? parseInt(Bun.env.PORT) : 3000;
const SERVER_URL = Bun.env.SERVER_URL || 'http://localhost:3000';
const VOICEFLOW_API_KEY = Bun.env.VOICEFLOW_API_KEY;
const VOICEFLOW_VERSION = Bun.env.VOICEFLOW_VERSION;
const VOICEFLOW_PROJECT_ID = Bun.env.VOICEFLOW_PROJECT_ID;

const TWILIO_ACCOUNT_SID = Bun.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = Bun.env.TWILIO_AUTH_TOKEN;
const TWILIO_VERIFY_SERVICE_SID = Bun.env.TWILIO_VERIFY_SERVICE_SID || '';
const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, x-portkey-api-key",
};

const server = serve({
  port: PORT,
  async fetch(req) {
    const url = new URL(req.url);

    if (req.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    if (url.pathname === "/" || url.pathname === "/index.html") {
      let content = await readFile("./index.html", "utf8");
      content = content.replaceAll('YOUR_PROJECT_ID', VOICEFLOW_PROJECT_ID || '');
      content = content.replaceAll('SERVER_URL', SERVER_URL || 'http://localhost:3000');

      return new Response(content, {
        headers: { "Content-Type": "text/html; charset=utf-8", ...corsHeaders }
      });
    }

    if (url.pathname === "/scripts/extensions.js") {
      let content = await readFile("./scripts/extensions.js", "utf8");
      content = content.replace('AUTO_POPULATED', SERVER_URL);
      content = content.replace('voiceflow-session-xyz', `voiceflow-session-${VOICEFLOW_PROJECT_ID}`);
      return new Response(content, {
        headers: { "Content-Type": "application/javascript; charset=utf-8",
        ...corsHeaders
      }
      });
    }

    if (url.pathname === "/styles/widget.css") {
      let content = await readFile("./styles/widget.css", "utf8");
      return new Response(content, {
        headers: {
          "Content-Type": "text/css; charset=utf-8",
          ...corsHeaders
        }
      });
    }

    if (url.pathname === "/send-verification" && req.method === "POST") {
      const body = await req.json();
      const { email } = body;

      try {
        const verification = await client.verify.v2
          .services(TWILIO_VERIFY_SERVICE_SID)
          .verifications.create({ to: email, channel: "email" });

        return new Response(JSON.stringify({ success: true, status: verification.status }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        const isMaxAttemptsReached = errorMessage.includes('Max send attempts reached');

        return new Response(JSON.stringify({
          success: false,
          error: errorMessage,
          maxAttemptsReached: isMaxAttemptsReached
        }), {
          status: isMaxAttemptsReached ? 429 : 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }
    }

    if (url.pathname === "/check-verification" && req.method === "POST") {
      const body = await req.json();
      const { email, code, userId } = body;

      try {
        const verificationCheck = await client.verify.v2
          .services(TWILIO_VERIFY_SERVICE_SID)
          .verificationChecks.create({ to: email, code });

          if (verificationCheck.status === 'approved') {
            const voiceflowResponse = await fetch(`https://general-runtime.voiceflow.com/state/user/${userId}/variables`, {
              method: 'PATCH',
              headers: {
                ...corsHeaders,
                ...(VOICEFLOW_API_KEY && { 'Authorization': VOICEFLOW_API_KEY }),
                ...(VOICEFLOW_VERSION && { 'Versionid': VOICEFLOW_VERSION }),
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ valid: true }),
            });

            if (!voiceflowResponse.ok) {
              console.error('Failed to update Voiceflow state:', await voiceflowResponse.text());
              return new Response(JSON.stringify({ success: false, status: verificationCheck.status }), {
                status: 200,
                headers: { ...corsHeaders, "Content-Type": "application/json" }
              });
            } else {
              return new Response(JSON.stringify({ success: true, status: verificationCheck.status }), {
                status: 200,
                headers: { ...corsHeaders, "Content-Type": "application/json" }
              });
            }
        } else {
          return new Response(JSON.stringify({ success: false, status: verificationCheck.status }), {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          });
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return new Response(JSON.stringify({ success: false, error: errorMessage }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }
    }

    return new Response("Not Found", {
      status: 404,
      headers: corsHeaders
    });
  },
});

console.log(`Server running at http://localhost:${PORT}`);
