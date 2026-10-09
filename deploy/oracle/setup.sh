#!/usr/bin/env bash
# Run once on a fresh Ubuntu VM (Oracle Cloud Always Free, Ampere A1 or AMD).
#   curl -fsSL https://raw.githubusercontent.com/vihansanthosh516-byte/scrubin/main/deploy/oracle/setup.sh | bash
set -euo pipefail

sudo apt-get update -y
sudo apt-get install -y git ca-certificates curl
if ! command -v docker >/dev/null; then
  curl -fsSL https://get.docker.com | sudo sh
  sudo usermod -aG docker "$USER"
fi

# Oracle's Ubuntu images ship an iptables rule set that blocks 80/443 even after you
# open them in the cloud console. Open them on the VM too.
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 80 -j ACCEPT || true
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 443 -j ACCEPT || true
sudo apt-get install -y iptables-persistent || true
sudo netfilter-persistent save || true

if [ ! -d "$HOME/scrubin" ]; then
  git clone https://github.com/vihansanthosh516-byte/scrubin.git "$HOME/scrubin"
fi
cd "$HOME/scrubin/deploy/oracle"
[ -f .env ] || cp env.example .env
echo
echo "Next: edit ~/scrubin/deploy/oracle/.env (nano .env), then run:"
echo "  cd ~/scrubin/deploy/oracle && sudo docker compose up -d --build"
