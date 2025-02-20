import * as React from "react";

interface FancyLoadingSpinnerProps {
  isLoading: boolean;
  children: React.ReactNode;
}

const FancyLoadingSpinner: React.FunctionComponent<
  FancyLoadingSpinnerProps
> = ({ isLoading, children }) => {
  return (
    <div className="relative z-10 flex w-full items-center overflow-hidden rounded-xl p-[1.5px]">
      <div
        className={`${isLoading ? "visible" : "invisible"} animate-rotate absolute inset-0 h-full w-full rounded-full bg-[conic-gradient(#0ea5e9_20deg,transparent_120deg)]`}
      ></div>
      <div className="relative z-20 flex w-full rounded-[0.60rem]">
        {children}
      </div>
    </div>
  );
};

export default FancyLoadingSpinner;
