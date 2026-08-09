// ==UserScript==
// @name         Badge Remover V3
// @namespace    https://github.com/T3CHCSS/RobloxBadgeRemover/
// @version      latest.latest.9
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
    // PERMANENT STORAGE
    // =========================
    //
    // DO NOT CHANGE THESE KEYS IN FUTURE UPDATES.
    //
    // These values are stored in Roblox's localStorage,
    // not inside the userscript itself.
    //

    const CUSTOM_BADGES_STORAGE_KEY =
        "seanszy_badge_remover_custom_badges_v1";

    const UI_MINIMIZED_STORAGE_KEY =
        "seanszy_badge_remover_ui_minimized_v1";

    // =========================
    // CUSTOM BADGE STORAGE
    // =========================

    function loadCustomBadges() {
        try {
            const saved =
                localStorage.getItem(
                    CUSTOM_BADGES_STORAGE_KEY
                );

            if (!saved) {
                return [];
            }

            const parsed =
                JSON.parse(saved);

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

    let customBadges =
        loadCustomBadges();

    // =========================
    // UI MINIMIZED STORAGE
    // =========================

    function loadMinimizedState() {
        try {
            return (
                localStorage.getItem(
                    UI_MINIMIZED_STORAGE_KEY
                ) === "true"
            );

        } catch (error) {
            console.error(
                "[Badge Remover] Failed to load UI state:",
                error
            );

            return false;
        }
    }

    function saveMinimizedState(minimized) {
        try {
            localStorage.setItem(
                UI_MINIMIZED_STORAGE_KEY,
                minimized
                    ? "true"
                    : "false"
            );

            return true;

        } catch (error) {
            console.error(
                "[Badge Remover] Failed to save UI state:",
                error
            );

            return false;
        }
    }

    // =========================
    // UI
    // =========================

    const panel =
        document.createElement("div");

    panel.id =
        "seanszyBadgeRemover";

    panel.style.cssText = `
        position: fixed;
        top: 50%;
        right: 15px;
        transform: translateY(-50%);
        width: 230px;
        max-height: 450px;
        overflow-y: auto;
        z-index: 999999;
        padding: 10px;
        box-sizing: border-box;

        font-family: Arial, sans-serif;
        font-size: 12px;

        border-radius: 8px;

        background: var(--badge-remover-bg);
        color: var(--badge-remover-text);
        border: 1px solid var(--badge-remover-border);

        box-shadow: 0 0 10px var(--badge-remover-shadow);

        transition:
            background 0.2s ease,
            color 0.2s ease,
            border-color 0.2s ease;
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
                    background: var(--badge-remover-button);
                    color: var(--badge-remover-text);
                    border: 1px solid var(--badge-remover-border);
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
                    background: var(--badge-remover-button);
                    color: var(--badge-remover-text);
                    border: 1px solid var(--badge-remover-border);
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
                border-top: 1px solid var(--badge-remover-border);
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

                            background: var(--badge-remover-input);
                            color: var(--badge-remover-text);

                            border: 1px solid var(--badge-remover-border);
                            border-radius: 4px;

                            padding: 5px;
                            box-sizing: border-box;
                            outline: none;
                        "
                    >

                    <button
                        id="badgeRemoverAddButton"
                        style="
                            background: var(--badge-remover-button);
                            color: var(--badge-remover-text);

                            border: 1px solid var(--badge-remover-border);
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
                border-top: 1px solid var(--badge-remover-border);
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
                border-top: 1px solid var(--badge-remover-border);
                padding-top: 8px;
                margin-top: 8px;
            ">

                <div id="badgeRemoverLogs"></div>

            </div>

        </div>
    `;

    document.body.appendChild(panel);

    const status =
        panel.querySelector(
            "#badgeRemoverStatus"
        );

    const logs =
        panel.querySelector(
            "#badgeRemoverLogs"
        );

    const content =
        panel.querySelector(
            "#badgeRemoverContent"
        );

    const toggleUI =
        panel.querySelector(
            "#badgeRemoverToggleUI"
        );

    const scanButton =
        panel.querySelector(
            "#badgeRemoverScanButton"
        );

    const badgeInput =
        panel.querySelector(
            "#badgeRemoverBadgeInput"
        );

    const addButton =
        panel.querySelector(
            "#badgeRemoverAddButton"
        );

    const addMessage =
        panel.querySelector(
            "#badgeRemoverAddMessage"
        );

    const customList =
        panel.querySelector(
            "#badgeRemoverCustomList"
        );

    // =========================
    // LOAD SAVED UI STATE
    // =========================

    let minimized =
        loadMinimizedState();

    function applyMinimizedState() {
        content.style.display =
            minimized
                ? "none"
                : "block";

        toggleUI.textContent =
            minimized
                ? "+"
                : "−";

        panel.style.width =
            minimized
                ? "100px"
                : "230px";
    }

    // Apply the saved state immediately.
    applyMinimizedState();

    // =========================
    // MINIMIZE / OPEN
    // =========================

    toggleUI.onclick = () => {

        minimized =
            !minimized;

        // Save immediately.
        saveMinimizedState(
            minimized
        );

        applyMinimizedState();
    };

    // =========================
    // ROBLOX THEME DETECTION
    // =========================

    function getThemeColors() {

        const bodyStyle =
            getComputedStyle(
                document.body
            );

        const htmlStyle =
            getComputedStyle(
                document.documentElement
            );

        const possibleBackgrounds = [
            bodyStyle.getPropertyValue(
                "--background-color"
            ),

            bodyStyle.getPropertyValue(
                "--rbx-background-color"
            ),

            bodyStyle.getPropertyValue(
                "--color-background"
            ),

            htmlStyle.getPropertyValue(
                "--background-color"
            ),

            htmlStyle.getPropertyValue(
                "--rbx-background-color"
            ),

            htmlStyle.getPropertyValue(
                "--color-background"
            )
        ];

        const possibleTextColors = [
            bodyStyle.getPropertyValue(
                "--text-color"
            ),

            bodyStyle.getPropertyValue(
                "--rbx-text-color"
            ),

            bodyStyle.getPropertyValue(
                "--color-text"
            ),

            htmlStyle.getPropertyValue(
                "--text-color"
            ),

            htmlStyle.getPropertyValue(
                "--rbx-text-color"
            ),

            htmlStyle.getPropertyValue(
                "--color-text"
            )
        ];

        let background =
            possibleBackgrounds
                .map(value =>
                    value.trim()
                )
                .find(Boolean);

        let text =
            possibleTextColors
                .map(value =>
                    value.trim()
                )
                .find(Boolean);

        if (!background) {
            background =
                bodyStyle.backgroundColor;
        }

        if (!text) {
            text =
                bodyStyle.color;
        }

        let isLight =
            false;

        const rgbMatch =
            background.match(
                /rgba?\((\d+),\s*(\d+),\s*(\d+)/
            );

        if (rgbMatch) {

            const r =
                Number(rgbMatch[1]);

            const g =
                Number(rgbMatch[2]);

            const b =
                Number(rgbMatch[3]);

            const brightness =
                (
                    r * 299 +
                    g * 587 +
                    b * 114
                ) / 1000;

            isLight =
                brightness > 155;
        }

        if (
            !background ||
            background ===
                "rgba(0, 0, 0, 0)"
        ) {
            background =
                isLight
                    ? "#ffffff"
                    : "#18191a";
        }

        if (
            !text ||
            text ===
                "rgba(0, 0, 0, 0)"
        ) {
            text =
                isLight
                    ? "#191919"
                    : "#ffffff";
        }

        const border =
            isLight
                ? "rgba(0, 0, 0, 0.12)"
                : "rgba(255, 255, 255, 0.12)";

        const button =
            isLight
                ? "rgba(0, 0, 0, 0.06)"
                : "rgba(255, 255, 255, 0.08)";

        const input =
            isLight
                ? "rgba(0, 0, 0, 0.04)"
                : "rgba(0, 0, 0, 0.18)";

        const shadow =
            isLight
                ? "rgba(0, 0, 0, 0.20)"
                : "rgba(0, 0, 0, 0.50)";

        return {
            background,
            text,
            border,
            button,
            input,
            shadow
        };
    }

    function updateTheme() {

        const colors =
            getThemeColors();

        panel.style.setProperty(
            "--badge-remover-bg",
            colors.background
        );

        panel.style.setProperty(
            "--badge-remover-text",
            colors.text
        );

        panel.style.setProperty(
            "--badge-remover-border",
            colors.border
        );

        panel.style.setProperty(
            "--badge-remover-button",
            colors.button
        );

        panel.style.setProperty(
            "--badge-remover-input",
            colors.input
        );

        panel.style.setProperty(
            "--badge-remover-shadow",
            colors.shadow
        );
    }

    updateTheme();

    // =========================
    // WATCH FOR THEME CHANGES
    // =========================

    const themeObserver =
        new MutationObserver(
            () => {
                updateTheme();
            }
        );

    themeObserver.observe(
        document.documentElement,
        {
            attributes: true,
            attributeFilter: [
                "class",
                "style",
                "data-theme",
                "data-color-theme"
            ],
            subtree: true
        }
    );

    themeObserver.observe(
        document.body,
        {
            attributes: true,
            attributeFilter: [
                "class",
                "style",
                "data-theme",
                "data-color-theme"
            ],
            subtree: true
        }
    );

    setInterval(
        updateTheme,
        1000
    );

    // =========================
    // LOGGING
    // =========================

    function log(
        text,
        color = null
    ) {

        const line =
            document.createElement("div");

        line.textContent =
            text;

        line.style.color =
            color ||
            "var(--badge-remover-text)";

        line.style.whiteSpace =
            "nowrap";

        line.style.overflow =
            "hidden";

        line.style.textOverflow =
            "ellipsis";

        logs.appendChild(
            line
        );

        logs.scrollTop =
            logs.scrollHeight;
    }

    // =========================
    // CUSTOM BADGE LIST
    // =========================

    function renderCustomBadges() {

        customList.innerHTML =
            "";

        if (
            customBadges.length === 0
        ) {

            const empty =
                document.createElement(
                    "div"
                );

            empty.textContent =
                "No custom badges saved.";

            empty.style.opacity =
                "0.55";

            customList.appendChild(
                empty
            );

            return;
        }

        customBadges.forEach(
            badgeId => {

                const row =
                    document.createElement(
                        "div"
                    );

                row.style.cssText = `
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 5px;
                    margin-bottom: 4px;
                    background: var(--badge-remover-button);
                    padding: 4px 5px;
                    border-radius: 4px;
                `;

                const idText =
                    document.createElement(
                        "span"
                    );

                idText.textContent =
                    String(badgeId);

                idText.style.cssText = `
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                    flex: 1;
                `;

                const removeButton =
                    document.createElement(
                        "button"
                    );

                removeButton.textContent =
                    "×";

                removeButton.title =
                    "Remove this custom badge";

                removeButton.style.cssText = `
                    background: rgba(255, 0, 0, 0.12);
                    color: #ff6666;
                    border: 0;
                    border-radius: 3px;
                    cursor: pointer;
                    width: 20px;
                    height: 20px;
                    flex-shrink: 0;
                `;

                removeButton.onclick =
                    () => {

                        customBadges =
                            customBadges.filter(
                                id =>
                                    id !==
                                    badgeId
                            );

                        if (
                            saveCustomBadges(
                                customBadges
                            )
                        ) {

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

                row.appendChild(
                    idText
                );

                row.appendChild(
                    removeButton
                );

                customList.appendChild(
                    row
                );
            }
        );
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

        if (!/^\d+$/.test(
            rawValue
        )) {

            addMessage.textContent =
                "Badge ID must be a number.";

            addMessage.style.color =
                "#ff6666";

            return;
        }

        const badgeId =
            Number(rawValue);

        if (
            !Number.isSafeInteger(
                badgeId
            ) ||
            badgeId <= 0
        ) {

            addMessage.textContent =
                "Invalid badge ID.";

            addMessage.style.color =
                "#ff6666";

            return;
        }

        if (
            customBadges.includes(
                badgeId
            )
        ) {

            addMessage.textContent =
                "That badge is already saved.";

            addMessage.style.color =
                "#ffaa00";

            return;
        }

        customBadges.push(
            badgeId
        );

        if (
            !saveCustomBadges(
                customBadges
            )
        ) {

            customBadges =
                customBadges.filter(
                    id =>
                        id !== badgeId
                );

            addMessage.textContent =
                "Failed to save badge.";

            addMessage.style.color =
                "#ff6666";

            return;
        }

        badgeInput.value =
            "";

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

            if (
                event.key === "Enter"
            ) {
                addCustomBadge();
            }
        }
    );

    renderCustomBadges();

    // =========================
    // ROBLOX DELETE REQUEST
    // =========================

    async function robloxDelete(
        url
    ) {

        let response =
            await fetch(
                url,
                {
                    method: "DELETE",
                    credentials: "include"
                }
            );

        if (
            response.status === 403
        ) {

            const csrf =
                response.headers.get(
                    "x-csrf-token"
                );

            if (csrf) {

                response =
                    await fetch(
                        url,
                        {
                            method: "DELETE",
                            credentials: "include",
                            headers: {
                                "X-CSRF-TOKEN":
                                    csrf
                            }
                        }
                    );
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

        scanning =
            true;

        scanButton.disabled =
            true;

        scanButton.textContent =
            "Scanning...";

        scanButton.style.opacity =
            "0.6";

        logs.innerHTML =
            "";

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
                        credentials:
                            "include"
                    }
                );

            if (
                !userResponse.ok
            ) {

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
            // TARGET BADGES
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

            if (
                customBadges.length > 0
            ) {

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

            let cursor =
                null;

            const targets =
                [];

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
                    await fetch(
                        url,
                        {
                            credentials:
                                "include"
                        }
                    );

                if (
                    !pageResponse.ok
                ) {

                    throw new Error(
                        `Badge request failed (${pageResponse.status})`
                    );
                }

                const page =
                    await pageResponse.json();

                for (
                    const badge
                    of page.data || []
                ) {

                    if (
                        uniqueBadgeIds.includes(
                            Number(
                                badge.id
                            )
                        )
                    ) {

                        targets.push(
                            badge
                        );
                    }
                }

                cursor =
                    page.nextPageCursor ||
                    null;

            } while (cursor);

            // =========================
            // NOTHING FOUND
            // =========================

            if (
                targets.length === 0
            ) {

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
            // DELETE
            // =========================

            let count =
                0;

            for (
                const badge
                of targets
            ) {

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

                    if (
                        response.ok
                    ) {

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

                } catch (
                    error
                ) {

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

        } catch (
            error
        ) {

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

            scanning =
                false;

            scanButton.disabled =
                false;

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

    scanBadges();

})();
