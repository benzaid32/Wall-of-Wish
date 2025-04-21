# PowerShell script to build and deploy the Anchor program using Docker

Write-Host "Building and deploying the Wall of Wish Solana program using Docker..." -ForegroundColor Green

# Run the Docker container with the current directory mounted
docker run --rm -it `
  -v ${PWD}:/app `
  -w /app `
  solanalabs/solana:stable `
  bash -c "
    # Install Anchor
    echo 'Installing Anchor...'
    cargo install --git https://github.com/coral-xyz/anchor avm --locked
    avm install latest
    avm use latest

    # Initialize Solana config for devnet
    echo 'Configuring Solana for devnet...'
    solana-keygen new --no-bip39-passphrase -o /app/wallet.json --force
    solana config set -k /app/wallet.json
    solana config set --url https://api.devnet.solana.com
    
    # Airdrop some SOL for deployment
    echo 'Airdropping SOL...'
    solana airdrop 2
    
    # Build the Anchor program
    echo 'Building Anchor program...'
    cd /app/anchor
    anchor build
    
    # Get program ID
    echo 'Getting program ID...'
    PROGRAM_ID=\$(solana address -k ./target/deploy/wall_of_wish-keypair.json)
    echo \"Program ID: \$PROGRAM_ID\"
    
    # Update program ID in Anchor.toml
    echo 'Updating program ID in Anchor.toml...'
    sed -i \"s/wall_of_wish = \\\"[^\\\"]*\\\"/wall_of_wish = \\\"\$PROGRAM_ID\\\"/g\" Anchor.toml
    
    # Update program ID in lib.rs
    echo 'Updating program ID in lib.rs...'
    sed -i \"s/declare_id!(\\\"[^\\\"]*\\\")/declare_id!(\\\"\$PROGRAM_ID\\\")/g\" programs/wall-of-wish/src/lib.rs
    
    # Update program ID in idl.ts
    echo 'Updating program ID in idl.ts...'
    sed -i \"s/PROGRAM_ID = \\\"[^\\\"]*\\\"/PROGRAM_ID = \\\"\$PROGRAM_ID\\\"/g\" /app/src/lib/anchor/idl.ts
    
    # Build again with updated program ID
    echo 'Rebuilding with updated program ID...'
    anchor build
    
    # Deploy to devnet
    echo 'Deploying to devnet...'
    anchor deploy --provider.cluster devnet
    
    # Output program details
    echo 'Deployment complete!'
    echo \"Your program has been deployed to Solana devnet.\"
    echo \"Program ID: \$PROGRAM_ID\"
    echo \"Please use this Program ID in your frontend code.\"
  "

Write-Host "Script execution completed." -ForegroundColor Green
Write-Host "Check the output above for the deployed Program ID." -ForegroundColor Yellow
Write-Host "If deployment was successful, you can now build and run the frontend application." -ForegroundColor Yellow 