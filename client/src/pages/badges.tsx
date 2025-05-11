import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { BadgeGrid } from "@/components/badges/badge-grid";
import { BadgeForm } from "@/components/badges/badge-form";
import { Button } from "@/components/ui/button";
import { ChevronLeft, PlusIcon } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { motion } from "framer-motion";
import { Link } from "wouter";

export default function Badges() {
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  
  // Determine if user can add badges
  const canAddBadges = user?.role === "teacher" || user?.role === "director" || user?.role === "admin";
  
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="container py-8"
    >
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <div>
            <div className="flex items-center mb-2">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm" className="gap-1">
                  <ChevronLeft className="h-4 w-4" />
                  Back
                </Button>
              </Link>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Achievement Badges</h1>
            <p className="text-muted-foreground">
              Recognize and celebrate student achievements with digital badges
            </p>
          </div>
          
          {canAddBadges && (
            <Dialog open={showForm} onOpenChange={setShowForm}>
              <DialogTrigger asChild>
                <Button className="gap-1">
                  <PlusIcon className="h-4 w-4" />
                  Create Badge
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Create New Badge</DialogTitle>
                  <DialogDescription>
                    Design a new achievement badge to reward student progress.
                  </DialogDescription>
                </DialogHeader>
                <BadgeForm 
                  onSuccess={() => setShowForm(false)} 
                />
              </DialogContent>
            </Dialog>
          )}
        </div>
        
        <BadgeGrid showAwardButtons={false} />
      </div>
    </motion.div>
  );
}