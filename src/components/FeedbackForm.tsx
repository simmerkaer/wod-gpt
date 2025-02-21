import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "./ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";

interface FeedbackFormProps {
  isLoading: boolean;
  giveFeedback: (email: string, feedback: string) => void;
}

const formSchema = z.object({
  email: z.string().email().optional().nullable(),
  feedback: z.string().min(2).max(3000),
});

export const FeedbackForm: React.FunctionComponent<FeedbackFormProps> = ({
  isLoading,
  giveFeedback,
}) => {
  const [feedbackProvided, setFeedbackProvided] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: null,
      feedback: undefined,
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    giveFeedback(values.email ?? "anon", values.feedback);
    setFeedbackProvided(true);
  }

  return (
    <div className="p-4">
      {feedbackProvided ? (
        <div className="text-center"> Thank you! </div>
      ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormDescription>Optional</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="feedback"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Feedback</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isLoading}>
              Submit
            </Button>
          </form>
        </Form>
      )}
    </div>
  );
};
