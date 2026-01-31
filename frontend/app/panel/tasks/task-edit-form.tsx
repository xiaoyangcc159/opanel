import type { ScheduledTask } from "@/lib/types";
import { useState } from "react";
import Link from "next/link";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { base64ToString } from "@/lib/utils";
import { googleSansCode } from "@/lib/fonts";
import { Button } from "@/components/ui/button";

function setCronPart(originalCron: string, index: number, newValue: string): string {
  const parts = originalCron.split(" ");
  parts[index] = newValue;
  return parts.join(" ");
}

function cronWeekToValue(week: string): "0" | "1" | "2" | "3" | "4" | "5" | "6" | "*" {
  switch(week.toLowerCase()) {
    case "*":
    case "0":
    case "1":
    case "2":
    case "3":
    case "4":
    case "5":
    case "6":
      return week as any;
    case "7":
      return "0";
    case "mon":
      return "1";
    case "tue":
      return "2";
    case "wed":
      return "3";
    case "thu":
      return "4";
    case "fri":
      return "5";
    case "sat":
      return "6";
    case "sun":
      return "0";
    default:
      return "*";
  }
}

const formSchema = z.object({
  name: z.string().min(1, "任务名称不能为空"),
  cron: z.string().min(1, "Cron 表达式不能为空"),
  commands: z.array(z.string().min(1, "指令不能为空")).min(1, "至少需要一个指令"),
  enabled: z.boolean()
});

export function TaskEditForm({
  task
}: {
  task: ScheduledTask
}) {
  const [cronInputType, setCronInputType] = useState<"simple" | "advanced">("simple");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    values: {
      name: base64ToString(task.name),
      cron: task.cron,
      commands: task.commands,
      enabled: task.enabled
    }
  });

  const handleSubmit = async (data: z.infer<typeof formSchema>) => {

  };

  return (
    <Form {...form}>
      <form
        className="flex-1 p-4 flex flex-col gap-4 overflow-y-auto o-scrollbar"
        data-taskid={task.id}
        onSubmit={form.handleSubmit(handleSubmit)}>
        <FormField
          name="name"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>任务名称</FormLabel>
              <FormControl>
                <Input
                  placeholder="请输入任务名称..."
                  autoComplete="off"
                  {...field}/>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}/>
        
        <div className="flex flex-col gap-3">
          <Label>定时设置</Label>
          <Tabs
            className="*:data-[slot=tabs-content]:p-2"
            value={cronInputType}
            onValueChange={(value) => setCronInputType(value as any)}>
            <TabsList>
              <TabsTrigger value="simple">简单</TabsTrigger>
              <TabsTrigger value="advanced">高级</TabsTrigger>
            </TabsList>
            <TabsContent value="simple">
              <FormField
                name="cron"
                control={form.control}
                render={({ field }) => {
                  const cronParts = field.value.split(" ");

                  return (
                    <div className="w-full grid grid-cols-3 max-sm:grid-cols-2 gap-4">
                      <FormItem className="flex-1">
                        <FormLabel>分钟</FormLabel>
                        <FormControl>
                          <Input
                            value={cronParts[0]}
                            onChange={(e) => field.onChange(setCronPart(field.value, 0, e.target.value))}
                            autoComplete="off"/>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                      <FormItem className="flex-1">
                        <FormLabel>小时</FormLabel>
                        <FormControl>
                          <Input
                            value={cronParts[1]}
                            onChange={(e) => field.onChange(setCronPart(field.value, 1, e.target.value))}
                            autoComplete="off"/>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                      <FormItem className="flex-1">
                        <FormLabel>日</FormLabel>
                        <FormControl>
                          <Input
                            value={cronParts[2]}
                            onChange={(e) => field.onChange(setCronPart(field.value, 2, e.target.value))}
                            autoComplete="off"/>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                      <FormItem className="flex-1">
                        <FormLabel>月</FormLabel>
                        <FormControl>
                          <Input
                            value={cronParts[3]}
                            onChange={(e) => field.onChange(setCronPart(field.value, 3, e.target.value))}
                            autoComplete="off"/>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                      <FormItem className="flex-1">
                        <FormLabel>星期</FormLabel>
                        <FormControl>
                          <Select
                            value={cronWeekToValue(cronParts[4])}
                            onValueChange={(value) => field.onChange(setCronPart(field.value, 4, value))}>
                            <SelectTrigger className="w-full">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="*">每星期</SelectItem>
                              <SelectItem value="1">星期一</SelectItem>
                              <SelectItem value="2">星期二</SelectItem>
                              <SelectItem value="3">星期三</SelectItem>
                              <SelectItem value="4">星期四</SelectItem>
                              <SelectItem value="5">星期五</SelectItem>
                              <SelectItem value="6">星期六</SelectItem>
                              <SelectItem value="0">星期日</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    </div>
                  );
                }}/>
            </TabsContent>
            <TabsContent value="advanced">
              <FormField
                name="cron"
                control={form.control}
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Cron 表达式</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="请输入 Cron 表达式..."
                        autoComplete="off"
                        className={googleSansCode.className}
                        {...field}/>
                    </FormControl>
                    <FormMessage />
                    <span className="text-sm text-muted-foreground">
                      Cron 表达式语法请参考 <Link href="https://ibm.com/docs/en/db2/latest?topic=task-unix-cron-format" target="_blank" rel="noopener noreferrer">UNIX cron format</Link>
                    </span>
                  </FormItem>
                )}/>
            </TabsContent>
          </Tabs>
        </div>

        <div className="flex-1 min-h-40 flex flex-col gap-2">
          <Label>指令列表</Label>
          <div className="flex-1 border rounded-md">

          </div>
        </div>

        <Button
          type="submit"
          className="w-fit">
          保存
        </Button>
      </form>
    </Form>
  );
}
