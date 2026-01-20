import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type errorSchemas } from "@shared/routes";
import { type InsertResume, type Resume } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

// Helper to handle Zod parsing of responses
function parseResponse<T>(schema: z.ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    console.error("Schema validation failed:", result.error);
    // In production we might want to throw, but for dev we'll log and return raw data casted
    // to avoid breaking the UI completely if the backend schema drifts slightly
    return data as T;
  }
  return result.data;
}

export function useResumes() {
  const { toast } = useToast();
  
  return useQuery({
    queryKey: [api.resumes.list.path],
    queryFn: async () => {
      const res = await fetch(api.resumes.list.path, { credentials: "include" });
      if (res.status === 401) return null; // Handle unauthorized gracefully
      if (!res.ok) throw new Error("Failed to fetch resumes");
      const data = await res.json();
      return parseResponse(api.resumes.list.responses[200], data);
    },
  });
}

export function useResume(id: number) {
  return useQuery({
    queryKey: [api.resumes.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.resumes.get.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch resume");
      const data = await res.json();
      return parseResponse(api.resumes.get.responses[200], data);
    },
    enabled: !!id,
  });
}

export function useCreateResume() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: InsertResume) => {
      const res = await fetch(api.resumes.create.path, {
        method: api.resumes.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to create resume");
      }
      
      const responseData = await res.json();
      return parseResponse(api.resumes.create.responses[201], responseData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.resumes.list.path] });
      toast({
        title: "Success",
        description: "Resume created successfully",
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
}

export function useUpdateResume() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<InsertResume> }) => {
      const url = buildUrl(api.resumes.update.path, { id });
      const res = await fetch(url, {
        method: api.resumes.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to update resume");
      }

      const responseData = await res.json();
      return parseResponse(api.resumes.update.responses[200], responseData);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [api.resumes.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.resumes.get.path, data.id] });
      toast({
        title: "Saved",
        description: "Resume updated successfully",
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
}

export function useDeleteResume() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.resumes.delete.path, { id });
      const res = await fetch(url, {
        method: api.resumes.delete.method,
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to delete resume");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.resumes.list.path] });
      toast({
        title: "Deleted",
        description: "Resume has been deleted",
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
}
