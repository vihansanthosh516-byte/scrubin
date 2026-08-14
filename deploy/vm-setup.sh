#!/usr/bin/env bash
# =============================================================================
# ScrubIn server bootstrap — run ONCE on a fresh Ubuntu 24.04 VM
# (Oracle Cloud Always Free: Ampere A1 ARM, 2 OCPU / 12 GB).
#
#   ssh ubuntu@<your-vm-ip>
#   curl -fsSL https://raw.githubusercontent.com/vihansanthosh516-byte/scrubin/main/deploy/vm-setup.sh -o vm-setup.sh
#   bash vm-setup.sh
#
# What it does:
#   1. Installs Docker + git
#   2. Clones scrubin + Scrubin-Core side by side (repos must be public)
#   3. Creates .env from .env.example if missing (you fill in the values)
#   4. Builds and starts the api + engine containers
#
# NOTE: run it again after the env file exists only to rebuild/restart the
# stack. It never overwrites an existing .env.
# =============================================================================
set -euo pipefail

GITHUB_USER="vihansanthosh516-byte"

echo "── [1/5] Installing Docker + git ──"
if ! command -v docker >/dev/null 2>&1; then
  curl -fsSL https://get.docker.com | sh
  sudo usermod -aG docker "$USER"
  echo "  (docker group added — re-login with 'exit' + ssh again, or run: newgrp docker)"
fi
sudo apt-get update -y
sudo apt-get install -y git

echo "── [2/5] Cloning the repos ──"
cd ~
if [ ! -d scrubin ]; then
  git clone "https://github.com/${GITHUB_USER}/scrubin.git"
fi
if [ ! -d Scrubin-Core ]; then
  git clone "https://github.com/${GITHUB_USER}/Scrubin-Core.git"
fi

echo "── [3/5] Environment file ──"
cd ~/scrubin
if [ ! -f .env ]; then
  cp .env.example .env
  echo
  echo "  ✏️  NOW EDIT ~/scrubin/.env and fill in the real values:"
  echo "      VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY   (from Supabase dashboard)"
  echo "      GITHUB_CLIENT_SECRET / GOOGLE_CLIENT_SECRET  (from the OAuth apps)"
  echo "      GROQ_API_KEY                                  (from console.groq.com)"
  echo "      CORS_ORIGIN=https://scrubin.pages.dev,https://<your-domain>"
  echo "  Then re-run: bash vm-setup.sh"
  exit 0
fi
echo "  .env already exists — keeping it."

echo "── [4/5] Pulling latest code ──"
git -C ~/scrubin pull --ff-only || echo "  (scrubin pull failed — check repo visibility / network)"
git -C ~/Scrubin-Core pull --ff-only || echo "  (Scrubin-Core pull failed — check repo visibility / network)"

echo "── [5/5] Starting the stack ──"
cd ~/scrubin
sudo docker compose up --build -d
sudo docker compose ps

echo
echo "  Done. Check the API:"
echo "    curl http://localhost:5000/api/health"
echo "  Follow-up (see deploy/DEPLOY.md):"
echo "    - Open port 5000 in the Oracle security list"
echo "    - Point api.<your-domain> at this VM (Cloudflare DNS + Origin Rule)"
echo "    - Set CORS_ORIGIN to your Pages domain and VITE_API_URL on Cloudflare Pages"
