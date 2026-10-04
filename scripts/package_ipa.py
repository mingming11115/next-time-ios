#!/usr/bin/env python3
"""Package and verify the already signed iPhone build without exporting secrets."""
import argparse
import hashlib
import json
import plistlib
import re
import subprocess
import tempfile
from datetime import timezone
from pathlib import Path
from zoneinfo import ZoneInfo

ROOT = Path(__file__).resolve().parents[1]


def run(*args):
    return subprocess.run(args, check=True, capture_output=True).stdout


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--app", type=Path, default=ROOT / "build/Build/Products/Debug-iphoneos/NextTime.app")
    args = parser.parse_args()
    app = args.app.resolve()
    info = plistlib.loads((app / "Info.plist").read_bytes())
    version, build = info["CFBundleShortVersionString"], info["CFBundleVersion"]
    if not all(re.fullmatch(r"[0-9A-Za-z._-]+", str(value)) for value in (version, build)):
        raise ValueError("Unexpected version or build value")
    run("codesign", "--verify", "--deep", "--strict", str(app))
    profile = plistlib.loads(run("openssl", "smime", "-verify", "-noverify", "-inform", "DER", "-in", str(app / "embedded.mobileprovision")))
    expires = profile["ExpirationDate"].replace(tzinfo=timezone.utc)
    from datetime import datetime
    if expires <= datetime.now(timezone.utc):
        raise ValueError("The provisioning profile has expired; rebuild with a renewed signature first")
    releases = ROOT / "releases"
    releases.mkdir(exist_ok=True)
    ipa = releases / f"NextTime-{version}-{build}.ipa"
    with tempfile.TemporaryDirectory(prefix="next-time-ipa-") as directory:
        stage = Path(directory)
        payload = stage / "Payload"
        payload.mkdir()
        run("ditto", str(app), str(payload / "NextTime.app"))
        run("ditto", "-c", "-k", "--norsrc", "--keepParent", str(payload), str(ipa))
        extracted = stage / "verify"
        run("ditto", "-x", "-k", str(ipa), str(extracted))
        unpacked = extracted / "Payload/NextTime.app"
        run("codesign", "--verify", "--deep", "--strict", str(unpacked))
        for source in app.rglob("*"):
            if source.is_file():
                target = unpacked / source.relative_to(app)
                if not target.is_file() or target.read_bytes() != source.read_bytes():
                    raise ValueError(f"Archive content changed: {source.relative_to(app)}")
    digest = hashlib.sha256(ipa.read_bytes()).hexdigest()
    ipa.with_suffix(".ipa.sha256").write_text(f"{digest}  {ipa.name}\n")
    metadata = {
        "file": ipa.name,
        "displayName": info["CFBundleDisplayName"],
        "bundleIdentifier": info["CFBundleIdentifier"],
        "version": version,
        "build": build,
        "minimumIOSVersion": info["MinimumOSVersion"],
        "signingType": "development" if profile.get("Entitlements", {}).get("get-task-allow") else "distribution",
        "registeredDeviceCount": len(profile.get("ProvisionedDevices", [])),
        "provisioningExpiresUTC": expires.isoformat(),
        "provisioningExpiresAsiaShanghai": expires.astimezone(ZoneInfo("Asia/Shanghai")).isoformat(),
        "sha256": digest,
        "sizeBytes": ipa.stat().st_size,
    }
    ipa.with_suffix(".json").write_text(json.dumps(metadata, ensure_ascii=False, indent=2) + "\n")
    print(json.dumps(metadata, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
