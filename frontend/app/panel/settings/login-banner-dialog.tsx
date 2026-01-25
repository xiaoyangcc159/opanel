import { useEffect, useState, type PropsWithChildren } from "react";
import { toast } from "sonner";
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
import { $ } from "@/lib/i18n";
import { apiUrl, sendDeleteRequest, toastError, uploadFile } from "@/lib/api";
import { Brand } from "@/components/logo";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { fileToDataUrl } from "@/lib/utils";

export function LoginBannerDialog({
  children,
  asChild
}: PropsWithChildren & {
  asChild?: boolean
}) {
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [file, setFile] = useState<File | null>(null);
  const [previewDataUrl, setPreviewDataUrl] = useState<string | null>(null);
  const [timestamp, setTimestamp] = useState<number>(Date.now());

  const handleUpload = async (file: File) => {
    try {
      await uploadFile("/assets/upload/login-banner", file);
      setDialogOpen(false);
      setFile(null);
      setPreviewDataUrl(null);
      setTimestamp(Date.now());
      toast.success($("settings.login-banner.upload.success"));
    } catch (e: any) {
      toastError(e, $("settings.login-banner.upload.error"), [
        [400, $("settings.login-banner.upload.error.400")],
        [401, $("common.error.401")],
        [500, $("common.error.500")]
      ]);
    }
  };

  const handleReset = async () => {
    try {
      await sendDeleteRequest("/assets/reset/login-banner");
      setDialogOpen(false);
      setFile(null);
      setPreviewDataUrl(null);
      setTimestamp(Date.now());
      toast.success($("settings.login-banner.reset.success"));
    } catch (e: any) {
      toastError(e, $("settings.login-banner.reset.error"), [
        [401, $("common.error.401")],
        [500, $("common.error.500")]
      ]);
    }
  };

  useEffect(() => {
    if(!dialogOpen) {
      setFile(null);
      setPreviewDataUrl(null);
    }
  }, [dialogOpen]);

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild={asChild}>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{$ ("settings.login-banner.title")}</DialogTitle>
          <DialogDescription>
            {$ ("settings.login-banner.description")}
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="aspect-[2/1] rounded-sm border flex overflow-hidden">
            <div
              className="flex-2/5 h-full bg-cover bg-center shadow-[inset_0px_0px_35px_-15px_rgba(0,0,0,0.85)]"
              style={{ backgroundImage: `url(${previewDataUrl ?? `${apiUrl}/assets/login-banner?t=${timestamp}`})` }}/>
            <div className="flex-3/5 border-l z-10 flex justify-center items-center">
              <div className="flex flex-col items-center gap-6">
                <Brand className="[&_svg]:w-20"/>
                <div className="aspect-[3/2] w-24 p-1.5 rounded-xs border flex flex-col gap-1">
                  <div className="w-2/5 h-0.5 bg-foreground"/>
                  <div className="w-4/5 h-0.5 bg-muted-foreground mb-auto"/>
                  <div className="flex justify-between">
                    <div className="w-1/5 h-0.5 bg-foreground"/>
                    <div className="w-1/5 h-0.5 bg-muted-foreground"/>
                  </div>
                  <div className="h-2.5 rounded-xs border"/>
                  <div className="h-2.5 bg-foreground rounded-xs opacity-50"/>
                </div>
              </div>
            </div>
          </div>
          <Field>
            <FieldLabel>{$("settings.login-banner.input.label")}</FieldLabel>
            <Input
              type="file"
              accept=".png,.jpg,.jpeg,.webp"
              onChange={async (e) => {
                const fileList = (e.target as HTMLInputElement).files;
                if(!fileList) return;
                if(fileList.length === 0) {
                  setFile(null);
                  setPreviewDataUrl(null);
                  return;
                }
                setFile(fileList[0]);
                setPreviewDataUrl(await fileToDataUrl(fileList[0]));
              }}/>
            <FieldDescription>
              {$("settings.login-banner.input.description")}
            </FieldDescription>
          </Field>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            className="mr-auto"
            onClick={() => handleReset()}>
            {$("settings.login-banner.reset")}
          </Button>
          <DialogClose asChild>
            <Button variant="outline">{$("dialog.cancel")}</Button>
          </DialogClose>
          <Button
            disabled={file === null}
            onClick={() => file && handleUpload(file)}>
            {$("dialog.confirm")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
