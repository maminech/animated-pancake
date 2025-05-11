import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

// List of common emoji icons
const emojiOptions = [
  { value: "📚", label: "📚 Books" },
  { value: "🧮", label: "🧮 Mathematics" },
  { value: "🔬", label: "🔬 Science" },
  { value: "🖌️", label: "🖌️ Art" },
  { value: "🎵", label: "🎵 Music" },
  { value: "🌟", label: "🌟 Star" },
  { value: "🏆", label: "🏆 Trophy" },
  { value: "🥇", label: "🥇 Gold Medal" },
  { value: "🤝", label: "🤝 Cooperation" },
  { value: "❤️", label: "❤️ Heart" },
  { value: "🧠", label: "🧠 Brain" },
  { value: "🏃", label: "🏃 Running" },
  { value: "🎪", label: "🎪 Performance" },
  { value: "🧩", label: "🧩 Puzzle" },
  { value: "🔍", label: "🔍 Research" },
];

// Define the form schema
const formSchema = z.object({
  name: z.string().min(3, { message: "Name must be at least 3 characters" }).max(50),
  description: z.string().min(10, { message: "Description must be at least 10 characters" }).max(200),
  icon: z.string().min(1, { message: "Icon is required" }),
  category: z.enum(["academic", "behavioral", "attendance", "special"], {
    required_error: "Category is required"
  }),
});

interface BadgeFormProps {
  onSuccess?: () => void;
}

export function BadgeForm({ onSuccess }: BadgeFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Initialize the form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      icon: "🌟",
      category: "academic",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsSubmitting(true);
      
      // Send to API
      await apiRequest("POST", "/api/badges", values);
      
      // Show success message
      toast({
        title: "Badge created",
        description: "The badge has been created successfully.",
      });
      
      // Reset form
      form.reset({
        name: "",
        description: "",
        icon: "🌟",
        category: "academic",
      });
      
      // Invalidate queries to refresh data
      await queryClient.invalidateQueries({ queryKey: ["/api/badges"] });
      
      // Call success callback if provided
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Error creating badge:", error);
      toast({
        title: "Failed to create badge",
        description: "There was an error creating the badge. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 animate-in fade-in-50 duration-300">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input
                  placeholder="E.g., Reading Star"
                  {...field}
                  disabled={isSubmitting}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="E.g., Awarded for exceptional reading progress and completing chapter books"
                  className="resize-none"
                  {...field}
                  disabled={isSubmitting}
                />
              </FormControl>
              <FormDescription>
                Describe what a student needs to do to earn this badge.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="icon"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Icon</FormLabel>
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={isSubmitting}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select an icon" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {emojiOptions.map((emoji) => (
                      <SelectItem key={emoji.value} value={emoji.value}>
                        {emoji.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={isSubmitting}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="academic">Academic</SelectItem>
                    <SelectItem value="behavioral">Behavioral</SelectItem>
                    <SelectItem value="attendance">Attendance</SelectItem>
                    <SelectItem value="special">Special</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create Badge"}
          </Button>
        </div>
      </form>
    </Form>
  );
}