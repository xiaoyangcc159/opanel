import type { ServerType } from "@/lib/types";
import { apiUrl, sendDeleteRequest, sendPostRequest } from "@/lib/api";
import { emitter } from "@/lib/emitter";

export function pluginOrMod(serverType: ServerType): "plugin" | "mod" {
  switch(serverType) {
    case "Bukkit":
    case "Spigot":
    case "Paper":
    case "Folia":
      return "plugin";
    case "Fabric":
    case "Forge":
    case "Neoforge":
      return "mod";
  }
}

export async function downloadPlugin(fileName: string) {
  window.open(`${apiUrl}/api/plugins/${fileName}`, "_blank");
}

export async function togglePlugin(fileName: string, enabled: boolean) {
  try {
    await sendPostRequest(`/api/plugins/${fileName}?enabled=${enabled ? "1" : "0"}`);
    emitter.emit("refresh-data");
  } catch (e: any) {

  }
}

export async function deletePlugin(fileName: string) {
  try {
    await sendDeleteRequest(`/api/plugins/${fileName}`);
    emitter.emit("refresh-data");
  } catch (e: any) {

  }
}
