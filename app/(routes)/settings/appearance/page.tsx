"use client";

import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { SettingsCard } from "@/components/settings/settings-card";
import { ModeToggle } from "@/components/theme/theme-switcher";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSettings } from "@/hooks/use-settings";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { toast } from "sonner";
import * as z from "zod";

// TODO: More customization options
const formSchema = z.object({
  inboxType: z.enum(["all", "important", "unread"]).optional(),
  maxResults: z.number().min(10).max(200).optional(),
});

export default function AppearancePage() {
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useSettings();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      inboxType: settings.inboxLayout || "all",
      maxResults: settings.maxResults || 10,
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log("values", values);
    setIsSaving(true);
    setSettings((prev) => ({
      ...prev,
      inboxLayout: values.inboxType || prev.inboxLayout,
      maxResults: values.maxResults || prev.maxResults,
    }));
    setIsSaving(false);
    toast.success("Settings saved", {
      className: "bg-foreground text-background",
    });
  }

  return (
    <div className="grid gap-6">
      <SettingsCard
        title="Appearance"
        description="Customize colors, fonts and view options."
        footer={
          <div className="flex justify-end">
            <Button type="submit" form="appearance-form" disabled={isSaving}>
              {isSaving ? "Saving..." : "Save changes"}
            </Button>
          </div>
        }
      >
        <Form {...form}>
          <form id="appearance-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Theme</Label>
                <ModeToggle className="w-full justify-start" />
              </div>

              <FormField
                control={form.control}
                name="inboxType"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>Inbox Layout</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="grid gap-4 sm:grid-cols-3"
                      >
                        <div className="flex items-center space-x-2 rounded-lg border p-4">
                          <RadioGroupItem value="all" id="all" />
                          <Label htmlFor="all">Default</Label>
                        </div>
                        <div className="flex items-center space-x-2 rounded-lg border p-4">
                          <RadioGroupItem value="important" id="important" />
                          <Label htmlFor="important">Important First</Label>
                        </div>
                        <div className="flex items-center space-x-2 rounded-lg border p-4">
                          <RadioGroupItem value="unread" id="unread" />
                          <Label htmlFor="unread">Unread First</Label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="maxResults"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>Max conversations per page</FormLabel>
                    <FormControl>
                      <div className="space-y-4">
                        <RadioGroup
                          onValueChange={(value) => field.onChange(Number(value) || 10)}
                          value={field.value?.toString()}
                          className="grid grid-cols-2 gap-2 sm:grid-cols-5"
                        >
                          {[10, 25, 50, 100, 200].map((value) => (
                            <Label key={value} htmlFor={`max-${value}`} className="cursor-pointer">
                              <div className="flex items-center space-x-2 rounded-lg border p-4 hover:bg-accent">
                                <RadioGroupItem value={value.toString()} id={`max-${value}`} />
                                <span className="text-sm font-medium">{value}</span>
                              </div>
                            </Label>
                          ))}
                        </RadioGroup>
                        <div className="flex items-center space-x-2 rounded-lg border p-4">
                          <div className="flex-1 space-y-3">
                            <div className="flex items-center gap-4">
                              <Slider
                                className="flex-1"
                                min={10}
                                max={200}
                                step={5}
                                value={[Number(field.value) || 10]}
                                onValueChange={(value) => field.onChange(value[0])}
                              />
                              <div className="w-12 rounded-md border px-2 py-1 text-center text-sm">
                                {field.value}
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Fine-tune the number of conversations shown per page
                            </p>
                          </div>
                        </div>
                      </div>
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </form>
        </Form>
      </SettingsCard>
    </div>
  );
}
