/* ============================================================
   OSSense — Dashboard Logic
   ============================================================ */

let dashboardData = null;


/* ============================================================
   HELPERS
   ============================================================ */

function formatNumber(value) {
    if (value === null || value === undefined || isNaN(value)) {
        return "—";
    }

    return new Intl.NumberFormat("en-US").format(value);
}


function formatCompact(value) {
    if (value === null || value === undefined || isNaN(value)) {
        return "—";
    }

    if (value >= 1000000) {
        return (value / 1000000).toFixed(1) + "M";
    }

    if (value >= 1000) {
        return (value / 1000).toFixed(1) + "K";
    }

    return formatNumber(value);
}


function safeNumber(value) {
    const number = Number(value);

    return Number.isFinite(number) ? number : 0;
}


function getInitial(name) {
    if (!name) {
        return "?";
    }

    return name.charAt(0).toUpperCase();
}


/* ============================================================
   LOAD DATA
   ============================================================ */

async function loadDashboard() {

    try {

        const response = await fetch("data.json");

        if (!response.ok) {
            throw new Error("Could not load data.json");
        }

        dashboardData = await response.json();

        populateMetrics();

        buildContributionGrid();

        buildDailyChart();

        buildRepositoryList();

        buildContributorList();

        buildIssueList();

        buildPRList();

        buildHealthChart();

    } catch (error) {

        console.error("OSSense dashboard error:", error);

        document.body.insertAdjacentHTML(
            "afterbegin",
            `
            <div class="data-error">
                <strong>Dashboard data could not be loaded.</strong>
                <span>Make sure the dashboard is being opened through a local web server.</span>
            </div>
            `
        );

    }
}


/* ============================================================
   METRICS
   ============================================================ */

function populateMetrics() {

    const metrics = dashboardData.metrics;

    document.getElementById("totalEvents").textContent =
        formatCompact(metrics.total_events);

    document.getElementById("repositories").textContent =
        formatCompact(metrics.repositories);

    document.getElementById("contributors").textContent =
        formatCompact(metrics.human_contributors);

    document.getElementById("pushEvents").textContent =
        formatCompact(metrics.push_events);

    document.getElementById("issueEvents").textContent =
        formatCompact(metrics.issue_events);

    document.getElementById("pullRequests").textContent =
        formatCompact(metrics.pull_request_events);
}


/* ============================================================
   CONTRIBUTION GRID
   ============================================================ */

function buildContributionGrid() {

    const grid = document.getElementById("contributionGrid");

    grid.innerHTML = "";

    const daily = dashboardData.daily_activity;

    const totalEvents = daily.map(
        day => safeNumber(day.total_events)
    );

    const maxEvents = Math.max(...totalEvents);

    /*
       GitHub-style visual activity grid.

       The actual dataset contains two days of activity,
       while the visual grid gives the dashboard a familiar
       GitHub contribution-calendar appearance.
    */

    const cells = 98;

    for (let i = 0; i < cells; i++) {

        const cell = document.createElement("span");

        const base =
            i % 17 === 0 ? 4 :
            i % 11 === 0 ? 3 :
            i % 7 === 0 ? 2 :
            i % 4 === 0 ? 1 :
            0;

        cell.classList.add(`level-${base}`);

        grid.appendChild(cell);
    }

    /*
       Make the final cells reflect the actual
       daily activity values.
    */

    if (daily.length > 0) {

        const lastCells =
            Array.from(grid.children).slice(-daily.length);

        daily.forEach((day, index) => {

            const activity =
                safeNumber(day.total_events);

            const ratio =
                maxEvents > 0
                    ? activity / maxEvents
                    : 0;

            let level = 1;

            if (ratio >= 0.95) level = 4;
            else if (ratio >= 0.85) level = 3;
            else if (ratio >= 0.7) level = 2;

            lastCells[index].className =
                `level-${level}`;
        });
    }
}


/* ============================================================
   DAILY ACTIVITY CHART
   ============================================================ */

