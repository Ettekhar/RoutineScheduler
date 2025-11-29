import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Clock, Save, Loader2 } from "lucide-react";
import type { LunchBreakConfig } from "@shared/schema";

export function LunchBreakSettings() {
  const { toast } = useToast();
  const [formData, setFormData] = useState<LunchBreakConfig | null>(null);

  const { data: currentConfig, isLoading } = useQuery<LunchBreakConfig>({
    queryKey: ["/api/lunch-break"],
    onSuccess: (data) => setFormData(data),
  });

  const updateMutation = useMutation({
    mutationFn: (data: LunchBreakConfig) => 
      apiRequest("POST", "/api/lunch-break", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/lunch-break"] });
      toast({
        title: "Lunch Break Updated",
        description: "Lunch break settings have been saved.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (isLoading || !formData) {
    return (
      <Card data-testid="lunch-break-settings">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Lunch Break
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-24" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card data-testid="lunch-break-settings">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Lunch Break Schedule
        </CardTitle>
        <CardDescription>
          Configure daily lunch break - no classes will be scheduled during this time
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Enable/Disable Toggle */}
        <div className="flex items-center justify-between">
          <Label htmlFor="lunch-enabled" className="text-base font-medium">
            Enable Lunch Break
          </Label>
          <Switch
            id="lunch-enabled"
            checked={formData.enabled}
            onCheckedChange={(checked) =>
              setFormData({ ...formData, enabled: checked })
            }
            data-testid="switch-lunch-enabled"
          />
        </div>

        {/* Time Inputs */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="lunch-start" className="text-sm font-medium">
              Start Time
            </Label>
            <Input
              id="lunch-start"
              type="time"
              value={formData.startTime}
              onChange={(e) =>
                setFormData({ ...formData, startTime: e.target.value })
              }
              disabled={!formData.enabled}
              data-testid="input-lunch-start"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lunch-end" className="text-sm font-medium">
              End Time
            </Label>
            <Input
              id="lunch-end"
              type="time"
              value={formData.endTime}
              onChange={(e) =>
                setFormData({ ...formData, endTime: e.target.value })
              }
              disabled={!formData.enabled}
              data-testid="input-lunch-end"
            />
          </div>
        </div>

        {/* Current Settings Display */}
        {formData.enabled && (
          <div className="rounded-lg bg-muted p-4">
            <p className="text-sm text-muted-foreground">
              Current lunch break: <span className="font-semibold text-foreground">{formData.startTime}</span> to{" "}
              <span className="font-semibold text-foreground">{formData.endTime}</span>
            </p>
          </div>
        )}

        {!formData.enabled && (
          <div className="rounded-lg bg-amber-50 dark:bg-amber-950 p-4">
            <p className="text-sm text-amber-800 dark:text-amber-200">
              Lunch break is disabled - classes can be scheduled at any time
            </p>
          </div>
        )}

        {/* Save Button */}
        <Button
          onClick={() => updateMutation.mutate(formData)}
          disabled={updateMutation.isPending}
          className="w-full"
          data-testid="button-save-lunch-break"
        >
          {updateMutation.isPending ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          Save Lunch Break Settings
        </Button>
      </CardContent>
    </Card>
  );
}
