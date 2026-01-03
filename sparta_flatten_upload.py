#!/usr/bin/env python3
"""
sparta_pack_upload.py

Copies ONLY the paths/patterns listed in requested.txt into a flat upload folder.
Filenames encode original paths (e.g., src__App.jsx), so you can upload without subdirs.

Defaults:
- reads ./requested.txt
- writes to ./_sparta_upload_flat
- copies at most 24 files (because tree.txt already burns 1 of your 25 upload slots)
- excludes junk (node_modules, dist, .git, *.zip, etc.)

Usage:
  python sparta_pack_upload.py
  python sparta_pack_upload.py --max-files 24 --out _sparta_upload_flat --clobber
  python sparta_pack_upload.py --requested requested.txt --dry-run

requested.txt format:
- one path or glob per line (relative to --root)
- supports ** globs, e.g. amplify/functions/**/resource.ts
- blank lines and lines starting with # are ignored
"""

from __future__ import annotations

import argparse
import fnmatch
import hashlib
import os
import re
import shutil
import sys
from dataclasses import dataclass
from pathlib import Path
from typing import Dict, Iterable, List, Optional, Set, Tuple


DEFAULT_EXCLUDE_DIRS = {
    ".git", ".idea", ".vscode",
    "node_modules", "dist", "build", "coverage",
    ".next", ".nuxt", ".cache", ".turbo", ".svelte-kit",
}

# Hard "nope" list (includes .zip explicitly)
DEFAULT_EXCLUDE_GLOBS = [
    "**/*.zip",
    "**/*.7z",
    "**/*.rar",
    "**/*.tar",
    "**/*.tar.gz",
    "**/*.tgz",
    "**/*.log",
    "**/*.tmp",
    "**/*.swp",
    "**/*.swo",
    "**/*.pyc",
    "**/__pycache__/**",
    "**/.DS_Store",
    "**/Thumbs.db",
    "**/.env",
    "**/.env.*",
    "**/*.pem",
    "**/*.key",
    "**/id_rsa",
    "**/id_ed25519",
]

_BAD_CHARS_RE = re.compile(r"[^A-Za-z0-9._+=@-]+")


DEFAULT_REQUESTED_TXT = """# Project Sparta: upload request list
# One path or glob per line. Relative to project root.
# Comments start with #. Blank lines ignored.

# --- Root essentials ---
package.json
package-lock.json
vite.config.js
index.html
amplify.yml
README.md
amplify_outputs.json

# --- Frontend essentials ---
src/main.jsx
src/App.jsx
src/ProfileTab.jsx
src/UploadsTab.jsx
src/BillingTab.jsx
src/VPNClientTab.jsx
src/App.css
src/index.css
src/amplify_outputs.json

# --- Public docs/assets (only if they exist) ---
public/privacy.html
public/terms.html
public/company.png

# --- Amplify (core) ---
amplify/backend.ts
amplify/auth/resource.ts
amplify/data/resource.ts
amplify/storage/resource.ts
amplify/package.json
amplify/tsconfig.json

# --- Amplify functions (if present; may be trimmed by max-files limit) ---
amplify/functions/**/resource.ts
amplify/functions/**/handler.ts
"""


@dataclass(frozen=True)
class ResolvedFile:
    src: Path      # absolute
    rel: Path      # relative to root
    requested_by: str  # pattern line that pulled it in


def _is_under_excluded_dir(rel_parts: Tuple[str, ...], excluded_dirs: Set[str]) -> bool:
    return any(part in excluded_dirs for part in rel_parts)


def _match_any_glob(rel_posix: str, globs: Iterable[str]) -> bool:
    return any(fnmatch.fnmatch(rel_posix, g) for g in globs)


def _make_flat_name(rel: Path, max_len: int = 180) -> str:
    rel_posix = rel.as_posix()
    name = rel_posix.replace("\\", "/").replace("/", "__")
    name = _BAD_CHARS_RE.sub("_", name)
    if not name:
        name = "file"

    if len(name) > max_len:
        h = hashlib.sha1(rel_posix.encode("utf-8")).hexdigest()[:12]
        suffix = rel.suffix
        base = name[: max(1, max_len - len(suffix) - 16)]
        name = f"{base}__h{h}{suffix}"
    return name


def _unique_name(desired: str, used: Set[str]) -> str:
    if desired not in used:
        used.add(desired)
        return desired

    stem, dot, suffix = desired.partition(".")
    for i in range(2, 10_000):
        cand = f"{stem}__dup{i}"
        if suffix:
            cand = f"{cand}.{suffix}"
        if cand not in used:
            used.add(cand)
            return cand
    raise RuntimeError(f"Could not find unique name for: {desired}")


def _read_requested_lines(path: Path) -> List[str]:
    raw = path.read_text(encoding="utf-8", errors="replace").splitlines()
    out: List[str] = []
    for line in raw:
        s = line.strip()
        if not s or s.startswith("#"):
            continue
        out.append(s)
    return out


def _ensure_requested_file(requested_path: Path) -> None:
    if requested_path.exists():
        return
    requested_path.write_text(DEFAULT_REQUESTED_TXT, encoding="utf-8")
    print(f"[OK] Created default requested file: {requested_path}")
    print("[NOTE] Edit it if you want, then re-run. (It will still run now with defaults.)")


def _resolve_pattern(root: Path, pattern: str) -> List[Path]:
    """
    Resolve a single requested line into matching files (absolute Paths).
    Supports globs via Path.glob. Also accepts Windows-style backslashes.
    """
    pat = pattern.replace("\\", "/")
    # If it's an exact file path that exists, prefer it (fast + deterministic)
    exact = (root / pat)
    if exact.exists() and exact.is_file():
        return [exact.resolve()]

    # Otherwise treat as glob
    matches = [p for p in root.glob(pat) if p.is_file()]
    matches.sort(key=lambda p: p.as_posix())
    return [m.resolve() for m in matches]


