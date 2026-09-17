"""Launch the local embedding CLI without requiring an editable install."""

from __future__ import annotations

import _load

if __name__ == "__main__":
    raise SystemExit(_load.module("cli").main())
