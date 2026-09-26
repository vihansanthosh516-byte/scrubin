import os
import sys
import tempfile
from pathlib import Path

# Keep tests away from the real case database.
os.environ.setdefault("SCRUBIN_DB", str(Path(tempfile.mkdtemp()) / "test_cases.db"))
sys.path.insert(0, str(Path(__file__).parent))
