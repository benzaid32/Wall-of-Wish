import { useWallet } from "@solana/wallet-adapter-react";
import { WalletContextProvider } from "@/components/WalletContextProvider";
import WishCard from "@/components/WishCard";
import WishForm from "@/components/WishForm";
import { useWishProgram } from "@/lib/solana";

const WishWall = () => {
  const { publicKey } = useWallet();
  const { submitWish, wishes, loading, fetchWishes } = useWishProgram();

  // Handle form submission
  const handleSubmitWish = async (title: string): Promise<boolean> => {
    if (!publicKey) return false;

    try {
      await submitWish(title);
      // Refresh wishes after submission
      await fetchWishes();
      return true;
    } catch (error) {
      console.error("Error submitting wish:", error);
      return false;
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-background to-muted pb-20">
      {/* Animated stars/particles background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iOCIgY3k9IjgiIHI9IjEiIGZpbGw9IndoaXRlIiBmaWxsLW9wYWNpdHk9IjAuNCIvPjwvc3ZnPg==')] bg-repeat opacity-40"></div>
      </div>
      
      <div className="relative z-10 container mx-auto px-4 pt-16">
        <header className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-primary via-accent to-secondary inline-block text-transparent bg-clip-text">
            Wall of Wishes
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-2">
            Make a wish and store it forever on the Solana blockchain. Your wishes are immutable, transparent, and eternal.
          </p>
          <p className="text-sm text-muted-foreground/70 max-w-xl mx-auto">
            Built with Anchor Framework and Program Derived Addresses (PDAs). Each wish is stored as an <code className="bg-muted/30 px-1 rounded">AWish</code> account with a unique address derived from your wallet and wish content.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-8 mb-16">
          <div>
            <WishForm onSubmit={handleSubmitWish} />
          </div>
          
          <div>
            <h2 className="text-2xl font-bold mb-6 text-white">Recent Wishes</h2>
            
            {loading ? (
              <div className="flex justify-center items-center h-40">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
              </div>
            ) : wishes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {wishes.map((wish) => (
                  <WishCard 
                    key={wish.publicKey.toString()}
                    wish={{
                      user: wish.account.user.toString(),
                      title: wish.account.title,
                      tx: wish.publicKey.toString()
                    }}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-10 bg-card/30 rounded-lg backdrop-blur-sm">
                <p className="text-muted-foreground">No wishes yet. Be the first to make a wish!</p>
              </div>
            )}
          </div>
        </div>
        
        <footer className="text-center text-sm text-muted-foreground">
          <p>Powered by Solana</p>
        </footer>
      </div>
    </div>
  );
};

const Index = () => {
  return (
    <WalletContextProvider>
      <WishWall />
    </WalletContextProvider>
  );
};

export default Index;
