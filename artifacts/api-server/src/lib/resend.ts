import { Resend } from "resend";

let connectionSettings: Record<string, any> | null = null;

async function getCredentials(): Promise<{ apiKey: string; fromEmail: string }> {
  const hostname = process.env["REPLIT_CONNECTORS_HOSTNAME"];
  const xReplitToken = process.env["REPL_IDENTITY"]
    ? "repl " + process.env["REPL_IDENTITY"]
    : process.env["WEB_REPL_RENEWAL"]
    ? "depl " + process.env["WEB_REPL_RENEWAL"]
    : null;

  if (!xReplitToken) {
    throw new Error("X-Replit-Token not found for repl/depl");
  }

  const data = await fetch(
    "https://" + hostname + "/api/v2/connection?include_secrets=true&connector_names=resend",
    {
      headers: {
        Accept: "application/json",
        "X-Replit-Token": xReplitToken,
      },
    }
  )
    .then((res) => res.json())
    .then((d: any) => d.items?.[0]);

  connectionSettings = data;

  if (!connectionSettings || !connectionSettings["settings"]?.["api_key"]) {
    throw new Error("Resend not connected");
  }

  const configuredFrom = connectionSettings["settings"]["from_email"] as string | undefined;
  // Resend cannot send from free email providers (gmail.com, yahoo.com, etc.)
  // because you cannot verify ownership of those domains. Fall back to Resend's
  // default verified sender in those cases.
  const freeProviders = ["gmail.com", "yahoo.com", "hotmail.com", "outlook.com", "icloud.com"];
  const isFreeProvider = configuredFrom
    ? freeProviders.some((p) => configuredFrom.toLowerCase().endsWith("@" + p))
    : true;

  return {
    apiKey: connectionSettings["settings"]["api_key"] as string,
    fromEmail: isFreeProvider || !configuredFrom ? "Quiz Your Mind <noreply@quizyourmind.business>" : configuredFrom,
  };
}

export async function getUncachableResendClient(): Promise<{
  client: Resend;
  fromEmail: string;
}> {
  const { apiKey, fromEmail } = await getCredentials();
  return { client: new Resend(apiKey), fromEmail };
}

export async function sendVerificationEmail(
  toEmail: string,
  recipientName: string,
  code: string
): Promise<void> {
  const { client, fromEmail } = await getUncachableResendClient();

  const html = `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f0;font-family:'Segoe UI',Arial,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f0;padding:40px 0">
    <tr><td align="center">
      <table width="520" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08)">
        <tr>
          <td style="background:#1a3a6b;padding:28px 36px;text-align:center">
            <span style="color:#ffffff;font-size:22px;font-weight:700;letter-spacing:0.5px">Quiz Your Mind</span>
          </td>
        </tr>
        <tr>
          <td style="padding:36px 36px 20px">
            <h2 style="margin:0 0 12px;color:#1a2f4e;font-size:20px">Verify your email address</h2>
            <p style="margin:0 0 20px;color:#4a5568;font-size:15px;line-height:1.6">
              Hi <strong>${recipientName}</strong>, welcome to Quiz Your Mind!<br>
              Use the code below to complete your registration. It expires in <strong>15 minutes</strong>.
            </p>
            <div style="background:#f0f4ff;border:2px dashed #1a3a6b;border-radius:10px;padding:22px;text-align:center;margin:24px 0">
              <span style="font-size:40px;font-weight:800;letter-spacing:14px;color:#1a3a6b;font-family:monospace">${code}</span>
            </div>
            <p style="margin:0;color:#718096;font-size:13px;line-height:1.6">
              If you didn't create an account, you can safely ignore this email.
            </p>
          </td>
        </tr>
        <tr>
          <td style="background:#f8f9fa;padding:18px 36px;text-align:center;border-top:1px solid #e2e8f0">
            <span style="color:#a0aec0;font-size:12px">&copy; ${new Date().getFullYear()} Quiz Your Mind. All rights reserved.</span>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  await client.emails.send({
    from: fromEmail ?? "Quiz Your Mind <noreply@quizyourmind.business>",
    to: toEmail,
    subject: `${code} — Your Quiz Your Mind verification code`,
    html,
  });
}
