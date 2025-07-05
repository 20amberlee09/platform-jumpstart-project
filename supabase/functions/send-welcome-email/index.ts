import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface WelcomeEmailRequest {
  userEmail: string;
  userName: string;
  confirmationUrl?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userEmail, userName, confirmationUrl }: WelcomeEmailRequest = await req.json();

    console.log("Sending welcome email for user:", userEmail);

    const emailResponse = await resend.emails.send({
      from: "TROOTHHURTZ Trust Boot Camp <noreply@troothhurtz.com>",
      to: [userEmail],
      subject: "🎉 Welcome to TROOTHHURTZ Trust Document Automation!",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to TROOTHHURTZ</title>
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
              line-height: 1.6; 
              color: #333; 
              margin: 0; 
              padding: 0; 
              background-color: #f8f9fa;
            }
            .container { 
              max-width: 600px; 
              margin: 0 auto; 
              background: white; 
              border-radius: 8px; 
              overflow: hidden;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .header { 
              background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); 
              color: white; 
              padding: 40px 30px; 
              text-align: center; 
            }
            .header h1 { 
              margin: 0; 
              font-size: 28px; 
              font-weight: bold;
              text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
            }
            .header p { 
              margin: 10px 0 0 0; 
              font-size: 16px; 
              opacity: 0.9;
            }
            .content { 
              padding: 40px 30px; 
            }
            .welcome-box {
              background: #f8f9ff;
              border: 2px solid #e6e9ff;
              border-radius: 8px;
              padding: 25px;
              margin: 25px 0;
              text-align: center;
            }
            .cta-button { 
              display: inline-block; 
              background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%); 
              color: #1a1a2e !important; 
              padding: 15px 30px; 
              text-decoration: none; 
              border-radius: 6px; 
              font-weight: bold; 
              font-size: 16px;
              box-shadow: 0 4px 8px rgba(255, 215, 0, 0.3);
              transition: transform 0.2s;
            }
            .cta-button:hover {
              transform: translateY(-2px);
            }
            .features {
              background: #f8f9fa;
              border-radius: 8px;
              padding: 25px;
              margin: 25px 0;
            }
            .features h3 {
              color: #1a1a2e;
              margin-top: 0;
            }
            .feature-list {
              list-style: none;
              padding: 0;
            }
            .feature-list li {
              padding: 8px 0;
              border-bottom: 1px solid #e9ecef;
            }
            .feature-list li:last-child {
              border-bottom: none;
            }
            .checkmark {
              color: #28a745;
              font-weight: bold;
              margin-right: 10px;
            }
            .footer { 
              background: #f8f9fa; 
              padding: 30px; 
              text-align: center; 
              font-size: 14px; 
              color: #666; 
            }
            .footer a {
              color: #1a1a2e;
              text-decoration: none;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🏛️ TROOTHHURTZ</h1>
              <p>Trust Document Automation Platform</p>
            </div>
            
            <div class="content">
              <h2>Welcome aboard, ${userName}! 🎉</h2>
              
              <p>Thank you for joining <strong>TROOTHHURTZ Trust Document Automation</strong> - your gateway to professional ecclesiastic revocable living trust creation!</p>
              
              <div class="welcome-box">
                <h3>🚀 You're Ready for Boot Camp!</h3>
                <p>Your account is set up and you're ready to begin the comprehensive Trust Boot Camp process. Complete professional trust formation in just 8 guided steps!</p>
              </div>

              ${confirmationUrl ? `
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${confirmationUrl}" class="cta-button">
                    ✅ Confirm Your Email & Start Boot Camp
                  </a>
                </div>
              ` : `
                <div style="text-align: center; margin: 30px 0;">
                  <a href="https://your-domain.com/automation" class="cta-button">
                    🚀 Start Your Boot Camp Process
                  </a>
                </div>
              `}

              <div class="features">
                <h3>🎯 What You'll Get in Boot Camp:</h3>
                <ul class="feature-list">
                  <li><span class="checkmark">✅</span> Complete $150 package - no recurring fees</li>
                  <li><span class="checkmark">✅</span> Automated trust name verification (USPTO & State)</li>
                  <li><span class="checkmark">✅</span> Professional ecclesiastic revocable living trust creation</li>
                  <li><span class="checkmark">✅</span> Gmail account setup with proper trust naming</li>
                  <li><span class="checkmark">✅</span> QR code generation for all documentation</li>
                  <li><span class="checkmark">✅</span> Custom document seal creation</li>
                  <li><span class="checkmark">✅</span> Professional document generation with verification</li>
                  <li><span class="checkmark">✅</span> Final document delivery to your Google Drive</li>
                </ul>
              </div>

              <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 6px; padding: 20px; margin: 25px 0;">
                <h4 style="margin-top: 0; color: #856404;">💡 Important Reminder:</h4>
                <p style="margin-bottom: 0; color: #856404;">This is a <strong>mix of guided steps</strong> (where you take action) and <strong>automated processes</strong> (done for you). Our system will walk you through each step clearly.</p>
              </div>

              <p>Questions? We're here to help! Simply reply to this email or contact us at <a href="mailto:support@troothhurtz.com">support@troothhurtz.com</a></p>

              <p>Welcome to the TROOTHHURTZ family!</p>
              
              <p><strong>The TROOTHHURTZ Team</strong><br>
              Professional Trust Document Automation</p>
            </div>
            
            <div class="footer">
              <p>TROOTHHURTZ - Professional Ecclesiastic Trust Formation Platform</p>
              <p>This email was sent because you signed up for TROOTHHURTZ Trust Boot Camp.</p>
              <p><a href="#">Unsubscribe</a> | <a href="#">Privacy Policy</a></p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    console.log("Welcome email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ 
      success: true, 
      emailId: emailResponse.data?.id 
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-welcome-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);