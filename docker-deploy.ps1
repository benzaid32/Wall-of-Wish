Write-Host "Building and deploying using Docker..." -ForegroundColor Green

docker run --rm -it -v ${PWD}:/app -w /app solanalabs/solana:stable bash -c '
  # Install Anchor
  cargo install --git https://github.com/coral-xyz/anchor avm --locked
  avm install latest
  avm use latest

  # Setup Solana
  solana-keygen new --no-bip39-passphrase -o /app/wallet.json --force
  solana config set -k /app/wallet.json
  solana config set --url https://api.devnet.solana.com
  solana airdrop 2
  
  # Build & deploy
  cd /app/anchor
  anchor build
  
  # Get program ID
  PROGRAM_ID=$(solana address -k ./target/deploy/wall_of_wish-keypair.json)
  echo "Program ID: $PROGRAM_ID"
  
  # Update IDs
  sed -i "s/wall_of_wish = \"[^\"]*\"/wall_of_wish = \"$PROGRAM_ID\"/g" Anchor.toml
  sed -i "s/declare_id!(\"[^\"]*\")/declare_id!(\"$PROGRAM_ID\")/g" programs/wall-of-wish/src/lib.rs
  sed -i "s/PROGRAM_ID = \"[^\"]*\"/PROGRAM_ID = \"$PROGRAM_ID\"/g" /app/src/lib/anchor/idl.ts
  
  # Build & deploy again
  anchor build
  anchor deploy --provider.cluster devnet
  
  echo "Deployment complete! Program ID: $PROGRAM_ID"
'

Write-Host "Script completed." -ForegroundColor Green 