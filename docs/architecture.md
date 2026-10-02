# System Architecture

```text
GH Archive
    |
    v
Raw JSON.GZ Data
    |
    v
Data Storage
    |
    v
PySpark ETL
    |
    +--> Cleaning
    +--> Filtering
    +--> Transformation
    |
    v
Parquet Data
    |
    v
Spark SQL
    |
    +--> Repository Analytics
    +--> Contributor Analytics
    +--> Issue Analytics
    +--> Pull Request Analytics
    |
    v
Repository Health Indicators
    |
    v
Dashboard

**Methodology:**

```bash
cat > docs/methodology.md <<'EOF'
# Methodology

## 1. Data Acquisition

Collect public GitHub event archives from GH Archive for the selected time period.

## 2. Data Validation

Verify:

- Number of files
- Compressed size
- Event count
- Date range
- Event types

The selected dataset must exceed 4 GB.

## 3. Data Processing

Use PySpark to:

- Parse JSON events
- Filter relevant event types
- Clean records
- Extract analytical fields
- Transform event data

## 4. Storage

Store processed analytical data in Parquet format.

## 5. Analytics

Perform:

- Repository activity analysis
- Contributor analysis
- Issue resolution analysis
- Pull-request analysis
- Repository health analysis

## 6. Visualization

Present analytical results through an interactive dashboard.
