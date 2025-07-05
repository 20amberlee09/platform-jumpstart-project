import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ValidateGiftCodeRequest {
  code: string;
  courseId: string;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { code, courseId }: ValidateGiftCodeRequest = await req.json();

    if (!code || !courseId) {
      return new Response(
        JSON.stringify({ error: "Code and course ID are required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Find the gift code
    const { data: giftCode, error: fetchError } = await supabase
      .from("gift_codes")
      .select("*")
      .eq("code", code)
      .eq("course_id", courseId)
      .single();

    if (fetchError || !giftCode) {
      return new Response(
        JSON.stringify({ 
          valid: false, 
          error: "Invalid gift code for this course" 
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Check if already used
    if (giftCode.used_by) {
      return new Response(
        JSON.stringify({ 
          valid: false, 
          error: "This gift code has already been used" 
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Check if expired
    if (giftCode.expires_at && new Date(giftCode.expires_at) < new Date()) {
      return new Response(
        JSON.stringify({ 
          valid: false, 
          error: "This gift code has expired" 
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    return new Response(
      JSON.stringify({ 
        valid: true, 
        giftCodeId: giftCode.id,
        message: "Gift code is valid!" 
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error validating gift code:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});