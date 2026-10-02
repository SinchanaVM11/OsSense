# Dataset

## Source

GH Archive

Official website: https://www.gharchive.org/

## Data Type

Public GitHub event data.

## Format

Compressed JSON archives (`.json.gz`).

## Granularity

Hourly archives.

## Dataset Requirement

The selected raw dataset for OSSense must exceed 4 GB.

## Selected Period

To be finalized after dataset-size verification.

## Event Types

The project will primarily analyze relevant GitHub events such as:

- PushEvent
- IssuesEvent
- PullRequestEvent
- IssueCommentEvent
- ReleaseEvent
- ForkEvent

## Dataset Storage

Raw data will be stored locally and will not be committed to GitHub because of its size.

A download manifest and dataset metadata will be maintained in the repository so that the dataset can be reproduced.
