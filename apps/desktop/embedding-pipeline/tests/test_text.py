import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

import _load

text = _load.module("text")
assemble_text = text.assemble_text
redact_value = text.redact_value


class TextAssemblyTests(unittest.TestCase):
    def test_includes_normalized_fields(self):
        result, fields = assemble_text({
            "id": "f-1",
            "title": "Outdated package",
            "description": "Upgrade the locked dependency.",
            "category": "Vulnerability",
            "finding_type": "DEPENDENCY",
            "cve": "CVE-2025-0001",
            "cwe": "CWE-937",
        })
        self.assertIn("Outdated package", result)
        self.assertIn("CVE-2025-0001", result)
        self.assertEqual(fields, ["title", "description", "category", "finding_type", "cwe", "cve"])

    def test_secret_evidence_is_excluded(self):
        result, fields = assemble_text({
            "id": "f-secret",
            "title": "Example credential finding",
            "description": "Redacted secret finding.",
            "finding_type": "SECRET",
            "evidence": {
                "item": {"Match": "AKIA-DO-NOT-EMBED", "secret": "super-secret"}
            },
        })
        self.assertNotIn("AKIA-DO-NOT-EMBED", result)
        self.assertNotIn("super-secret", result)
        self.assertNotIn("evidence", fields)

    def test_redacts_secret_keys_in_non_secret_evidence(self):
        redacted = redact_value({"match": "AKIA-DO-NOT-EMBED", "target": "package-lock.json"})
        self.assertEqual(redacted["match"], "[REDACTED]")
        self.assertEqual(redacted["target"], "package-lock.json")

    def test_truncates_long_text(self):
        result, _fields = assemble_text({"id": "f-long", "title": "A" * 5000}, max_chars=100)
        self.assertEqual(len(result), 100)


if __name__ == "__main__":
    unittest.main()
