import type { ArrayItem, GithubReleaseResponse } from "@/lib/types";
import { type PropsWithChildren, useEffect, useState } from "react";
import * as MarkdownJSX from "markdown-to-jsx";
import axios from "axios";
import { compare } from "semver";
import { RotateCw } from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import { Spinner } from "@/components/ui/spinner";
import { version } from "@/lib/global";
import { googleSansCode } from "@/lib/fonts";
import { cn, isPreviewVersion } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toastError } from "@/lib/api";
import { changeSettings, getSettings } from "@/lib/settings";

function preprocessMarkdown(markdown: string): string {
  // Github username
  markdown = markdown.replace(/@([\w-_]+)/g, (match, username) => `**[${match}](https://github.com/${username})**`);
  // Issue reference
  markdown = markdown.replace(/#(\d+)/g, (match, issueId) => `[${match}](https://github.com/opanel-mc/opanel/issues/${issueId})`);

  return markdown;
}

export function UpdateDialog({
  children,
  asChild
}: PropsWithChildren & {
  asChild?: boolean
}) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [hasNewUpdate, setHasNewUpdate] = useState<boolean | null>(null);
  const [releaseInfo, setReleaseInfo] = useState<ArrayItem<GithubReleaseResponse> | null>(null);
  const [previewEnabled, setPreviewEnabled] = useState(getSettings("system.preview-channel"));

  const checkUpdate = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get<GithubReleaseResponse>("https://api.github.com/repos/opanel-mc/opanel/releases");

      for(const release of data) {
        const tagName = release.tag_name.replaceAll("rc", "-rc");
        if(!previewEnabled && (release.prerelease || isPreviewVersion(tagName))) continue;
        if(compare(tagName, version) > 0) {
          setHasNewUpdate(true);
          setReleaseInfo(release);
          setLoading(false);
          return;
        }
      }

      setHasNewUpdate(false);
      setLoading(false);
    } catch (e: any) {
      toastError(e, "检查更新失败", [
        [403, "Github API 请求频率超限"],
        [500, "Github API 内部错误"]
      ]);
      setLoading(false);
      setError(true);
    }
  };

  useEffect(() => {
    changeSettings("system.preview-channel", previewEnabled);
  }, [previewEnabled]);

  return (
    <Dialog onOpenChange={(open) => (open && hasNewUpdate === null) && checkUpdate()}>
      <DialogTrigger asChild={asChild}>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>检查更新</DialogTitle>
          <DialogDescription>
            在此查看是否有新的OPanel更新可用
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-6">
          <div className="min-h-18 px-4 border rounded-md flex items-center gap-4">
            <Logo size={26}/>
            <div className="py-2 flex flex-col justify-between">
              <span className="font-semibold whitespace-nowrap">
                {
                  loading
                  ? "检查中..."
                  : (
                    error
                    ? "检查更新失败"
                    : (
                      hasNewUpdate
                      ? "有新更新可用"
                      : "当前已是最新版本"
                    )
                  )
                }
              </span>
              <span className="text-sm text-muted-foreground">OPanel {version + (hasNewUpdate ? ` → ${releaseInfo?.tag_name}` : "")}</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="ml-auto cursor-pointer"
              disabled={loading}
              onClick={() => checkUpdate()}>
              {loading ? <Spinner /> : <RotateCw />}
            </Button>
          </div>
          {(hasNewUpdate && releaseInfo) && (
            <div className="max-h-64 px-3 space-y-3 overflow-y-auto o-scrollbar">
              <h2 className="font-semibold text-xl">{releaseInfo.tag_name} 更新日志</h2>
              <MarkdownJSX.default
                options={{
                  wrapper: "article",
                  forceWrapper: true
                }}
                className={cn("text-sm *:wrap-anywhere", googleSansCode.className)}>
                {preprocessMarkdown(releaseInfo.body)}
              </MarkdownJSX.default>
            </div>
          )}
        </div>
        <DialogFooter className="flex-row! justify-between! items-center">
          <div className="flex items-center gap-2">
            <Switch
              checked={previewEnabled}
              onCheckedChange={setPreviewEnabled}/>
            <Label>预览版</Label>
          </div>
          <DialogClose asChild>
            <Button variant="outline">
              关闭
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
