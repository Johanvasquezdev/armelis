import sys
import tempfile
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

import _load

cli = _load.module("cli")
embedder_mod = _load.module("embedder")
store = _load.module("store")
embed_findings = cli.embed_findings
load_findings = cli.load_findings
main = cli.main
FakeEmbedder = embedder_mod.FakeEmbedder
validate_record = store.validate_record

FIXTURE = Path(__file__).resolve().parent / "fixtures" / "findings.json"


class FakeEmbedderTests(unittest.TestCase):
    def test_same_text_is_reproducible(self):
        embedder = FakeEmbedder()
        first = embedder.encode(["same finding text"])[0]
        second = embedder.encode(["same finding text"])[0]
        self.assertEqual(first, second)
        self.assertEqual(len(first), 384)

    def test_embed_findings_does_not_mutate_source(self):
        findings = load_findings(FIXTURE)
        original = findings[1]["evidence"]["item"]["Match"]
        records = embed_findings(findings, FakeEmbedder())
        self.assertEqual(findings[1]["evidence"]["item"]["Match"], original)
        self.assertTrue(all(record["status"] == "SUCCEEDED" for record in records))
        for record in records:
            validate_record(record)
        secret = next(record for record in records if record["finding_id"] == "armelis-secret-fixture-0002")
        self.assertNotIn("evidence", secret["source_fields"])

    def test_failed_encode_is_visible(self):
        class Broken:
            model_id = "sentence-transformers/all-MiniLM-L6-v2"
            model_revision = "test"
            embedding_dim = 384

            def encode(self, texts):
                raise RuntimeError("model weights missing")

        records = embed_findings(load_findings(FIXTURE), Broken())
        self.assertTrue(all(record["status"] == "FAILED" for record in records))
        self.assertTrue(all(record.get("error") for record in records))
        self.assertTrue(all("vector" not in record for record in records))

    def test_cli_fake_writes_jsonl(self):
        with tempfile.TemporaryDirectory() as tmp:
            output = Path(tmp) / "finding_embeddings.jsonl"
            code = main(["--fake", "--input", str(FIXTURE), "--output", str(output)])
            self.assertEqual(code, 0)
            lines = [line for line in output.read_text(encoding="utf-8").splitlines() if line.strip()]
            self.assertEqual(len(lines), 2)
            self.assertNotIn("AKIA-DO-NOT-EMBED", output.read_text(encoding="utf-8"))


if __name__ == "__main__":
    unittest.main()
