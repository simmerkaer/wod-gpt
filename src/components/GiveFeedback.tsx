import { useFeedback } from "@/hooks/useFeedback";
import * as React from "react";
import { useState } from "react";
import { useMediaQuery } from "usehooks-ts";
import { FeedbackForm } from "./FeedbackForm";
import { Button } from "./ui/button";
import { ButtonGroup } from "./ui/button-group";
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

  const feedbackButton = (
    <Button variant="outline" className="text-xs border-2 shadow-none">
      Help us improve!
    </Button>
  );

  const donateButton = (
    <Button variant="outline" className="text-xs border-2 shadow-none" asChild>
      <a
        href="https://ko-fi.com/wodgpt"
        target="_blank"
        rel="noopener noreferrer"
      >
        Buy me a coffee
      </a>
    </Button>
  );

  const description =
    "We are always looking to improve our workout generation. Please provide feedback below if you have any suggestions or issues. Enter you email adress if you would like a message when feedback has been implemented.";

  const actions = (
    <ButtonGroup
      className="mx-auto w-full max-w-md justify-center sm:w-fit"
      aria-label="Donate or send feedback"
    >
      {donateButton}
      {isDesktop ? (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>{feedbackButton}</DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Provide feedback</DialogTitle>
              <DialogDescription>{description}</DialogDescription>
            </DialogHeader>
            <FeedbackForm isLoading={isLoading} giveFeedback={giveFeedback} />
          </DialogContent>
        </Dialog>
      ) : (
        <Drawer open={isOpen} onOpenChange={setIsOpen}>
          <DrawerTrigger asChild>{feedbackButton}</DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle className="text-center">
                Provide feedback
              </DrawerTitle>
              <DrawerDescription>{description}</DrawerDescription>
            </DrawerHeader>
            <FeedbackForm isLoading={isLoading} giveFeedback={giveFeedback} />
          </DrawerContent>
        </Drawer>
      )}
    </ButtonGroup>
  );

  return actions;
};

export default GiveFeedback;
