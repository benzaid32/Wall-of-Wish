
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useWallet } from "@solana/wallet-adapter-react";
import { toast } from "@/hooks/use-toast";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { InfoIcon } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface WishFormProps {
  onSubmit: (title: string) => Promise<boolean>;
}

const WishForm = ({ onSubmit }: WishFormProps) => {
  const { connected } = useWallet();
  const [title, setTitle] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast({
        title: "Error",
        description: "Please enter a wish",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const success = await onSubmit(title);
      
      if (success) {
        toast({
          title: "Success!",
          description: "Your wish has been added to the wall!",
        });
        setTitle("");
      }
    } catch (error) {
      console.error("Error submitting wish:", error);
      toast({
        title: "Error",
        description: "Failed to submit your wish. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-md backdrop-blur-sm bg-card/80 border-accent/20 shadow-lg">
      <CardHeader>
        <div className="flex justify-between items-center mb-2">
          <CardTitle className="text-2xl font-bold text-white">
            Make a Wish
          </CardTitle>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="cursor-help">
                <InfoIcon size={16} className="text-accent" />
              </div>
            </TooltipTrigger>
            <TooltipContent side="right" className="max-w-[280px]">
              <p className="text-sm">Your wish will be stored on the Solana blockchain as a Program Derived Address (PDA) using the Anchor framework.</p>
            </TooltipContent>
          </Tooltip>
        </div>
        <CardDescription className="text-muted-foreground">
          Store your wish eternally on the Solana blockchain
        </CardDescription>
      </CardHeader>
      
      <form onSubmit={handleSubmit}>
        <CardContent>
          {connected ? (
            <div className="space-y-4">
              <div>
                <Input
                  placeholder="Enter your wish..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="bg-muted/50 border-muted text-white placeholder:text-muted-foreground focus:ring-accent focus:border-accent"
                  maxLength={100}
                />
                <div className="flex justify-between mt-2 text-xs">
                  <div className="text-muted-foreground flex items-center gap-1">
                    <Tooltip>
                      <TooltipTrigger>
                        <InfoIcon size={12} className="text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Your wish will be stored as an AWish PDA with this title</p>
                      </TooltipContent>
                    </Tooltip>
                    <span>AWish {'{'}title: String{'}'}</span>
                  </div>
                  <div className="text-muted-foreground">
                    {title.length}/100 characters
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-4 bg-muted/20 rounded-lg">
              <p className="mb-2">Connect your wallet to make a wish</p>
              <p className="text-xs opacity-70">Your Solana public key will be associated with your wish</p>
            </div>
          )}
        </CardContent>
        
        <CardFooter className="flex justify-center gap-4">
          {connected ? (
            <Button 
              type="submit" 
              className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity"
              disabled={isSubmitting || !title.trim()}
            >
              {isSubmitting ? "Submitting..." : "Submit Wish"}
            </Button>
          ) : (
            <WalletMultiButton />
          )}
        </CardFooter>
      </form>
    </Card>
  );
};

export default WishForm;
