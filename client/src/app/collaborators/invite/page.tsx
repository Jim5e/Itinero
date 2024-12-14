"use client";
import { redirect, useSearchParams } from "next/navigation";
import Layout from "@/components/layout";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { inviteCollaboratorSchema } from "@/schemas";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/form";
import { Input } from "@/components/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/select"
import axios from "axios";
import { useSession } from "next-auth/react";
import { useToast } from "@/hooks/use-toast";
import { ToastAction } from "@/components/ui/toast";

const InviteCollaboratorPage = () => {
  const { data: session, status } = useSession();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const itineraryId = searchParams.get("itineraryId"); // Access the `itineraryId` from the query parameters

  if (status === "unauthenticated") {
    redirect("/auth/signin");
  }

  const form = useForm<z.infer<typeof inviteCollaboratorSchema>>({
    resolver: zodResolver(inviteCollaboratorSchema),
    defaultValues: {
      email: "",
      role: "VIEWER",
    },
  });

  const onSubmit = async (data: z.infer<typeof inviteCollaboratorSchema>) => {
    // POST request to the server to invite a collaborator
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/collab/invite`,
        {
          itineraryId: itineraryId,
          email: data.email,
          role: data.role,
        },
        {
          headers: {
            Authorization: `Bearer ${session?.user.accessToken}`,
          },
        }
      );

      if (response.data.found) {
        toast({
          variant: "default",
          title: "Collaborator invited",
          description: response.data.message,
        });
      }
    } catch (error: any) {
      if (!error.response.data.found) {
        toast({
          variant: "destructive",
          title: "User not found",
          description: error.response.data.message,
          action: <ToastAction altText="Try again">Try again</ToastAction>,
        })
      }
      console.error("Error inviting collaborator:", error.response.data);
    }
  };

  return (
    status === "loading" ? (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 border-solid border-gray-300" />
        <span className="sr-only">Loading...</span>
      </div>
    ) : (
      <Layout breadcrumb="Invite">
        <div className="flex flex-col gap-8 p-4 w-full max-w-lg">
          <div className="flex flex-col gap-2">
            <h1 className="font-bold text-2xl">Invite Collaborator</h1>
            <span className="text-sm text-muted-foreground">You want to travel or plan a trip with someone? Invite them to collaborate on your itinerary.</span>
          </div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <div className="flex flex-col gap-4">
                {/* Email Field */}
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="Enter your email"
                          {...field}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                {/* Role Field */}
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role</FormLabel>
                      <FormControl>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="VIEWER">Viewer</SelectItem>
                            <SelectItem value="EDITOR">Editor</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                    </FormItem>
                  )}
                />
                <Button type="submit">Invite</Button>
              </div>
            </form>
          </Form>
        </div>
      </Layout>
    )
  );
};

export default InviteCollaboratorPage;
