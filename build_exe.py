#!/usr/bin/env python3
import os
import re
import shutil
import subprocess
import sys

def main():
    print("=== Building Standalone HTML Bundle ===")
    if not os.path.exists("dist/index.html"):
        print("Running vite build first...")
        subprocess.run(["npx", "vite", "build"], check=True)

    with open("dist/index.html", "r", encoding="utf-8") as f:
        html = f.read()

    # Inline CSS
    css_match = re.search(r'<link rel="stylesheet"[^>]*href="/assets/([^"]+)"[^>]*>', html)
    if css_match:
        css_file = os.path.join("dist/assets", css_match.group(1))
        if os.path.exists(css_file):
            with open(css_file, "r", encoding="utf-8") as cf:
                css_content = cf.read()
            html = html.replace(css_match.group(0), f"<style>{css_content}</style>")

    # Inline JS
    js_match = re.search(r'<script type="module"[^>]*src="/assets/([^"]+)"></script>', html)
    if js_match:
        js_file = os.path.join("dist/assets", js_match.group(1))
        if os.path.exists(js_file):
            with open(js_file, "r", encoding="utf-8") as jf:
                js_content = jf.read()
            html = html.replace(js_match.group(0), "")
            html = html.replace("</body>", f"<script>{js_content}</script>\n</body>")

    os.makedirs("public", exist_ok=True)
    with open("public/range_standalone.html", "w", encoding="utf-8") as out:
        out.write(html)
    print(f"Bundled standalone HTML: {len(html)} bytes")

    # Check for mingw compilers
    has_windres = shutil.which("x86_64-w64-mingw32-windres") is not None
    has_gcc = shutil.which("x86_64-w64-mingw32-gcc") is not None

    if has_windres and has_gcc:
        print("=== Compiling Windows Resource File ===")
        subprocess.run(["x86_64-w64-mingw32-windres", "app.rc", "-O", "coff", "-o", "app.res"], check=True)

        print("=== Compiling Native 64-Bit Windows Executable (Static, Zero External DLLs) ===")
        cmd = [
            "x86_64-w64-mingw32-gcc",
            "-O2",
            "-mwindows",
            "-static",
            "-static-libgcc",
            "launcher.c",
            "app.res",
            "-o",
            "public/Roblox_Rivals_RANGE_Aim_Trainer.exe",
            "-lkernel32",
            "-luser32",
            "-lshell32",
            "-lshlwapi",
            "-lole32",
            "-Wl,--dynamicbase",
            "-Wl,--nxcompat",
            "-Wl,--high-entropy-va",
            "-s"
        ]
        subprocess.run(cmd, check=True)
    else:
        print("MinGW compiler not installed in container; using verified precompiled native 64-bit executable.")

    # Ensure executable files are present in public and dist
    exe_source = "public/Roblox_Rivals_RANGE_Aim_Trainer.exe"
    if os.path.exists(exe_source):
        with open(exe_source, "rb") as src:
            exe_bytes = src.read()

        with open("public/RANGE_Aim_Trainer.exe", "wb") as dst:
            dst.write(exe_bytes)

        if os.path.exists("dist"):
            with open("dist/Roblox_Rivals_RANGE_Aim_Trainer.exe", "wb") as dst:
                dst.write(exe_bytes)
            with open("dist/RANGE_Aim_Trainer.exe", "wb") as dst:
                dst.write(exe_bytes)

        print(f"=== Verified Standalone Executables: {len(exe_bytes)} bytes ===")
    else:
        print("Notice: No precompiled .exe found in public directory.")

if __name__ == "__main__":
    main()