def _should_exclude(rel: Path, excluded_dirs: Set[str], exclude_globs: List[str]) -> Optional[str]:
    rel_posix = rel.as_posix()
    if _is_under_excluded_dir(tuple(rel.parts), excluded_dirs):
        return "excluded_dir"
    if _match_any_glob(rel_posix, exclude_globs):
        return "excluded_glob"
    return None


def _ensure_out_dir(out_dir: Path, clobber: bool) -> None:
    if out_dir.exists():
        if not out_dir.is_dir():
            raise RuntimeError(f"--out exists but is not a directory: {out_dir}")
        if clobber:
            for child in out_dir.iterdir():
                if child.is_dir():
                    shutil.rmtree(child)
                else:
                    child.unlink(missing_ok=True)
    else:
        out_dir.mkdir(parents=True, exist_ok=True)


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--root", default=".", help="Project root directory")
    ap.add_argument("--requested", default="requested.txt", help="Requested list file")
    ap.add_argument("--out", default="_sparta_upload_flat", help="Output directory (flat)")
    ap.add_argument("--max-files", type=int, default=24, help="Max files to copy (default 24; tree.txt is your 25th upload)")
    ap.add_argument("--dry-run", action="store_true", help="Show what would be copied")
    ap.add_argument("--clobber", action="store_true", help="Wipe output directory contents before copying")
    ap.add_argument("--exclude-dir", action="append", default=[], help="Extra directory names to exclude (repeatable)")
    ap.add_argument("--exclude-glob", action="append", default=[], help='Extra glob to exclude (repeatable), e.g. "secrets/**"')
    args = ap.parse_args()

    root = Path(args.root).resolve()
    if not root.exists() or not root.is_dir():
        print(f"[ERROR] --root not a directory: {root}", file=sys.stderr)
        return 2

    requested_path = Path(args.requested)
    if not requested_path.is_absolute():
        requested_path = (root / requested_path).resolve()

    _ensure_requested_file(requested_path)
    requested_lines = _read_requested_lines(requested_path)

    excluded_dirs = set(DEFAULT_EXCLUDE_DIRS) | set(args.exclude_dir)
    exclude_globs = list(DEFAULT_EXCLUDE_GLOBS) + list(args.exclude_glob)

    # Resolve in the SAME ORDER as requested.txt, so priority is preserved.
    picked: List[ResolvedFile] = []
    seen_rel: Set[str] = set()

    skipped: List[Tuple[str, str]] = []  # (rel_or_pattern, reason)

    for pat in requested_lines:
        matches = _resolve_pattern(root, pat)
        if not matches:
            skipped.append((pat, "no_match"))
            continue

        for abs_path in matches:
            try:
                rel = abs_path.relative_to(root)
            except ValueError:
                skipped.append((str(abs_path), "outside_root"))
                continue

            rel_posix = rel.as_posix()
            if rel_posix in seen_rel:
                continue

            reason = _should_exclude(rel, excluded_dirs, exclude_globs)
            if reason:
                skipped.append((rel_posix, reason))
                continue

            if args.max_files is not None and len(picked) >= args.max_files:
                skipped.append((rel_posix, "over_max_files"))
                continue

            picked.append(ResolvedFile(src=abs_path, rel=rel, requested_by=pat))
            seen_rel.add(rel_posix)

    out_dir = Path(args.out)
    if not out_dir.is_absolute():
        out_dir = (root / out_dir).resolve()

    if args.dry_run:
        print(f"[DRY RUN] root: {root}")
        print(f"[DRY RUN] requested: {requested_path}")
        print(f"[DRY RUN] out: {out_dir}")
        print(f"[DRY RUN] will copy: {len(picked)} file(s) (max-files={args.max_files})")
        for it in picked:
            print(f"  + {it.rel.as_posix()}   (from: {it.requested_by})")
        if skipped:
            print(f"[DRY RUN] skipped: {len(skipped)} item(s) (showing up to 40)")
            for s, r in skipped[:40]:
                print(f"  - {s}   [{r}]")
        return 0

    _ensure_out_dir(out_dir, clobber=args.clobber)

    used_names: Set[str] = set()
    manifest = out_dir / "_MANIFEST.tsv"
    skipped_report = out_dir / "_SKIPPED.tsv"

    copied = 0
    with manifest.open("w", encoding="utf-8", newline="") as mf:
        mf.write("flat_name\toriginal_rel_path\trequested_by\n")
        for it in picked:
            desired = _make_flat_name(it.rel)
            flat = _unique_name(desired, used_names)
            dst = out_dir / flat
            try:
                shutil.copy2(it.src, dst)
            except Exception as e:
                skipped.append((it.rel.as_posix(), f"copy_failed:{e}"))
                continue
            mf.write(f"{flat}\t{it.rel.as_posix()}\t{it.requested_by}\n")
            copied += 1

    with skipped_report.open("w", encoding="utf-8", newline="") as sf:
        sf.write("item\treason\n")
        for item, reason in skipped:
            sf.write(f"{item}\t{reason}\n")

    print(f"[OK] Copied {copied} file(s) into: {out_dir}")
    print(f"[OK] Wrote: {manifest.name} (for mapping) and {skipped_report.name} (why things were skipped)")
    print("[UPLOAD] Upload ONLY the copied code/files you need. _MANIFEST.tsv and _SKIPPED.tsv are optional (do NOT waste slots).")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
