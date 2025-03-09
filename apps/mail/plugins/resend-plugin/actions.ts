"use server";

import { getPluginSettings } from "@/actions/plugin-settings";
import { getPluginData } from "@/actions/plugin-data";
import { Resend } from "resend";

async function getResendClient() {
  const settings = await getPluginSettings("resend");
  if (!settings.enabled) {
    throw new Error("Resend plugin is not enabled. Please enable it in plugin settings.");
  }

  const apiKeyData = await getPluginData("resend", "option:apiKey");
  const apiKey = typeof apiKeyData === "string" ? apiKeyData : "";

  if (!apiKey) {
    throw new Error("Resend API key not found. Please configure the plugin settings.");
  }

  return new Resend(apiKey);
}

export async function getAudiences() {
  try {
    const resend = await getResendClient();
    const result = await resend.audiences.list();
    return { data: result.data?.data || [], error: null };
  } catch (err) {
    return {
      data: [],
      error: err instanceof Error ? err.message : "Failed to fetch audiences",
    };
  }
}

export async function sendToAudience({
  audienceId,
  subject,
  content,
}: {
  audienceId: string;
  subject: string;
  content: string;
}) {
  try {
    const resend = await getResendClient();

    const audiences = await resend.audiences.list();
    const audience = audiences.data?.data?.find((a) => a.id === audienceId);

    if (!audience) {
      return { error: "Audience not found" };
    }

    // Send email to the audience
    await resend.emails.send({
      from: `${audience.name} <onboarding@resend.dev>`,
      to: `audience:${audienceId}`,
      subject,
      html: content,
    });

    return { success: true };
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "Failed to send email to audience",
    };
  }
}
