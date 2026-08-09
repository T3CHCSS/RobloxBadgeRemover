// ==UserScript==
// @name         Badge Remover V3
// @namespace    https://github.com/T3CHCSS/RobloxBadgeRemover/
// @version      latest.latest.2
// @description  Removes selected Roblox badges from your account.
// @author       Seanszy
// @homepageURL  https://github.com/T3CHCSS/RobloxBadgeRemover/
// @source       https://github.com/T3CHCSS/RobloxBadgeRemover/
// @updateURL    https://github.com/T3CHCSS/RobloxBadgeRemover/releases/latest/download/RobloxBadgeRemover.user.js
// @downloadURL  https://github.com/T3CHCSS/RobloxBadgeRemover/releases/latest/download/RobloxBadgeRemover.user.js
// @match        https://roblox.com/*
// @match        https://www.roblox.com/*
// @license      MIT
// @copyright    Copyright (c) 2026 Seanszy
// @grant        none
// ==/UserScript==

// AUTO UPDATER MIGHT BE BROKEN!
// USE WITH CAUTION
// I AM NOT RESPONSIBLE FOR BROKEN UPDATES | THEY WILL GET PATCHED WHEN I GET TIME

(async () => {
    "use strict";

    const config = {
        badgesToDelete: [
            2290821300126871,
            2911934755170615,
            2614825947197701,
            948902799641499,
            2912957635374970,
            1143380234502304,
            4414134519704437,
            4003576125813667
        ],

        settings: {
            requestDelay: 1000,
            hideDelay: 3000
        }
    };

    // =========================
    // UI
    // =========================

    const panel = document.createElement("div");

    panel.style.cssText = `
        position: fixed;
        top: 50%;
        right: 15px;
        transform: translateY(-50%);
        width: 150px;
        max-height: 250px;
        overflow-y: auto;
        background: rgba(17, 17, 17, 0.9);
        color: white;
        padding: 8px;
        border-radius: 8px;
        z-index: 999999;
        font-family: Arial, sans-serif;
        font-size: 12px;
        box-shadow: 0 0 10px #000;
    `;

    panel.innerHTML = `
        <div style="
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 5px;
        ">
            <b>Badge Remover</b>

            <button id="badgeRemoverToggleUI" style="
                background: #222;
                color: white;
                border: 0;
                border-radius: 4px;
                cursor: pointer;
                width: 22px;
                height: 20px;
            ">−</button>
        </div>

        <div id="badgeRemoverContent">
            <div id="badgeRemoverStatus">Starting...</div>
            <div id="badgeRemoverLogs"></div>
        </div>
    `;

    document.body.appendChild(panel);

    const status = panel.querySelector("#badgeRemoverStatus");
    const logs = panel.querySelector("#badgeRemoverLogs");
    const content = panel.querySelector("#badgeRemoverContent");
    const toggleUI = panel.querySelector("#badgeRemoverToggleUI");

    let minimized = false;

    toggleUI.onclick = () => {
        minimized = !minimized;

        content.style.display = minimized ? "none" : "block";
        toggleUI.textContent = minimized ? "+" : "−";
        panel.style.width = minimized ? "100px" : "150px";
    };

    function log(text, color = "white") {
        const line = document.createElement("div");

        line.textContent = text;
        line.style.color = color;
        line.style.whiteSpace = "nowrap";
        line.style.overflow = "hidden";
        line.style.textOverflow = "ellipsis";

        logs.appendChild(line);
        logs.scrollTop = logs.scrollHeight;
    }

    function hideUI() {
        setTimeout(() => {
            panel.style.display = "none";
        }, config.settings.hideDelay);
    }

    // =========================
    // Roblox DELETE request
    // =========================

    async function robloxDelete(url) {
        let response = await fetch(url, {
            method: "DELETE",
            credentials: "include"
        });

        if (response.status === 403) {
            const csrf = response.headers.get("x-csrf-token");

            if (csrf) {
                response = await fetch(url, {
                    method: "DELETE",
                    credentials: "include",
                    headers: {
                        "X-CSRF-TOKEN": csrf
                    }
                });
            }
        }

        return response;
    }

    try {
        // =========================
        // Get logged-in user
        // =========================

        const userResponse = await fetch(
            "https://users.roblox.com/v1/users/authenticated",
            {
                credentials: "include"
            }
        );

        if (!userResponse.ok) {
            throw new Error(
                `Authentication request failed (${userResponse.status})`
            );
        }

        const user = await userResponse.json();

        if (!user?.id) {
            status.textContent = "Not logged in";
            log("Login required", "red");
            return;
        }

        log(
            `Logged in: ${user.name || user.id}`,
            "#00ff66"
        );

        // =========================
        // Find badges
        // =========================

        let cursor = null;
        const targets = [];

        do {
            const params = new URLSearchParams({
                limit: "100",
                sortOrder: "Asc"
            });

            if (cursor) {
                params.set("cursor", cursor);
            }

            const url =
                `https://badges.roblox.com/v1/users/${user.id}/badges?${params.toString()}`;

            const pageResponse = await fetch(url, {
                credentials: "include"
            });

            if (!pageResponse.ok) {
                throw new Error(
                    `Badge request failed (${pageResponse.status})`
                );
            }

            const page = await pageResponse.json();

            for (const badge of page.data || []) {
                if (config.badgesToDelete.includes(badge.id)) {
                    targets.push(badge);
                }
            }

            cursor = page.nextPageCursor || null;

        } while (cursor);

        // =========================
        // Nothing found
        // =========================

        if (targets.length === 0) {
            status.textContent = "No badges found";
            log("Nothing to delete", "yellow");
            hideUI();
            return;
        }

        log(
            `Found ${targets.length} badge(s)`,
            "#00ff66"
        );

        // =========================
        // Delete badges
        // =========================

        let count = 0;

        for (const badge of targets) {
            count++;

            status.textContent =
                `Deleting ${count}/${targets.length}`;

            log(
                `Deleting: ${badge.name}`,
                "yellow"
            );

            try {
                const response = await robloxDelete(
                    `https://badges.roblox.com/v1/user/badges/${badge.id}`
                );

                if (response.ok) {
                    log(
                        `Deleted: ${badge.name}`,
                        "#00ff66"
                    );
                } else {
                    log(
                        `Failed: ${badge.name} (${response.status})`,
                        "red"
                    );
                }

            } catch (error) {
                console.error(
                    "[Badge Remover]",
                    error
                );

                log(
                    `Error: ${badge.name}`,
                    "red"
                );
            }

            await new Promise(resolve => {
                setTimeout(
                    resolve,
                    config.settings.requestDelay
                );
            });
        }

        // =========================
        // Finished
        // =========================

        status.textContent = "Finished";

        log(
            "All requests completed",
            "#00ff66"
        );

        hideUI();

    } catch (error) {
        console.error(
            "[Badge Remover]",
            error
        );

        status.textContent = "Error";

        log(
            error.message || "Unknown error",
            "red"
        );
    }
})();
