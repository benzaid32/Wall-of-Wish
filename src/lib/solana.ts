import { Connection, PublicKey } from '@solana/web3.js';
import { AnchorProvider, Program } from '@project-serum/anchor';
import { useAnchorWallet, useConnection } from '@solana/wallet-adapter-react';
import { IDL, PROGRAM_ID } from './anchor/idl';
import { useCallback, useEffect, useState } from 'react';
import * as anchor from '@project-serum/anchor';

// Local storage key for storing wishes (for mock implementation)
const WISHES_STORAGE_KEY = 'solana-wishes';

// Helper to find program derived address (PDA)
export const findWishPDA = async (
  userPubkey: PublicKey, 
  title: string
): Promise<[PublicKey, number]> => {
  return await PublicKey.findProgramAddress(
    [
      Buffer.from("wish"),
      userPubkey.toBuffer(),
      Buffer.from(title)
    ],
    new PublicKey(PROGRAM_ID)
  );
};

export interface WishAccount {
  publicKey: PublicKey;
  account: {
    user: PublicKey;
    title: string;
  };
}

// Custom hook to interact with the Solana program
export const useWishProgram = () => {
  const { connection } = useConnection();
  const wallet = useAnchorWallet();
  const [wishes, setWishes] = useState<WishAccount[]>([]);
  const [loading, setLoading] = useState(true);

  // Use local storage for demo when blockchain isn't available
  const getMockWishes = (): WishAccount[] => {
    try {
      const storedWishes = localStorage.getItem(WISHES_STORAGE_KEY);
      if (storedWishes) {
        return JSON.parse(storedWishes).map((w: any) => ({
          ...w,
          publicKey: new PublicKey(w.publicKey),
          account: {
            ...w.account,
            user: new PublicKey(w.account.user)
          }
        }));
      }
      return [];
    } catch (e) {
      console.error('Error parsing stored wishes:', e);
      return [];
    }
  };

  const saveMockWishes = (wishList: WishAccount[]) => {
    try {
      const serialized = JSON.stringify(wishList.map(w => ({
        publicKey: w.publicKey.toString(),
        account: {
          user: w.account.user.toString(),
          title: w.account.title
        }
      })));
      localStorage.setItem(WISHES_STORAGE_KEY, serialized);
    } catch (e) {
      console.error('Error saving wishes:', e);
    }
  };

  // Function to fetch all wishes
  const fetchWishes = useCallback(async () => {
    try {
      setLoading(true);
      
      try {
        // Try real blockchain first
        if (connection) {
          const provider = wallet 
            ? new AnchorProvider(connection, wallet, { commitment: 'processed' })
            : new AnchorProvider(
                connection,
                // Mock wallet for read-only operations
                {
                  publicKey: PublicKey.default,
                  signTransaction: async () => { throw new Error('Wallet not connected'); },
                  signAllTransactions: async () => { throw new Error('Wallet not connected'); },
                },
                { commitment: 'processed' }
              );
          
          const program = new Program(IDL, new PublicKey(PROGRAM_ID), provider);
          
          // Fetch all program accounts of type AWish
          const wishAccounts = await program.account.aWish.all();
          
          // Map the returned accounts
          const formattedWishes = wishAccounts.map(item => ({
            publicKey: item.publicKey,
            account: {
              user: item.account.user,
              title: item.account.title
            }
          }));
          
          // Sort by publicKey to have a consistent order
          formattedWishes.sort((a, b) => 
            a.publicKey.toBase58().localeCompare(b.publicKey.toBase58())
          );
          
          setWishes(formattedWishes);
          saveMockWishes(formattedWishes); // Cache for offline demo
          return;
        }
      } catch (error) {
        console.warn("Falling back to mock data:", error);
      }
      
      // Fallback to mock data when blockchain fails
      const mockWishes = getMockWishes();
      setWishes(mockWishes);
    } catch (error) {
      console.error("Error fetching wishes:", error);
    } finally {
      setLoading(false);
    }
  }, [connection, wallet]);

  // Function to submit a wish
  const submitWish = useCallback(
    async (title: string): Promise<string> => {
      if (!wallet) {
        throw new Error("Wallet not connected");
      }

      // Using a more reliable configuration for transactions on deployed sites
      const provider = new AnchorProvider(
        connection,
        wallet,
        { 
          commitment: 'confirmed',
          preflightCommitment: 'confirmed',
          skipPreflight: false
        }
      );
      
      const program = new Program(IDL, new PublicKey(PROGRAM_ID), provider);
      
      try {
        // Get PDA for the wish
        const [wishPDA] = await findWishPDA(wallet.publicKey, title);
        
        console.log("Submitting wish to program:", PROGRAM_ID);
        console.log("Using wallet:", wallet.publicKey.toString());
        console.log("PDA:", wishPDA.toString());
        
        // Set up the transaction with explicit signers and confirmation strategy
        const tx = await program.methods
          .submitWish(title)
          .accounts({
            wish: wishPDA,
            user: wallet.publicKey,
            systemProgram: anchor.web3.SystemProgram.programId,
          })
          .rpc({ skipPreflight: false });
        
        console.log("Transaction submitted successfully:", tx);
        
        // Refresh wishes after submission
        await fetchWishes();
        return tx;
      } catch (error) {
        console.error("Error submitting wish:", error);
        // More detailed error logging for debugging
        if (error instanceof Error) {
          console.error("Error details:", error.message);
          // @ts-ignore
          if (error.logs) {
            // @ts-ignore
            console.error("Transaction logs:", error.logs);
          }
        }
        throw error;
      }
    },
    [connection, wallet, fetchWishes]
  );

  // Function to delete a wish
  const deleteWish = useCallback(
    async (title: string, wishPublicKey: PublicKey): Promise<string> => {
      if (!wallet) {
        throw new Error("Wallet not connected");
      }

      // Using a more reliable configuration for transactions
      const provider = new AnchorProvider(
        connection,
        wallet,
        { 
          commitment: 'confirmed',
          preflightCommitment: 'confirmed',
          skipPreflight: false
        }
      );
      
      const program = new Program(IDL, new PublicKey(PROGRAM_ID), provider);
      
      try {
        // Get PDA for the wish
        const [wishPDA] = await findWishPDA(wallet.publicKey, title);
        
        console.log("Deleting wish from program:", PROGRAM_ID);
        console.log("Using wallet:", wallet.publicKey.toString());
        console.log("PDA to delete:", wishPDA.toString());
        
        // Verify this wish belongs to the current user
        const wishData = wishes.find(w => w.publicKey.toString() === wishPublicKey.toString());
        if (!wishData || wishData.account.user.toString() !== wallet.publicKey.toString()) {
          throw new Error("You can only delete your own wishes");
        }
        
        // Set up the delete transaction
        const tx = await program.methods
          .deleteWish(title)
          .accounts({
            wish: wishPDA,
            user: wallet.publicKey,
            systemProgram: anchor.web3.SystemProgram.programId,
          })
          .rpc({ skipPreflight: false });
        
        console.log("Delete transaction submitted successfully:", tx);
        
        // Refresh wishes after deletion
        await fetchWishes();
        return tx;
      } catch (error) {
        console.error("Error deleting wish:", error);
        // More detailed error logging for debugging
        if (error instanceof Error) {
          console.error("Error details:", error.message);
          // @ts-ignore
          if (error.logs) {
            // @ts-ignore
            console.error("Transaction logs:", error.logs);
          }
        }
        throw error;
      }
    },
    [connection, wallet, fetchWishes, wishes]
  );

  // Fetch wishes on mount and when connection changes
  useEffect(() => {
    if (connection) {
      fetchWishes();
    }
  }, [connection, fetchWishes]);

  return { submitWish, deleteWish, wishes, loading, fetchWishes };
};
