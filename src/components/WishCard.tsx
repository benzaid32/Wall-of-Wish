import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, ExternalLink, Key, Trash2 } from "lucide-react";
import { PublicKey } from "@solana/web3.js";
import { WishAccount } from "@/lib/solana";
import { useWishProgram } from "@/lib/solana";
import { useWallet } from "@solana/wallet-adapter-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";

interface WishCardProps {
  wish: {
    user: string;
    title: string;
    tx: string;
  };
}

const WishCard = ({ wish }: WishCardProps) => {
  const { publicKey } = useWallet();
  const { deleteWish } = useWishProgram();
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Function to format the wallet address for display
  const formatAddress = (address: string) => {
    if (!address) return '';
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  // Create a Solana explorer link for the transaction
  const explorerLink = wish.tx 
    ? `https://explorer.solana.com/address/${wish.tx}?cluster=devnet` 
    : undefined;
    
  // Check if the current user is the creator of this wish
  const isCreator = publicKey && wish.user === publicKey.toString();

  // Handle wish deletion
  const handleDelete = async () => {
    if (!publicKey) {
      toast({
        title: "Error",
        description: "Please connect your wallet to delete wishes",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsDeleting(true);
      await deleteWish(wish.title, new PublicKey(wish.tx));
      
      toast({
        title: "Success",
        description: "Your wish has been deleted from the blockchain",
      });
    } catch (error) {
      console.error("Failed to delete wish:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete wish",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };
  
  return (
    <Card className="w-full max-w-md overflow-hidden backdrop-blur-sm bg-card/80 border-accent/20 shadow-lg hover:shadow-accent/10 transition-all duration-300 hover:scale-[1.02]">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl font-bold text-white">
            {wish.title}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs bg-accent/10 text-accent border-accent/20">
              PDA
            </Badge>
            {isCreator && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6 text-destructive hover:bg-destructive/10"
                    onClick={handleDelete}
                    disabled={isDeleting}
                  >
                    <Trash2 size={14} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="left">
                  <p>Delete your wish</p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        </div>
        <CardDescription className="text-muted-foreground flex items-center gap-1">
          <Key size={12} className="text-muted-foreground" />
          {formatAddress(wish.user)}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pb-2 pt-0">
        <div className="text-xs text-muted-foreground border-t border-accent/10 pt-2 mt-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-1 cursor-help">
                <span className="font-semibold">AWish Account</span>
                <span className="opacity-70">(Program Derived Address)</span>
              </div>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p>This wish is stored in a Program Derived Address (PDA) on the Solana blockchain.</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </CardContent>
      
      {explorerLink && (
        <CardFooter className="pt-0">
          <a 
            href={explorerLink} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-xs text-accent flex items-center gap-1 hover:underline"
          >
            View on Solana Explorer <ExternalLink size={12} />
          </a>
        </CardFooter>
      )}
    </Card>
  );
};

export default WishCard;
