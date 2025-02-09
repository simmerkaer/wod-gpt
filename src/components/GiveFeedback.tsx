import { useFeedback } from "@/hooks/useFeedback";
import * as React from "react";
import { useState } from "react";
import { useMediaQuery } from "usehooks-ts";
import { FeedbackForm } from "./FeedbackForm";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "./ui/drawer";

interface GiveFeedbackProps {}

const GiveFeedback: React.FunctionComponent<GiveFeedbackProps> = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [giveFeedback, isLoading] = useFeedback();
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const renderButton = () => (
    <Button variant="outline" className="text-xs border-2">
      Help us improve!
    </Button>
  );

  const description =
    "We are always looking to improve our workout generation. Please provide feedback below if you have any suggestions or issues.";

  if (isDesktop) {
    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>{renderButton()}</DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit profile</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>
          <FeedbackForm isLoading={isLoading} giveFeedback={giveFeedback} />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerTrigger asChild>{renderButton()}</DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle className="text-center">Provide feedback</DrawerTitle>
          <DrawerDescription>{description}</DrawerDescription>
        </DrawerHeader>
        <FeedbackForm isLoading={isLoading} giveFeedback={giveFeedback} />
      </DrawerContent>
    </Drawer>
  );
};

export default GiveFeedback;
