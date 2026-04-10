$file = "client\src\pages\Simulation.tsx"
$content = Get-Content $file -Raw

# Fix imports to use default imports
$content = $content -replace 'import { inguinalHerniaData } from "../data/inguinal_hernia";', 'import inguinalHerniaData from "../data/inguinal_hernia";'
$content = $content -replace 'import { thyroidectomyData } from "../data/thyroidectomy";', 'import thyroidectomyData from "../data/thyroidectomy";'
$content = $content -replace 'import { carpalTunnelData } from "../data/carpal_tunnel";', 'import carpalTunnelData from "../data/carpal_tunnel";'
$content = $content -replace 'import { hysterectomyData } from "../data/hysterectomy";', 'import hysterectomyData from "../data/hysterectomy";'
$content = $content -replace 'import { nephrectomyData } from "../data/nephrectomy";', 'import nephrectomyData from "../data/nephrectomy";'
$content = $content -replace 'import { hipReplacementData } from "../data/hip_replacement";', 'import hipReplacementData from "../data/hip_replacement";'
$content = $content -replace 'import { breastLumpectomyData } from "../data/breast_lumpectomy";', 'import breastLumpectomyData from "../data/breast_lumpectomy";'
$content = $content -replace 'import { tympanoplastyData } from "../data/tympanoplasty";', 'import tympanoplastyData from "../data/tympanoplasty";'
$content = $content -replace 'import { femoralNailingData } from "../data/femoral_nailing";', 'import femoralNailingData from "../data/femoral_nailing";'
$content = $content -replace 'import { lobectomyData } from "../data/lobectomy";', 'import lobectomyData from "../data/lobectomy";'
$content = $content -replace 'import { whippleData } from "../data/whipple";', 'import whippleData from "../data/whipple";'
$content = $content -replace 'import { aaaRepairData } from "../data/aaa_repair";', 'import aaaRepairData from "../data/aaa_repair";'
$content = $content -replace 'import { prostatectomyData } from "../data/prostatectomy";', 'import prostatectomyData from "../data/prostatectomy";'
$content = $content -replace 'import { esophagectomyData } from "../data/esophagectomy";', 'import esophagectomyData from "../data/esophagectomy";'
$content = $content -replace 'import { liverResectionData } from "../data/liver_resection";', 'import liverResectionData from "../data/liver_resection";'
$content = $content -replace 'import { microdiscectomyData } from "../data/microdiscectomy";', 'import microdiscectomyData from "../data/microdiscectomy";'
$content = $content -replace 'import { cabgOpcabData } from "../data/cabg_opcab";', 'import cabgOpcabData from "../data/cabg_opcab";'
$content = $content -replace 'import { rotatorCuffData } from "../data/rotator_cuff";', 'import rotatorCuffData from "../data/rotator_cuff";'
$content = $content -replace 'import { rhinoplastyData } from "../data/rhinoplasty";', 'import rhinoplastyData from "../data/rhinoplasty";'
$content = $content -replace 'import { parathyroidectomyData } from "../data/parathyroidectomy";', 'import parathyroidectomyData from "../data/parathyroidectomy";'

Set-Content $file $content -NoNewline
Write-Host "Fixed imports to use default imports"
