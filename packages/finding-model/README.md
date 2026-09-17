# Finding Model

The normalized finding model is the contract shared by scanner adapters, persistence, reporting, and later graph analysis.

Required principles:

- Preserve original scanner evidence.
- Keep provenance for every normalized result.
- Distinguish severity from confidence.
- Use explicit lifecycle states.
- Treat relationships and exploitability as evidence-based claims.

The initial fields are defined in `finding.schema.json`. Derived similarity vectors use the sibling contract `embedding.schema.json` and must not be stored on the finding object.
