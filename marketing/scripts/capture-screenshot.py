"""Capture a public app page; run from any directory. Requires Chrome/Chromium."""
import argparse
from pathlib import Path
import re
import shutil
import subprocess
import tempfile
from urllib.parse import urlparse

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument("url")
parser.add_argument("name", help="Lowercase kebab-case filename without extension")
parser.add_argument("--device", choices=["desktop", "mobile"], default="desktop")
args = parser.parse_args()
if urlparse(args.url).scheme not in ("http", "https"):
    parser.error("Use an http(s) app URL")
if not re.fullmatch(r"[a-z0-9]+(?:-[a-z0-9]+)*", args.name):
    parser.error("Name must be lowercase kebab-case")
chrome = shutil.which("google-chrome") or shutil.which("chromium") or shutil.which("chromium-browser")
if not chrome:
    parser.error("Install Google Chrome or Chromium first")
output = Path(__file__).resolve().parents[1] / "screenshots" / args.device / (args.name + ".png")
if output.exists():
    parser.error("File already exists; choose a new version name")
size = "1440,900" if args.device == "desktop" else "390,844"
with tempfile.TemporaryDirectory(prefix="marketing-chrome-") as profile:
    subprocess.run([chrome, "--headless", "--hide-scrollbars", "--user-data-dir=" + profile,
                    "--window-size=" + size, "--screenshot=" + str(output),
                    "--virtual-time-budget=5000", args.url], check=True, timeout=60)
if not output.exists():
    raise SystemExit("Chrome did not create a screenshot")
print(str(output) + " — inspect image and record provenance before publication")
