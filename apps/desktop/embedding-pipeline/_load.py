"""Load aramelis_embeddings when PathFinder cannot see the src layout."""

from __future__ import annotations

import importlib.util
import sys
from pathlib import Path

PACKAGE = "armelis_embeddings"
ROOT = Path(__file__).resolve().parent
PKG = ROOT / "src" / PACKAGE
SUBMODULES = ("config", "text", "embedder", "store", "cli")


def ensure() -> None:
    src = str(PKG.parent)
    if src not in sys.path:
        sys.path.insert(0, src)

    if PACKAGE in sys.modules and f"{PACKAGE}.cli" in sys.modules:
        return

    parent_spec = importlib.util.spec_from_file_location(
        PACKAGE,
        PKG / "__init__.py",
        submodule_search_locations=[str(PKG)],
    )
    if parent_spec is None or parent_spec.loader is None:
        raise ImportError(f"cannot load {PACKAGE} from {PKG}")

    parent = importlib.util.module_from_spec(parent_spec)
    sys.modules[PACKAGE] = parent
    parent_spec.loader.exec_module(parent)

    for name in SUBMODULES:
        full_name = f"{PACKAGE}.{name}"
        if full_name in sys.modules:
            setattr(parent, name, sys.modules[full_name])
            continue
        spec = importlib.util.spec_from_file_location(full_name, PKG / f"{name}.py")
        if spec is None or spec.loader is None:
            raise ImportError(f"cannot load {full_name}")
        module = importlib.util.module_from_spec(spec)
        sys.modules[full_name] = module
        spec.loader.exec_module(module)
        setattr(parent, name, module)


def module(name: str):
    ensure()
    key = f"{PACKAGE}.{name}"
    if key not in sys.modules:
        raise ImportError(f"{key} was not loaded")
    return sys.modules[key]
