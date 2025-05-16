
import { ExternalLink } from "lucide-react";
import { Tables } from "@/integrations/supabase/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface OrderingLinksDialogProps {
  kitchenName: string;
  orderingLinks: Tables<'ordering_links'>[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const OrderingLinksDialog = ({ 
  kitchenName,
  orderingLinks,
  open,
  onOpenChange
}: OrderingLinksDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Order from {kitchenName}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          {orderingLinks.map((link) => (
            <a
              key={link.id}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <Button variant="outline" className="w-full justify-between">
                {link.platform_name}
                <ExternalLink className="h-4 w-4 ml-2" />
              </Button>
            </a>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OrderingLinksDialog;
