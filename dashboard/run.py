#!/usr/bin/env python3
"""
OsSense dashboard launcher.

Run from the dashboard folder:
    python run.py

The launcher uses the project's root .venv when available and starts the
Streamlit dashboard from app.py. The dashboard reads the Parquet snapshots
already stored in dashboard/data, so HDFS and the Spark pipeline do not need
to be restarted just to review the dashboard.
"""

from pathlib import Path
import subprocess
import sys

DASHBOARD_DIR = Path(__file__).resolve().parent
PROJECT_DIR = DASHBOARD_DIR.parent
APP_FILE = DASHBOARD_DIR / "app.py"
DATA_DIR = DASHBOARD_DIR / "data"
VENV_PYTHON = PROJECT_DIR / ".venv" / "bin" / "python"


def main() -> int:
    if not APP_FILE.is_file():
        print(f"ERROR: Dashboard app not found: {APP_FILE}")
        return 1

    if not DATA_DIR.is_dir():
        print(f"ERROR: Dashboard data folder not found: {DATA_DIR}")
        print("Restore the six Parquet result folders into dashboard/data.")
        return 1

    python = str(VENV_PYTHON) if VENV_PYTHON.is_file() else sys.executable

    # Check that Streamlit and Plotly are available in the selected environment.
    check = subprocess.run(
        [
            python,
            "-c",
            "import streamlit, plotly, pandas, pyarrow; "
            "print('Dashboard dependencies: OK')",
        ],
        cwd=DASHBOARD_DIR,
    )
    if check.returncode != 0:
        print("\nMissing dashboard dependencies.")
        print("From the project root, activate .venv and install:")
        print("  source .venv/bin/activate")
        print("  python -m pip install streamlit plotly pandas pyarrow")
        return check.returncode

    print("\nStarting OsSense dashboard at http://localhost:8501")
    print("Press Ctrl+C to stop the dashboard.\n")

    return subprocess.call(
        [python, "-m", "streamlit", "run", str(APP_FILE)],
        cwd=DASHBOARD_DIR,
    )


if __name__ == "__main__":
    raise SystemExit(main())
