import { getBgMoodColor, getMoodIcon } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface MoodItem {
  mood: string;
  count: number;
}

interface MoodChartProps {
  moodData: MoodItem[];
  title: string;
  subtitle: string;
}

export function MoodChart({ moodData, title, subtitle }: MoodChartProps) {
  const totalMoods = moodData.reduce((acc, item) => acc + item.count, 0);

  // Map mood names to emoji icons
  const moodIcons: Record<string, string> = {
    amazing: "grin-stars",
    happy: "smile",
    okay: "meh",
    sad: "frown",
    upset: "angry",
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">{title}</CardTitle>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {moodData.map((item) => (
            <div key={item.mood} className="flex flex-col items-center">
              <div 
                className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center text-white text-2xl mb-2",
                  getBgMoodColor(item.mood)
                )}
              >
                <i className={`fas fa-${getMoodIcon(item.mood)}`}></i>
              </div>
              <span className="text-sm font-medium capitalize">{item.mood}</span>
              <span className="text-lg font-bold">{item.count}</span>
              {totalMoods > 0 && (
                <span className="text-xs text-muted-foreground">
                  {Math.round((item.count / totalMoods) * 100)}%
                </span>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

import { cn } from "@/lib/utils";
