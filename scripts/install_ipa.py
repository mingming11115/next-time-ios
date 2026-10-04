#!/usr/bin/env python3
"""Install a signed release on an explicitly selected, registered iPhone."""
import argparse
import os
import plistlib
import subprocess
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("ipa", type=Path)
    parser.add_argument("--device", required=True, help="Connected iPhone identifier from devicectl list devices")
    parser.add_argument("--launch", action="store_true")
    args = parser.parse_args()
    environment = os.environ.copy()
    if "DEVELOPER_DIR" not in environment and Path("/Applications/Xcode.app/Contents/Developer").is_dir():
        environment["DEVELOPER_DIR"] = "/Applications/Xcode.app/Contents/Developer"
    with tempfile.TemporaryDirectory(prefix="next-time-install-") as directory:
        subprocess.run(["ditto", "-x", "-k", str(args.ipa.resolve()), directory], check=True)
        apps = list((Path(directory) / "Payload").glob("*.app"))
        if len(apps) != 1:
            raise ValueError("Expected exactly one application in the IPA")
        app = apps[0]
        subprocess.run(["codesign", "--verify", "--deep", "--strict", str(app)], check=True)
        subprocess.run(["xcrun", "devicectl", "device", "install", "app", "--device", args.device, str(app)], check=True, env=environment)
        if args.launch:
            bundle = plistlib.loads((app / "Info.plist").read_bytes())["CFBundleIdentifier"]
            subprocess.run(["xcrun", "devicectl", "device", "process", "launch", "--device", args.device, bundle], check=True, env=environment)


if __name__ == "__main__":
    main()