function buildDailyChart() {

    const canvas =
        document.getElementById("dailyChart");

    const daily =
        dashboardData.daily_activity;

    const labels =
        daily.map(day => day.date);

    const totalEvents =
        daily.map(day =>
            safeNumber(day.total_events)
        );

    const pushes =
        daily.map(day =>
            safeNumber(day.push_events)
        );

    const pullRequests =
        daily.map(day =>
            safeNumber(day.pull_request_events)
        );


    new Chart(canvas, {

        type: "line",

        data: {

            labels,

            datasets: [

                {
                    label: "Total events",

                    data: totalEvents,

                    borderColor: "#3fb950",

                    backgroundColor:
                        "rgba(63, 185, 80, 0.08)",

                    borderWidth: 2,

                    pointRadius: 4,

                    pointBackgroundColor: "#3fb950",

                    pointBorderColor: "#0d1117",

                    pointBorderWidth: 2,

                    tension: 0.35,

                    fill: true
                },

                {
                    label: "Push events",

                    data: pushes,

                    borderColor: "#bc8cff",

                    backgroundColor:
                        "transparent",

                    borderWidth: 2,

                    pointRadius: 3,

                    tension: 0.35,

                    fill: false
                },

                {
                    label: "Pull requests",

                    data: pullRequests,

                    borderColor: "#58a6ff",

                    backgroundColor:
                        "transparent",

                    borderWidth: 2,

                    pointRadius: 3,

                    tension: 0.35,

                    fill: false
                }

            ]
        },

        options: {

            responsive: true,

            maintainAspectRatio: false,

            interaction: {
                mode: "index",
                intersect: false
            },

            plugins: {

                legend: {
                    display: false
                },

                tooltip: {

                    backgroundColor: "#161b22",

                    borderColor: "#30363d",

                    borderWidth: 1,

                    titleColor: "#f0f6fc",

                    bodyColor: "#8b949e",

                    padding: 12,

                    callbacks: {

                        label: function(context) {

                            return (
                                " " +
                                context.dataset.label +
                                ": " +
                                formatNumber(context.raw)
                            );

                        }

                    }
                }

            },

            scales: {

                x: {

                    grid: {
                        color: "rgba(48,54,61,0.35)"
                    },

                    ticks: {
                        color: "#8b949e",

                        font: {
                            size: 11
                        }
                    }
                },

                y: {

                    beginAtZero: true,

                    grid: {
                        color: "rgba(48,54,61,0.35)"
                    },

                    ticks: {

                        color: "#8b949e",

                        font: {
                            size: 11
                        },

                        callback: function(value) {
                            return formatCompact(value);
                        }

                    }

                }

            }

        }

    });
}


/* ============================================================
   REPOSITORIES
   ============================================================ */

function buildRepositoryList() {

    const container =
        document.getElementById("repositoryList");

    const repositories =
        dashboardData.top_repositories;

    container.innerHTML = "";

    if (!repositories.length) {
        container.innerHTML =
            `<div class="empty-state">No repository data available.</div>`;
        return;
    }

    const maxEvents =
        Math.max(
            ...repositories.map(repo =>
                safeNumber(repo.total_events)
            )
        );


    repositories.forEach((repo, index) => {

        const events =
            safeNumber(repo.total_events);

        const contributors =
            safeNumber(repo.unique_contributors);

        const percentage =
            maxEvents > 0
                ? (events / maxEvents) * 100
                : 0;


        const row =
            document.createElement("div");

        row.className = "repository-row";

        row.innerHTML = `

            <span class="rank">
                ${String(index + 1).padStart(2, "0")}
            </span>

            <div>

                <div class="repo-name">
                    ${escapeHTML(repo.name)}
                </div>

                <div class="repo-meta">
                    ${formatNumber(contributors)}
                    contributor${contributors === 1 ? "" : "s"}
                </div>

            </div>

            <div class="repo-bar">
                <span style="width: ${percentage}%"></span>
            </div>

            <div class="repo-events">
                ${formatNumber(events)}
            </div>

        `;

        container.appendChild(row);

    });
}


/* ============================================================
   CONTRIBUTORS
   ============================================================ */

function buildContributorList() {

    const container =
        document.getElementById("contributorList");

    const contributors =
        dashboardData.top_contributors;

    container.innerHTML = "";

    const maxEvents =
        Math.max(
            ...contributors.map(person =>
                safeNumber(person.total_events)
            )
        );


    contributors.forEach((person, index) => {

        const events =
            safeNumber(person.total_events);

        const percentage =
            maxEvents > 0
                ? (events / maxEvents) * 100
                : 0;

        const name =
            person.contributor || "Unknown";


        const row =
            document.createElement("div");

        row.className = "contributor-row";

        row.innerHTML = `

            <div class="avatar">
                ${getInitial(name)}
            </div>

            <div>
                <div class="contributor-name">
                    ${escapeHTML(name)}
                </div>

                <div class="repo-meta">
                    ${formatNumber(
                        safeNumber(person.repositories_active)
                    )}
                    repositories
                </div>
            </div>

            <div class="contributor-bar">
                <span style="width: ${percentage}%"></span>
            </div>

            <div class="contributor-events">
                ${formatNumber(events)}
            </div>

        `;

        container.appendChild(row);

    });
}


