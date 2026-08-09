// ==UserScript==
// @name         Badge Remover V3
// @namespace    https://github.com/T3CHCSS/RobloxBadgeRemover/
// @version      latest.latest.5
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

    // =========================
    // CONFIG
    // =========================

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
            requestDelay: 1000
        }
    };

    // =========================
    // PERMANENT CUSTOM STORAGE
    // =========================

    // DO NOT CHANGE THIS KEY IN FUTURE UPDATES.
    const CUSTOM_BADGES_STORAGE_KEY =
        "seanszy_badge_remover_custom_badges_v1";

    function loadCustomBadges() {
        try {
            const saved = localStorage.getItem(
                CUSTOM_BADGES_STORAGE_KEY
            );

            if (!saved) {
                return [];
            }

            const parsed = JSON.parse(saved);

            if (!Array.isArray(parsed)) {
                return [];
            }

            return [
                ...new Set(
                    parsed
                        .map(id => Number(id))
                        .filter(
                            id =>
                                Number.isSafeInteger(id) &&
                                id > 0
                        )
                )
            ];

        } catch (error) {
            console.error(
                "[Badge Remover] Failed to load custom badges:",
                error
            );

            return [];
        }
    }

    function saveCustomBadges(badges) {
        try {
            const cleaned = [
                ...new Set(
                    badges
                        .map(id => Number(id))
                        .filter(
                            id =>
                                Number.isSafeInteger(id) &&
                                id > 0
                        )
                )
            ];

            localStorage.setItem(
                CUSTOM_BADGES_STORAGE_KEY,
                JSON.stringify(cleaned)
            );

            return true;

        } catch (error) {
            console.error(
                "[Badge Remover] Failed to save custom badges:",
                error
            );

            return false;
        }
    }

    let customBadges = loadCustomBadges();

    // =========================
    // UI
    // =========================

    const panel = document.createElement("div");

    panel.style.cssText = `
        position: fixed;
        top: 50%;
        right: 15px;
        transform: translateY(-50%);
        width: 230px;
        max-height: 450px;
        overflow-y: auto;
        background: rgba(17, 17, 17, 0.95);
        color: white;
        padding: 10px;
        border-radius: 8px;
        z-index: 999999;
        font-family: Arial, sans-serif;
        font-size: 12px;
        box-shadow: 0 0 10px #000;
        box-sizing: border-box;
    `;

    panel.innerHTML = `
        <div style="
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 7px;
        ">
            <b>Badge Remover</b>

            <button
                id="badgeRemoverToggleUI"
                style="
                    background: #222;
                    color: white;
                    border: 0;
                    border-radius: 4px;
                    cursor: pointer;
                    width: 22px;
                    height: 20px;
                "
            >−</button>
        </div>

        <div id="badgeRemoverContent">

            <!-- SCAN BUTTON -->

            <button
                id="badgeRemoverScanButton"
                style="
                    width: 100%;
                    background: #333;
                    color: white;
                    border: 0;
                    border-radius: 5px;
                    padding: 7px;
                    margin-bottom: 8px;
                    cursor: pointer;
                    font-weight: bold;
                "
            >
                Scan Badges
            </button>

            <div
                id="badgeRemoverStatus"
                style="
                    margin-bottom: 7px;
                "
            >
                Ready
            </div>

            <!-- ADD CUSTOM BADGE -->

            <div style="
                border-top: 1px solid #333;
                padding-top: 8px;
                margin-top: 5px;
            ">

                <b style="
                    display: block;
                    margin-bottom: 5px;
                ">
                    Add Custom Badge
                </b>

                <div style="
                    display: flex;
                    gap: 4px;
                ">

                    <input
                        id="badgeRemoverBadgeInput"
                        type="text"
                        placeholder="Badge ID"
                        style="
                            flex: 1;
                            min-width: 0;
                            background: #222;
                            color: white;
                            border: 1px solid #444;
                            border-radius: 4px;
                            padding: 5px;
                            box-sizing: border-box;
                            outline: none;
                        "
                    >

                    <button
                        id="badgeRemoverAddButton"
                        style="
                            background: #333;
                            color: white;
                            border: 0;
                            border-radius: 4px;
                            padding: 5px 8px;
                            cursor: pointer;
                        "
                    >
                        Add
                    </button>

                </div>

                <div
                    id="badgeRemoverAddMessage"
                    style="
                        margin-top: 5px;
                        min-height: 14px;
                    "
                ></div>

            </div>

            <!-- SAVED CUSTOM BADGES -->

            <div style="
                border-top: 1px solid #333;
                padding-top: 8px;
                margin-top: 8px;
            ">

                <b style="
                    display: block;
                    margin-bottom: 5px;
                ">
                    Saved Custom Badges
                </b>

                <div id="badgeRemoverCustomList"></div>

            </div>

            <!-- LOGS -->

            <div style="
                border-top: 1px solid #333;
                padding-top: 8px;
                margin-top: 8px;
            ">

                <div id="badgeRemoverLogs"></div>

            </div>

        </div>
    `;

    document.body.appendChild(panel);

    const status =
        panel.querySelector("#badgeRemoverStatus");

    const logs =
        panel.querySelector("#badgeRemoverLogs");

    const content =
        panel.querySelector("#badgeRemoverContent");

    const toggleUI =
        panel.querySelector("#badgeRemoverToggleUI");

    const scanButton =
        panel.querySelector("#badgeRemoverScanButton");

    const badgeInput =
        panel.querySelector("#badgeRemoverBadgeInput");

    const addButton =
        panel.querySelector("#badgeRemoverAddButton");

    const addMessage =
        panel.querySelector("#badgeRemoverAddMessage");

    const customList =
        panel.querySelector("#badgeRemoverCustomList");

    let minimized = false;
    let scanning = false;

    // =========================
    // MINIMIZE / OPEN
    // =========================

    toggleUI.onclick = () => {
        minimized = !minimized;

        content.style.display =
            minimized ? "none" : "block";

        toggleUI.textContent =
            minimized ? "+" : "−";

        panel.style.width =
            minimized ? "100px" : "230px";
    };

    // =========================
    // LOGGING
    // =========================

    function log(text, color = "white") {
        const line =
            document.createElement("div");

        line.textContent = text;
        line.style.color = color;
        line.style.whiteSpace = "nowrap";
        line.style.overflow = "hidden";
        line.style.textOverflow = "ellipsis";

        logs.appendChild(line);

        logs.scrollTop =
            logs.scrollHeight;
    }

    // =========================
    // CUSTOM BADGE LIST
    // =========================

    function renderCustomBadges() {
        customList.innerHTML = "";

        if (customBadges.length === 0) {
            const empty =
                document.createElement("div");

            empty.textContent =
                "No custom badges saved.";

            empty.style.color = "#888";

            customList.appendChild(empty);

            return;
        }

        customBadges.forEach(badgeId => {
            const row =
                document.createElement("div");

            row.style.cssText = `
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 5px;
                margin-bottom: 4px;
                background: #222;
                padding: 4px 5px;
                border-radius: 4px;
            `;

            const idText =
                document.createElement("span");

            idText.textContent =
                String(badgeId);

            idText.style.cssText = `
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
                flex: 1;
            `;

            const removeButton =
                document.createElement("button");

            removeButton.textContent = "×";

            removeButton.title =
                "Remove this custom badge";

            removeButton.style.cssText = `
                background: #441111;
                color: #ff6666;
                border: 0;
                border-radius: 3px;
                cursor: pointer;
                width: 20px;
                height: 20px;
                flex-shrink: 0;
            `;

            removeButton.onclick = () => {
                customBadges =
                    customBadges.filter(
                        id => id !== badgeId
                    );

                if (saveCustomBadges(customBadges)) {
                    addMessage.textContent =
                        `Removed ${badgeId}`;

                    addMessage.style.color =
                        "#ff6666";
                } else {
                    addMessage.textContent =
                        "Failed to save change.";

                    addMessage.style.color =
                        "red";
                }

                renderCustomBadges();
            };

            row.appendChild(idText);
            row.appendChild(removeButton);

            customList.appendChild(row);
        });
    }

    // =========================
    // ADD CUSTOM BADGE
    // =========================

    function addCustomBadge() {
        const rawValue =
            badgeInput.value.trim();

        if (!rawValue) {
            addMessage.textContent =
                "Enter a badge ID.";

            addMessage.style.color =
                "#ff6666";

            return;
        }

        if (!/^\d+$/.test(rawValue)) {
            addMessage.textContent =
                "Badge ID must be a number.";

            addMessage.style.color =
                "#ff6666";

            return;
        }

        const badgeId =
            Number(rawValue);

        if (
            !Number.isSafeInteger(badgeId) ||
            badgeId <= 0
        ) {
            addMessage.textContent =
                "Invalid badge ID.";

            addMessage.style.color =
                "#ff6666";

            return;
        }

        if (customBadges.includes(badgeId)) {
            addMessage.textContent =
                "That badge is already saved.";

            addMessage.style.color =
                "#ffaa00";

            return;
        }

        customBadges.push(badgeId);

        if (!saveCustomBadges(customBadges)) {
            customBadges =
                customBadges.filter(
                    id => id !== badgeId
                );

            addMessage.textContent =
                "Failed to save badge.";

            addMessage.style.color =
                "#ff6666";

            return;
        }

        badgeInput.value = "";

        addMessage.textContent =
            `Saved badge ${badgeId}`;

        addMessage.style.color =
            "#00ff66";

        renderCustomBadges();
    }

    addButton.onclick =
        addCustomBadge;

    badgeInput.addEventListener(
        "keydown",
        event => {
            if (event.key === "Enter") {
                addCustomBadge();
            }
        }
    );

    renderCustomBadges();

    // =========================
    // ROBLOX DELETE REQUEST
    // =========================

    async function robloxDelete(url) {
        let response =
            await fetch(url, {
                method: "DELETE",
                credentials: "include"
            });

        if (response.status === 403) {
            const csrf =
                response.headers.get(
                    "x-csrf-token"
                );

            if (csrf) {
                response =
                    await fetch(url, {
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

    // =========================
    // SCAN
    // =========================

    async function scanBadges() {
        if (scanning) {
            return;
        }

        scanning = true;

        scanButton.disabled = true;

        scanButton.textContent =
            "Scanning...";

        scanButton.style.opacity =
            "0.6";

        logs.innerHTML = "";

        status.textContent =
            "Authenticating...";

        try {
            // =========================
            // GET LOGGED-IN USER
            // =========================

            const userResponse =
                await fetch(
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

            const user =
                await userResponse.json();

            if (!user?.id) {
                status.textContent =
                    "Not logged in";

                log(
                    "Login required",
                    "red"
                );

                return;
            }

            log(
                `Logged in: ${user.name || user.id}`,
                "#00ff66"
            );

            // =========================
            // BUILD TARGET LIST
            // =========================

            const allBadgeIds = [
                ...config.badgesToDelete,
                ...customBadges
            ];

            const uniqueBadgeIds = [
                ...new Set(
                    allBadgeIds.map(
                        id => Number(id)
                    )
                )
            ];

            log(
                `Watching ${uniqueBadgeIds.length} badge(s)`,
                "#00ff66"
            );

            if (customBadges.length > 0) {
                log(
                    `${customBadges.length} custom badge(s) loaded`,
                    "#00ff66"
                );
            }

            // =========================
            // FIND BADGES
            // =========================

            status.textContent =
                "Scanning badges...";

            let cursor = null;
            const targets = [];

            do {
                const params =
                    new URLSearchParams({
                        limit: "100",
                        sortOrder: "Asc"
                    });

                if (cursor) {
                    params.set(
                        "cursor",
                        cursor
                    );
                }

                const url =
                    `https://badges.roblox.com/v1/users/${user.id}/badges?${params.toString()}`;

                const pageResponse =
                    await fetch(url, {
                        credentials: "include"
                    });

                if (!pageResponse.ok) {
                    throw new Error(
                        `Badge request failed (${pageResponse.status})`
                    );
                }

                const page =
                    await pageResponse.json();

                for (
                    const badge of page.data || []
                ) {
                    if (
                        uniqueBadgeIds.includes(
                            Number(badge.id)
                        )
                    ) {
                        targets.push(badge);
                    }
                }

                cursor =
                    page.nextPageCursor ||
                    null;

            } while (cursor);

            // =========================
            // NOTHING FOUND
            // =========================

            if (targets.length === 0) {
                status.textContent =
                    "No badges found";

                log(
                    "Nothing to delete",
                    "yellow"
                );

                return;
            }

            log(
                `Found ${targets.length} badge(s)`,
                "#00ff66"
            );

            // =========================
            // DELETE BADGES
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
                    const response =
                        await robloxDelete(
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

                await new Promise(
                    resolve => {
                        setTimeout(
                            resolve,
                            config.settings.requestDelay
                        );
                    }
                );
            }

            // =========================
            // FINISHED
            // =========================

            status.textContent =
                "Finished";

            log(
                "All requests completed",
                "#00ff66"
            );

        } catch (error) {
            console.error(
                "[Badge Remover]",
                error
            );

            status.textContent =
                "Error";

            log(
                error.message ||
                "Unknown error",
                "red"
            );

        } finally {
            scanning = false;

            scanButton.disabled = false;

            scanButton.textContent =
                "Scan Badges";

            scanButton.style.opacity =
                "1";
        }
    }

    // =========================
    // SCAN BUTTON
    // =========================

    scanButton.onclick =
        scanBadges;

    // =========================
    // AUTOMATIC FIRST SCAN
    // =========================

    // Automatically scan once when the script loads.
    scanBadges();

})();
