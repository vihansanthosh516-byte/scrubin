# Run the OR engine on Oracle Cloud (Always Free)

Free forever, no bandwidth cap that matters, 4 ARM cores and 24 GB RAM available.

## 1. Create the VM (about 15 minutes, once)
1. Sign up at https://www.oracle.com/cloud/free/ (a card is used for identity check only; stay on "Always Free" resources).
2. Compute > Instances > Create instance. Image: **Ubuntu 22.04**. Shape: **Ampere (VM.Standard.A1.Flex)**, 2 OCPU / 12 GB is plenty. If "out of capacity", retry later or pick the AMD micro shape (works, slower).
3. Download the SSH key it offers. Note the **public IP**.
4. Networking > your VCN > Security List > Add Ingress Rules: source `0.0.0.0/0`, TCP, destination ports **80** and **443**.

## 2. Free hostname with HTTPS
1. https://www.duckdns.org: sign in, create a subdomain (e.g. `scrubin-or`), set its IP to the VM's public IP.
2. Your engine URL will be `https://scrubin-or.duckdns.org`.

## 3. Install and start
```bash
ssh -i <your-key> ubuntu@<public-ip>
curl -fsSL https://raw.githubusercontent.com/vihansanthosh516-byte/scrubin/main/deploy/oracle/setup.sh | bash
cd ~/scrubin/deploy/oracle
nano .env            # set DOMAIN and paste the keys from the old Render service
sudo docker compose up -d --build
curl https://scrubin-or.duckdns.org/engine/health      # {"ok":true,...}
```

## 4. Point the site at it
In Vercel > scrubin > Settings > Environment Variables: set `VITE_ENGINE_URL` to `https://scrubin-or.duckdns.org`, then redeploy.

## Updating later
```bash
cd ~/scrubin && git pull && cd deploy/oracle && sudo docker compose up -d --build
```
Logs: `sudo docker compose logs -f engine`.

## Notes
- Saved cases go to Supabase when `SUPABASE_*` are set; otherwise to a Docker volume on the VM.
- The Express API (`scrubin-api`) and `scrubin-core` were also on Render. They can run on this VM too; ask for an extended compose file.
