import { CheckCircle2 } from "lucide-react";

const VerifiedBadge = ({ className = "w-3.5 h-3.5" }: { className?: string }) => (
  <CheckCircle2
    className={`${className} text-[hsl(210,100%,56%)] fill-[hsl(210,100%,56%)] stroke-background inline-block shrink-0`}
  />
);

export default VerifiedBadge;
