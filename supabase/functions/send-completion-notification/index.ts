import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface CompletionNotificationRequest {
  userEmail: string;
  userName: string;
  trustName: string;
  completionDate: string;
  ministerName: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userEmail, userName, trustName, completionDate, ministerName }: CompletionNotificationRequest = await req.json();

    console.log("Sending completion notification for user:", userEmail);

    // Send notification to admin
    const adminEmailResponse = await resend.emails.send({
      from: "Trust Completion <onboarding@resend.dev>",
      to: ["troothhurtztrust@gmail.com"],
      subject: "New Trust Process Completed",
      html: `
        <h1>Trust Process Completion Notification</h1>
        <p>A user has successfully completed the entire trust creation process.</p>
        
        <h2>User Details:</h2>
        <ul>
          <li><strong>User Email:</strong> ${userEmail}</li>
          <li><strong>User Name:</strong> ${userName}</li>
          <li><strong>Minister Name:</strong> ${ministerName}</li>
          <li><strong>Trust Name:</strong> ${trustName}</li>
          <li><strong>Completion Date:</strong> ${new Date(completionDate).toLocaleString()}</li>
        </ul>
        
        <p>The user has received their complete trust package with all required documents, seals, and verification elements.</p>
        
        <p>This notification was sent automatically from the Trust Boot Camp system.</p>
      `,
    });

    console.log("Admin notification sent successfully:", adminEmailResponse);

    // Optionally send confirmation to user as well
    const userEmailResponse = await resend.emails.send({
      from: "Trust Boot Camp <onboarding@resend.dev>",
      to: [userEmail],
      subject: "Trust Creation Process Complete - Congratulations!",
      html: `
        <h1>Congratulations ${ministerName}!</h1>
        <p>Your ecclesiastic revocable living trust creation process has been successfully completed.</p>
        
        <h2>What You've Accomplished:</h2>
        <ul>
          <li>✅ Created your trust: <strong>${trustName}</strong></li>
          <li>✅ Generated all required documents with verification elements</li>
          <li>✅ Prepared digital signatures and seals</li>
          <li>✅ Set up all necessary verification tools</li>
        </ul>
        
        <h2>Important Next Steps:</h2>
        <ol>
          <li><strong>Notarization:</strong> Schedule an online notary appointment to make your documents legally binding</li>
          <li><strong>Secure Storage:</strong> Keep your documents in a secure digital location</li>
          <li><strong>Asset Transfer:</strong> Begin transferring assets according to your trust documentation</li>
        </ol>
        
        <p>Remember: Online notarization gives you digital rights to recreate and reprint your documents anytime without re-notarization.</p>
        
        <p>Thank you for completing the Trust Boot Camp process!</p>
        
        <p>Best regards,<br>The Trust Boot Camp Team</p>
      `,
    });

    console.log("User confirmation sent successfully:", userEmailResponse);

    return new Response(JSON.stringify({ 
      success: true, 
      adminEmailId: adminEmailResponse.data?.id,
      userEmailId: userEmailResponse.data?.id 
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-completion-notification function:", error);
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