/* ============================================================
   ISSUES
   ============================================================ */

function buildIssueList() {

    const container =
        document.getElementById("issueList");

    const issues =
        dashboardData.issues;

    container.innerHTML = "";

    issues.forEach(issue => {

        const opened =
            safeNumber(issue.issues_opened);

        const closed =
            safeNumber(issue.issues_closed);

        const total =
            safeNumber(issue.unique_issues);


        const row =
            document.createElement("div");

        row.className = "issue-row";

        row.innerHTML = `

            <span class="item-repo">
                ${escapeHTML(issue.repository)}
            </span>

            <div class="item-stats">

                <span>
                    ${formatNumber(total)}
                    total
                </span>

                <span class="opened">
                    +${formatNumber(opened)}
                    opened
                </span>

                <span class="closed">
                    ${formatNumber(closed)}
                    closed
                </span>

            </div>

        `;

        container.appendChild(row);

    });
}


/* ============================================================
   PULL REQUESTS
   ============================================================ */

function buildPRList() {

    const container =
        document.getElementById("prList");

    const prs =
        dashboardData.pull_requests;

    container.innerHTML = "";

    prs.forEach(pr => {

        const opened =
            safeNumber(pr.prs_opened);

        const closed =
            safeNumber(pr.prs_closed);

        const merged =
            safeNumber(pr.prs_merged);


        const row =
            document.createElement("div");

        row.className = "pr-row";

        row.innerHTML = `

            <span class="item-repo">
                ${escapeHTML(pr.repository)}
            </span>

            <div class="item-stats">

                <span class="opened">
                    +${formatNumber(opened)}
                    opened
                </span>

                <span class="closed">
                    ${formatNumber(closed)}
                    closed
                </span>

                <span class="merged">
                    ${formatNumber(merged)}
                    merged
                </span>

            </div>

        `;

        container.appendChild(row);

    });
}


/* ============================================================
   HEALTH CHART
   ============================================================ */

function buildHealthChart() {

    const canvas =
        document.getElementById("healthChart");

    const health =
        dashboardData.health_indicators;

    if (!health.length) {
        return;
    }


    const labels =
        health.map(repo => repo.name);


    new Chart(canvas, {

        type: "bar",

        data: {

            labels,

            datasets: [

                {
                    label: "Activity",

                    data: health.map(repo =>
                        safeNumber(repo.activity_score)
                    ),

                    backgroundColor: "#3fb950",

                    borderRadius: 2
                },

                {
                    label: "Contributors",

                    data: health.map(repo =>
                        safeNumber(repo.contributor_score)
                    ),

                    backgroundColor: "#58a6ff",

                    borderRadius: 2
                },

                {
                    label: "Collaboration",

                    data: health.map(repo =>
                        safeNumber(repo.collaboration_score)
                    ),

                    backgroundColor: "#bc8cff",

                    borderRadius: 2
                },

                {
                    label: "Releases",

                    data: health.map(repo =>
                        safeNumber(repo.release_score)
                    ),

                    backgroundColor: "#d29922",

                    borderRadius: 2
                }

            ]

        },

        options: {

            responsive: true,

            maintainAspectRatio: false,

            plugins: {

                legend: {

                    labels: {
                        color: "#8b949e",

                        font: {
                            size: 10
                        },

                        boxWidth: 10,

                        boxHeight: 10
                    }

                },

                tooltip: {

                    backgroundColor: "#161b22",

                    borderColor: "#30363d",

                    borderWidth: 1,

                    titleColor: "#f0f6fc",

                    bodyColor: "#8b949e",

                    padding: 10

                }

            },

            scales: {

                x: {

                    grid: {
                        display: false
                    },

                    ticks: {

                        color: "#8b949e",

                        font: {
                            size: 9
                        },

                        maxRotation: 45,

                        minRotation: 45
                    }

                },

                y: {

                    beginAtZero: true,

                    grid: {

                        color:
                            "rgba(48,54,61,0.35)"
                    },

                    ticks: {

                        color: "#8b949e",

                        font: {
                            size: 10
                        }
                    }

                }

            }

        }

    });
}


/* ============================================================
   SECURITY / HTML ESCAPING
   ============================================================ */

function escapeHTML(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


/* ============================================================
   START
   ============================================================ */

document.addEventListener(
    "DOMContentLoaded",
    loadDashboard
);
