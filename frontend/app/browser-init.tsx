"use client";

import { useEffect } from "react";
import { getSettings } from "@/lib/settings";
import { notoSansSC, notoSansTC } from "@/lib/fonts";

export function BrowserInit() {
  useEffect(() => {
    if(getSettings("system.language") === "zh-tw" || getSettings("system.language") === "zh-hk") {
      document.body.classList.remove(notoSansSC.className);
      document.body.classList.add(notoSansTC.className);
    }
  }, []);

  return <></>;
}
