"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  phone: z.string().regex(/^\+1\d{10}$/, "Format: +1XXXXXXXXXX"),
  reminderDay: z.number().int().min(1).max(31),
  notes: z.string().optional(),
});

type FormData = {
  name: string;
  phone: string;
  reminderDay: number;
  notes?: string;
};

interface ClientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client: {
    name: string;
    phone: string;
    reminderDay: number;
    notes: string | null;
  } | null;
  onSave: (data: FormData) => void;
}

export function ClientDialog({
  open,
  onOpenChange,
  client,
  onSave,
}: ClientDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      phone: "+1",
      reminderDay: 1,
      notes: "",
    },
  });

  useEffect(() => {
    if (client) {
      reset({
        name: client.name,
        phone: client.phone,
        reminderDay: client.reminderDay,
        notes: client.notes || "",
      });
    } else {
      reset({ name: "", phone: "+1", reminderDay: 1, notes: "" });
    }
  }, [client, open, reset]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{client ? "Edit Client" : "Add New Client"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSave)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              placeholder="John Doe"
              {...register("name")}
            />
            {errors.name && (
              <p className="text-xs text-red-500">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              placeholder="+17875551234"
              {...register("phone")}
            />
            {errors.phone && (
              <p className="text-xs text-red-500">{errors.phone.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="reminderDay">Reminder Day (1-31)</Label>
            <Input
              id="reminderDay"
              type="number"
              min={1}
              max={31}
              {...register("reminderDay", { valueAsNumber: true })}
            />
            {errors.reminderDay && (
              <p className="text-xs text-red-500">
                {errors.reminderDay.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Input
              id="notes"
              placeholder="Prefers fade cuts..."
              {...register("notes")}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-[#2563EB] hover:bg-[#1D4ED8]"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : client ? "Update" : "Add Client"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
