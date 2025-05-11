import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Student, Report } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";

interface ReportFormProps {
  student: Student;
  initialData?: Report;
  onSave: (data: Partial<Report>) => void;
}

// Form schema
const reportSchema = z.object({
  date: z.string().min(1, "Date is required"),
  mood: z.enum(["amazing", "happy", "okay", "sad", "upset"], {
    required_error: "Please select a mood",
  }),
  activities: z.array(z.string()).optional(),
  notes: z.string().optional(),
  achievements: z.array(z.string()).optional(),
});

type ReportFormValues = z.infer<typeof reportSchema>;

export function ReportForm({ student, initialData, onSave }: ReportFormProps) {
  const [availableActivities, setAvailableActivities] = useState<string[]>([]);
  const [customActivities, setCustomActivities] = useState<string[]>([]);
  const [newActivity, setNewActivity] = useState("");
  const [newAchievement, setNewAchievement] = useState("");

  // Fetch available activities
  const { data: activitiesData } = useQuery({
    queryKey: ["/api/activities", student.classId],
    queryFn: async () => {
      const response = await fetch(`/api/activities?classId=${student.classId}`);
      if (!response.ok) throw new Error("Failed to fetch activities");
      return response.json();
    },
  });

  useEffect(() => {
    if (activitiesData) {
      setAvailableActivities(activitiesData.map((a: any) => a.name));
    }
  }, [activitiesData]);

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split("T")[0];

  // Setup form with initial values
  const form = useForm<ReportFormValues>({
    resolver: zodResolver(reportSchema),
    defaultValues: {
      date: initialData?.date || today,
      mood: initialData?.mood || "okay",
      activities: initialData?.activities || [],
      notes: initialData?.notes || "",
      achievements: initialData?.achievements || [],
    },
  });

  // Handle form submission
  function onSubmit(values: ReportFormValues) {
    onSave({
      studentId: student.id,
      date: values.date,
      mood: values.mood,
      activities: values.activities,
      notes: values.notes,
      achievements: values.achievements,
    });
  }

  // Add custom activity
  const addCustomActivity = () => {
    if (newActivity.trim()) {
      setCustomActivities([...customActivities, newActivity.trim()]);
      setNewActivity("");
    }
  };

  // Add achievement
  const addAchievement = () => {
    if (newAchievement.trim()) {
      const currentAchievements = form.getValues("achievements") || [];
      form.setValue("achievements", [...currentAchievements, newAchievement.trim()]);
      setNewAchievement("");
    }
  };

  return (
    <Form {...form}>
      <form id="report-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Date</FormLabel>
              <FormControl>
                <Input type="date" {...field} max={today} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="mood"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mood</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select mood" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="amazing">Amazing</SelectItem>
                  <SelectItem value="happy">Happy</SelectItem>
                  <SelectItem value="okay">Okay</SelectItem>
                  <SelectItem value="sad">Sad</SelectItem>
                  <SelectItem value="upset">Upset</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

        <div>
          <FormLabel>Activities Completed</FormLabel>
          <div className="mt-2 space-y-2">
            {[...availableActivities, ...customActivities].map((activity) => (
              <div key={activity} className="flex items-center space-x-2">
                <Checkbox
                  id={`activity-${activity}`}
                  checked={form.watch("activities")?.includes(activity)}
                  onCheckedChange={(checked) => {
                    const currentActivities = form.getValues("activities") || [];
                    const updatedActivities = checked
                      ? [...currentActivities, activity]
                      : currentActivities.filter((a) => a !== activity);
                    form.setValue("activities", updatedActivities);
                  }}
                />
                <label
                  htmlFor={`activity-${activity}`}
                  className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {activity}
                </label>
              </div>
            ))}
          </div>

          <div className="flex mt-2">
            <Input
              value={newActivity}
              onChange={(e) => setNewActivity(e.target.value)}
              placeholder="Add custom activity"
              className="mr-2"
            />
            <Button type="button" variant="outline" onClick={addCustomActivity}>
              Add
            </Button>
          </div>
        </div>

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Teacher Notes</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="Add detailed notes about the student's day..."
                  rows={4}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <div>
          <FormLabel>Achievements</FormLabel>
          <div className="mt-1 flex flex-wrap gap-2">
            {form.watch("achievements")?.map((achievement, index) => (
              <div
                key={`${achievement}-${index}`}
                className="inline-flex items-center px-3 py-1 rounded-md bg-primary/10 text-primary"
              >
                <span className="mr-1">
                  <i className="fas fa-star text-accent mr-1"></i>
                  {achievement}
                </span>
                <button
                  type="button"
                  className="ml-1 text-gray-500 hover:text-gray-700"
                  onClick={() => {
                    const updatedAchievements = form
                      .getValues("achievements")
                      ?.filter((_, i) => i !== index);
                    form.setValue("achievements", updatedAchievements || []);
                  }}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
          <div className="flex mt-2">
            <Input
              value={newAchievement}
              onChange={(e) => setNewAchievement(e.target.value)}
              placeholder="Add achievement"
              className="mr-2"
            />
            <Button type="button" variant="outline" onClick={addAchievement}>
              Add
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}
