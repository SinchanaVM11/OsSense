# OSSense

## Large-Scale Open-Source Ecosystem Analytics Using Big Data

OSSense is a Big Data Analytics project that analyzes large-scale public GitHub activity to identify patterns in open-source project growth, contributor collaboration, issue resolution, pull-request activity, and repository sustainability.

## Problem Statement

To develop a scalable Big Data Analytics system for processing large-scale GitHub activity data to identify patterns in open-source project growth, contributor collaboration, issue resolution, pull-request activity, and repository sustainability.

## Dataset

The project uses public GitHub event data from GH Archive.

The selected project dataset will contain more than 4 GB of raw data.

## Planned Pipeline

GH Archive
→ Raw Data
→ PySpark
→ Data Cleaning
→ Transformation
→ Parquet
→ Spark SQL
→ Analytics
→ Dashboard

## Analytics

- Repository activity
- Contributor analytics
- Issue analytics
- Pull-request analytics
- Repository health indicators

## Technology Stack

- Python
- Apache Spark
- PySpark
- Spark SQL
- Parquet
- Hadoop/HDFS where required
- Power BI / Streamlit

## Project Status

Initial repository and data-engineering setup.
