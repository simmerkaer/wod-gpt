import * as React from "react";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "./ui/drawer";
import { Button } from "./ui/button";
import { z } from "zod";
import { useForm } from "react-hook-form";
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
import { zodResolver } from "@hookform/resolvers/zod";
import { Textarea } from "./ui/textarea";
import { useFeedback } from "@/hooks/useFeedback";
import { useState } from "react";

const formSchema = z.object({
  email: z.string().optional().or(z.string().email()),
  feedback: z.string().min(2).max(1000),
});

interface GiveFeedbackProps {}

const GiveFeedback: React.FunctionComponent<GiveFeedbackProps> = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [feedbackProvided, setFeedbackProvided] = useState(false);
  const [giveFeedback, isLoading] = useFeedback();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      feedback: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    giveFeedback(values.email ?? "anon", values.feedback);
    setFeedbackProvided(true);
  }

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerTrigger asChild>
        <Button variant="outline" className="text-xs border-2">
          Help us improve!
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle className="text-center">Provide feedback</DrawerTitle>
          <DrawerDescription>
            We are always looking to improve our workout generation. Please
            provide feedback below if you have any suggestions or issues.
          </DrawerDescription>
        </DrawerHeader>
        <div className="p-4">
          {feedbackProvided ? (
            <div className="text-center"> Thank you! </div>
          ) : (
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-8"
              >
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
      </DrawerContent>
    </Drawer>
  );
};

export default GiveFeedback;
