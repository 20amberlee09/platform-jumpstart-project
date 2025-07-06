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
  // New fields for document delivery
  documents?: Array<{
    fileName: string;
    downloadUrl: string;
    documentType: string;
  }>;
  folderUrl?: string;
  emailType?: 'completion' | 'documents'; // defaults to completion
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      userEmail, 
      userName, 
      trustName, 
      completionDate, 
      ministerName,
      documents,
      folderUrl,
      emailType = 'completion'
    }: CompletionNotificationRequest = await req.json();

    console.log("Sending notification for user:", userEmail, "Type:", emailType);

    // Handle document delivery email
    if (emailType === 'documents' && documents && folderUrl) {
      const documentsList = documents.map((doc, index) => 
        `<li style="margin-bottom: 8px;">
          <a href="${doc.downloadUrl}" target="_blank" style="color: #2563eb; text-decoration: none;">
            ${doc.fileName}
          </a>
          <span style="color: #6b7280; font-size: 14px;"> (${doc.documentType.replace('_', ' ').toUpperCase()})</span>
        </li>`
      ).join('');

      const documentsEmailResponse = await resend.emails.send({
        from: "Trust Documents <noreply@troothhurtz.com>",
        to: [userEmail],
        subject: "🎉 Your Trust Documents Are Ready - Download Links Inside",
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Your Trust Documents</title>
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
              <h1 style="margin: 0; font-size: 28px;">🎉 Congratulations, Minister ${userName}!</h1>
              <p style="margin: 10px 0 0 0; font-size: 18px; opacity: 0.9;">Your Trust Documents Are Ready</p>
            </div>

            <div style="background: #f8fafc; padding: 25px; border-radius: 10px; margin-bottom: 25px;">
              <h2 style="color: #1e293b; margin-top: 0;">✅ Documents Ready for Download!</h2>
              <p>Your legal documents are now ready for download and use.</p>
            </div>

            <div style="margin-bottom: 30px;">
              <h3 style="color: #1e293b; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px;">📄 Download Your Documents</h3>
              <p style="margin-bottom: 15px;">Click each link below to download your official trust documents:</p>
              <ul style="background: #f1f5f9; padding: 20px; border-radius: 8px; list-style-type: none; padding-left: 0;">
                ${documentsList}
              </ul>
            </div>

            <div style="background: #e0f2fe; border: 2px solid #0284c7; border-radius: 10px; padding: 20px; margin-bottom: 25px;">
              <h3 style="color: #0c4a6e; margin-top: 0;">💾 Save to Google Drive</h3>
              <p style="margin-bottom: 15px; color: #0c4a6e;">Follow these steps to organize your documents:</p>
              <ol style="color: #0c4a6e; margin-bottom: 15px;">
                <li>Click the download links above to save documents to your computer</li>
                <li>Open your Google Drive folder: <a href="${folderUrl}" target="_blank" style="color: #2563eb;">Open Drive Folder</a></li>
                <li>Drag and drop the downloaded files into your Drive folder</li>
              </ol>
              <p style="color: #0c4a6e; font-weight: bold; margin-bottom: 0;">💡 Tip: Keep these documents safe - they are your official legal trust documents!</p>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <p style="font-size: 18px; font-weight: bold; color: #059669;">Thank you for choosing our trust creation platform!</p>
              <p style="color: #6b7280;">If you have any questions, please don't hesitate to contact our support team.</p>
            </div>

            <div style="border-top: 2px solid #e5e7eb; padding-top: 20px; text-align: center; color: #6b7280; font-size: 14px;">
              <p>Best regards,<br>The TROOTHHURTZ Team</p>
              <p style="margin-top: 15px;">This email was sent to ${userEmail}</p>
            </div>
          </body>
          </html>
        `,
      });

      console.log("Documents email sent successfully:", documentsEmailResponse);

      return new Response(JSON.stringify({ 
        success: true, 
        emailId: documentsEmailResponse.data?.id 
      }), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      });
    }

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

    // Send beautiful completion confirmation to user
    const userEmailResponse = await resend.emails.send({
      from: "TROOTHHURTZ Trust Boot Camp <noreply@troothhurtz.com>",
      to: [userEmail],
      subject: "🎉 Congratulations! Your TROOTHHURTZ Trust Boot Camp is Complete!",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Trust Boot Camp Complete!</title>
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
              background: linear-gradient(135deg, #28a745 0%, #20c997 100%); 
              color: white; 
              padding: 40px 30px; 
              text-align: center; 
            }
            .header h1 { 
              margin: 0; 
              font-size: 28px; 
              font-weight: bold;
            }
            .content { 
              padding: 40px 30px; 
            }
            .success-box {
              background: #d4edda;
              border: 2px solid #c3e6cb;
              border-radius: 8px;
              padding: 25px;
              margin: 25px 0;
              text-align: center;
            }
            .accomplishments {
              background: #f8f9fa;
              border-radius: 8px;
              padding: 25px;
              margin: 25px 0;
            }
            .next-steps {
              background: #fff3cd;
              border: 1px solid #ffeaa7;
              border-radius: 8px;
              padding: 25px;
              margin: 25px 0;
            }
            .checkmark { color: #28a745; font-weight: bold; margin-right: 10px; }
            .number { 
              background: #007bff; 
              color: white; 
              border-radius: 50%; 
              padding: 5px 10px; 
              font-weight: bold; 
              margin-right: 10px; 
              display: inline-block;
              min-width: 20px;
              text-align: center;
            }
            .footer { 
              background: #1a1a2e; 
              color: white; 
              padding: 30px; 
              text-align: center; 
            }
            .footer a { color: #ffd700; text-decoration: none; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 MISSION ACCOMPLISHED!</h1>
              <p>Your TROOTHHURTZ Trust Boot Camp is Complete</p>
            </div>
            
            <div class="content">
              <h2>Congratulations, ${ministerName}! 🏆</h2>
              
              <div class="success-box">
                <h3>🎯 Your Trust Boot Camp Journey is Complete!</h3>
                <p>You've successfully navigated all 8 steps of our comprehensive trust creation process. Your ecclesiastic revocable living trust <strong>"${trustName}"</strong> is now ready!</p>
              </div>

              <div class="accomplishments">
                <h3>🏅 What You've Accomplished:</h3>
                <ul style="list-style: none; padding: 0;">
                  <li><span class="checkmark">✅</span> <strong>Identity Verified:</strong> Government ID processed and validated</li>
                  <li><span class="checkmark">✅</span> <strong>Trust Name Secured:</strong> USPTO & State searches completed for "${trustName}"</li>
                  <li><span class="checkmark">✅</span> <strong>Ministerial Status Confirmed:</strong> Ordination certificate verified</li>
                  <li><span class="checkmark">✅</span> <strong>Trust Documents Created:</strong> Professional ecclesiastic revocable living trust generated</li>
                  <li><span class="checkmark">✅</span> <strong>Digital Infrastructure Setup:</strong> Gmail account and Google Drive organized</li>
                  <li><span class="checkmark">✅</span> <strong>Verification Tools Generated:</strong> QR codes and barcode certificates created</li>
                  <li><span class="checkmark">✅</span> <strong>Custom Seal Designed:</strong> Professional document seal prepared</li>
                  <li><span class="checkmark">✅</span> <strong>Complete Package Delivered:</strong> All documents delivered to your Google Drive</li>
                </ul>
              </div>

              <div class="next-steps">
                <h3>🚀 Important Next Steps:</h3>
                <ol style="padding-left: 0;">
                  <li style="margin: 15px 0;"><span class="number">1</span><strong>Schedule Online Notarization:</strong> Make your trust documents legally binding with an online notary appointment</li>
                  <li style="margin: 15px 0;"><span class="number">2</span><strong>Secure Document Storage:</strong> Your documents are in Google Drive - ensure you have secure backups</li>
                  <li style="margin: 15px 0;"><span class="number">3</span><strong>Begin Asset Transfer:</strong> Start transferring assets into your trust according to your documentation</li>
                  <li style="margin: 15px 0;"><span class="number">4</span><strong>Review Regularly:</strong> Schedule periodic reviews of your trust structure</li>
                </ol>
              </div>

              <div style="background: #e9ecef; border-radius: 6px; padding: 20px; margin: 25px 0;">
                <h4 style="margin-top: 0; color: #495057;">💎 Pro Tip:</h4>
                <p style="margin-bottom: 0; color: #495057;"><strong>Online notarization gives you digital rights</strong> to recreate and reprint your documents anytime without re-notarization. This is a significant advantage for document management!</p>
              </div>

              <p>Thank you for choosing <strong>TROOTHHURTZ Trust Document Automation</strong> for your trust formation needs. You've successfully completed one of the most comprehensive trust creation processes available.</p>

              <p>If you have any questions about your completed trust package, please don't hesitate to reach out to us at <a href="mailto:support@troothhurtz.com" style="color: #007bff;">support@troothhurtz.com</a></p>

              <p>Congratulations again on this significant accomplishment!</p>
              
              <p><strong>The TROOTHHURTZ Team</strong><br>
              Professional Trust Document Automation Platform</p>
            </div>
            
            <div class="footer">
              <h3>🏛️ TROOTHHURTZ</h3>
              <p>Professional Ecclesiastic Trust Formation Since 2024</p>
              <p>Completion Date: ${new Date(completionDate).toLocaleDateString()}</p>
              <p><a href="mailto:support@troothhurtz.com">support@troothhurtz.com</a></p>
            </div>
          </div>
        </body>
        </html>
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