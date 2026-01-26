"use client";

import type { Plugin, PluginsResponse } from "@/lib/types";
import { useContext, useEffect, useState } from "react";
import { Blocks, PackageCheck, PackageX, RotateCw, Search } from "lucide-react";
import { SubPage } from "../sub-page";
import { changeSettings, getSettings, type SettingsStorageType } from "@/lib/settings";
import { $ } from "@/lib/i18n";
import { useKeydown } from "@/hooks/use-keydown";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Button } from "@/components/ui/button";
import { emitter } from "@/lib/emitter";
import { sendGetRequest, toastError } from "@/lib/api";
import { pluginOrMod } from "./plugin-utils";
import { VersionContext } from "@/contexts/api-context";
import { DataTable } from "@/components/data-table";
import { disabledPluginColumns, enabledPluginColumns } from "./columns";
import { base64ToString } from "@/lib/utils";

const DISABLED_SUFFIX = ".disabled";

export default function Plugins() {
  type TabValueType = SettingsStorageType["state.plugins.tab"];

  const versionCtx = useContext(VersionContext);
  const [plugins, setPlugins] = useState<Plugin[]>([]);
  const [folderPath, setFolderPath] = useState("");
  const [currentTab, setCurrentTab] = useState<TabValueType>(getSettings("state.plugins.tab"));
  const [searchString, setSearchString] = useState("");

  const fetchPluginList = async () => {
    if(!versionCtx) return;

    try {
      const res = await sendGetRequest<PluginsResponse>("/api/plugins");
      setPlugins(res.plugins.sort((a, b) => a.name.localeCompare(b.name)));
      setFolderPath(res.folderPath);
    } catch (e: any) {
      toastError(e, `无法获取${pluginOrMod(versionCtx.serverType)}列表`, [

      ]);
    }
  };

  useEffect(() => {
    fetchPluginList();

    emitter.on("refresh-data", () => fetchPluginList());
    return () => {
      emitter.removeAllListeners("refresh-data");
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [versionCtx]);

  useKeydown("ArrowRight", { ctrl: true }, () => setCurrentTab("enabled-list"));
  useKeydown("ArrowLeft", { ctrl: true }, () => setCurrentTab("disabled-list"));
  
  return (
    <SubPage
      title={$("plugins.title")}
      category={$("sidebar.management")}
      icon={<Blocks />}
      className="flex flex-col gap-3">
      <span className="text-sm text-muted-foreground">文件夹路径： {folderPath}</span>
      <Tabs
        value={currentTab}
        onValueChange={(value) => {
          setCurrentTab(value as TabValueType);
          changeSettings("state.plugins.tab", value as TabValueType);
        }}>
        <div className="flex justify-between items-end max-lg:flex-col-reverse max-lg:items-start">
          <TabsList>
            <TabsTrigger value="enabled-list">
              <PackageCheck />
              已启用
            </TabsTrigger>
            <TabsTrigger value="disabled-list">
              <PackageX />
              已禁用
            </TabsTrigger>
          </TabsList>
          <div className="min-w-fit border-b border-b-sidebar-border max-lg:border-b-transparent pb-1 flex gap-2 max-sm:flex-col max-sm:items-start *:cursor-pointer">
            <Button
              variant="ghost"
              title="刷新"
              onClick={() => emitter.emit("refresh-data")}>
              <RotateCw />
            </Button>
            <InputGroup>
              <InputGroupAddon>
                <Search />
              </InputGroupAddon>
              <InputGroupInput
                value={searchString}
                placeholder="搜索插件..."
                onChange={(e) => setSearchString(e.target.value)}/>
            </InputGroup>
          </div>
        </div>
        <TabsContent value="enabled-list">
          <DataTable
            columns={enabledPluginColumns}
            data={[
              ...plugins.filter(({ name, fileName, enabled }) => (
                (
                  name.toLowerCase().includes(searchString.toLowerCase())
                  || decodeURIComponent(base64ToString(fileName)).toLowerCase().includes(searchString.toLowerCase())
                )
                && (enabled && !fileName.endsWith(DISABLED_SUFFIX))
              )),
            ]}
            pagination
            fallbackMessage="暂无插件"/>
        </TabsContent>
        <TabsContent value="disabled-list">
          <DataTable
            columns={disabledPluginColumns}
            data={[
              ...plugins.filter(({ name, fileName, enabled }) => (
                (
                  name.toLowerCase().includes(searchString.toLowerCase())
                  || decodeURIComponent(base64ToString(fileName)).toLowerCase().includes(searchString.toLowerCase())
                )
                && (!enabled || fileName.endsWith(DISABLED_SUFFIX))
              )),
            ]}
            pagination
            fallbackMessage="暂无插件"/>
        </TabsContent>
      </Tabs>
    </SubPage>
  );
}
