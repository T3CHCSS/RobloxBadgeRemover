// ==UserScript==
// @name         Badge Remover V3
// @namespace    https://github.com/T3CHCSS/RobloxBadgeRemover/
// @version      latest.latest.11
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

(async () => {
    "use strict";

    // =========================================================
    // CONFIG
    // =========================================================

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

            // Automatically scan when the script loads.
            autoScan: true
        }
    };

    // =========================================================
    // IMPORTANT:
    // DO NOT CHANGE THESE STORAGE KEYS IN FUTURE UPDATES.
    //
    // They are what make settings survive script updates.
    // =========================================================

    const CUSTOM_BADGES_STORAGE_KEY =
        "seanszy_badge_remover_custom_badges_v1";

    const UI_MINIMIZED_STORAGE_KEY =
        "seanszy_badge_remover_ui_minimized_v1";

    // =========================================================
    // LOAD CUSTOM BADGES
    // =========================================================

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
                        .map(Number)
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
                        .map(Number)
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

    // =========================================================
    // LOAD MINIMIZED STATE
    // =========================================================

    function loadMinimizedState() {
        try {
            return (
                localStorage.getItem(
                    UI_MINIMIZED_STORAGE_KEY
                ) === "true"
            );
        } catch (error) {
            return false;
        }
    }

    function saveMinimizedState(value) {
        try {
            localStorage.setItem(
                UI_MINIMIZED_STORAGE_KEY,
                value ? "true" : "false"
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

    // =========================================================
    // UI
    // =========================================================

    // =========================================================
    // SIDEBAR UI
    // =========================================================

    const sidebarItem = document.createElement("li");
    sidebarItem.id = "seanszyBadgeRemoverItem";
    sidebarItem.style.cssText = `
        list-style: none;
        margin: 0;
        padding: 0;
        width: 100%;
    `;

    const panel = document.createElement("div");
    panel.id = "seanszyBadgeRemover";

    panel.style.cssText = `
        width: 100%;
        box-sizing: border-box;
        font-family: Arial, sans-serif;
        font-size: 12px;
        color: var(--badge-remover-text);
        background: transparent;
    `;

    panel.innerHTML = `
        <div style="
            display:flex;
            align-items:center;
            gap:9px;
            width:100%;
            min-height:42px;
            padding:8px 12px;
            box-sizing:border-box;
            cursor:pointer;
            user-select:none;
            color:var(--badge-remover-text);
            border-radius:6px;
        " id="badgeRemoverHeader">
            <span style="
                width:20px;
                height:20px;
                display:flex;
                align-items:center;
                justify-content:center;
                flex-shrink:0;
                font-size:15px;
            ">🏅</span>
            <b style="
                flex:1;
                overflow:hidden;
                text-overflow:ellipsis;
                white-space:nowrap;
                font-size:13px;
                font-weight:600;
            ">Badge Remover</b>
            <span id="badgeRemoverToggleUI" style="
                width:18px;
                height:18px;
                display:flex;
                align-items:center;
                justify-content:center;
                flex-shrink:0;
                font-size:15px;
                opacity:.7;
            ">−</span>
        </div>

        <div id="badgeRemoverContent" style="
            padding:0 10px 10px 10px;
            box-sizing:border-box;
        ">
            <div style="
                padding:8px 0 6px;
            ">
                <button id="badgeRemoverScanButton" style="
                    width:100%;
                    min-height:34px;
                    background:var(--badge-remover-button);
                    color:var(--badge-remover-text);
                    border:1px solid var(--badge-remover-border);
                    border-radius:6px;
                    padding:7px 8px;
                    cursor:pointer;
                    font-weight:bold;
                    box-sizing:border-box;
                ">Scan Badges</button>
            </div>

            <div id="badgeRemoverStatus" style="
                margin:0 0 7px;
                opacity:.75;
                overflow:hidden;
                text-overflow:ellipsis;
                white-space:nowrap;
            ">Ready</div>

            <div style="
                border-top:1px solid var(--badge-remover-border);
                padding-top:8px;
                margin-top:5px;
            ">
                <b style="display:block;margin-bottom:5px;">Add Custom Badge</b>

                <div style="display:flex;gap:4px;">
                    <input id="badgeRemoverBadgeInput" type="text" placeholder="Badge ID" style="
                        flex:1;
                        min-width:0;
                        height:30px;
                        background:var(--badge-remover-input);
                        color:var(--badge-remover-text);
                        border:1px solid var(--badge-remover-border);
                        border-radius:5px;
                        padding:5px 7px;
                        box-sizing:border-box;
                        outline:none;
                    ">
                    <button id="badgeRemoverAddButton" style="
                        background:var(--badge-remover-button);
                        color:var(--badge-remover-text);
                        border:1px solid var(--badge-remover-border);
                        border-radius:5px;
                        padding:5px 8px;
                        cursor:pointer;
                    ">Add</button>
                </div>

                <div id="badgeRemoverAddMessage" style="
                    margin-top:5px;
                    min-height:14px;
                    font-size:11px;
                "></div>
            </div>

            <div style="
                border-top:1px solid var(--badge-remover-border);
                padding-top:8px;
                margin-top:8px;
            ">
                <b style="display:block;margin-bottom:5px;">Saved Custom Badges</b>
                <div id="badgeRemoverCustomList"></div>
            </div>

            <div style="
                border-top:1px solid var(--badge-remover-border);
                padding-top:8px;
                margin-top:8px;
            ">
                <div id="badgeRemoverLogs" style="
                    max-height:110px;
                    overflow-y:auto;
                    padding-right:2px;
                "></div>
            </div>
        </div>
    `;

    sidebarItem.appendChild(panel);

    function findSidebarList() {
        const candidates = [
            "#navigation ul",
            ".rbx-left-col ul",
            "[data-behavior='left-col'] ul",
            "nav ul"
        ];

        for (const selector of candidates) {
            const lists = document.querySelectorAll(selector);
            for (const list of lists) {
                const rect = list.getBoundingClientRect();
                if (rect.left < window.innerWidth * 0.4 && rect.height > 0) {
                    return list;
                }
            }
        }

        const knownLinks = document.querySelectorAll(
            'a[href*="/home"], a[href*="/discover"], a[href*="/avatar"], a[href*="/inventory"], a[href*="/users/"], a[href*="/communities"]'
        );

        for (const link of knownLinks) {
            const list = link.closest("ul");
            if (list) {
                const rect = list.getBoundingClientRect();
                if (rect.left < window.innerWidth * 0.4 && rect.height > 0) {
                    return list;
                }
            }
        }

        return null;
    }

    function mountSidebarItem() {
        if (!document.body.contains(sidebarItem)) {
            const list = findSidebarList();
            if (!list) return false;

            list.appendChild(sidebarItem);
        }

        return true;
    }

    mountSidebarItem();

    const sidebarMountObserver = new MutationObserver(() => {
        if (!document.body.contains(sidebarItem)) {
            mountSidebarItem();
        }
    });

    sidebarMountObserver.observe(document.body, {
        childList: true,
        subtree: true
    });

    const content = panel.querySelector("#badgeRemoverContent");
    const toggleUI = panel.querySelector("#badgeRemoverToggleUI");
    const header = panel.querySelector("#badgeRemoverHeader");
    const status = panel.querySelector("#badgeRemoverStatus");
    const logs = panel.querySelector("#badgeRemoverLogs");
    const scanButton = panel.querySelector("#badgeRemoverScanButton");
    const badgeInput = panel.querySelector("#badgeRemoverBadgeInput");
    const addButton = panel.querySelector("#badgeRemoverAddButton");
    const addMessage = panel.querySelector("#badgeRemoverAddMessage");
    const customList = panel.querySelector("#badgeRemoverCustomList");

    let scanning = false;

    let minimized = loadMinimizedState();

    function applyMinimizedState() {
        content.style.display = minimized ? "none" : "block";
        toggleUI.textContent = minimized ? "+" : "−";
    }

    applyMinimizedState();

    header.onclick = () => {
        minimized = !minimized;
        saveMinimizedState(minimized);
        applyMinimizedState();
    };

    // =========================================================
    // THEME
    // =========================================================

    function updateTheme() {

        const bodyStyle =
            getComputedStyle(
                document.body
            );

        const htmlStyle =
            getComputedStyle(
                document.documentElement
            );

        let background =
            bodyStyle.backgroundColor;

        let text =
            bodyStyle.color;

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

        const possibleTexts = [
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

        const foundBackground =
            possibleBackgrounds
                .map(v => v.trim())
                .find(Boolean);

        const foundText =
            possibleTexts
                .map(v => v.trim())
                .find(Boolean);

        if (foundBackground) {
            background =
                foundBackground;
        }

        if (foundText) {
            text =
                foundText;
        }

        const rgb =
            background.match(
                /rgba?\((\d+),\s*(\d+),\s*(\d+)/
            );

        let isLight = false;

        if (rgb) {

            const r =
                Number(rgb[1]);

            const g =
                Number(rgb[2]);

            const b =
                Number(rgb[3]);

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

        panel.style.setProperty(
            "--badge-remover-bg",
            background
        );

        panel.style.setProperty(
            "--badge-remover-text",
            text
        );

        panel.style.setProperty(
            "--badge-remover-border",
            isLight
                ? "rgba(0,0,0,.12)"
                : "rgba(255,255,255,.12)"
        );

        panel.style.setProperty(
            "--badge-remover-button",
            isLight
                ? "rgba(0,0,0,.06)"
                : "rgba(255,255,255,.08)"
        );

        panel.style.setProperty(
            "--badge-remover-input",
            isLight
                ? "rgba(0,0,0,.04)"
                : "rgba(0,0,0,.18)"
        );

        panel.style.setProperty(
            "--badge-remover-shadow",
            isLight
                ? "rgba(0,0,0,.20)"
                : "rgba(0,0,0,.50)"
        );
    }

    updateTheme();

    const themeObserver =
        new MutationObserver(
            updateTheme
        );

    themeObserver.observe(
        document.documentElement,
        {
            attributes: true,
            subtree: true
        }
    );

    themeObserver.observe(
        document.body,
        {
            attributes: true,
            subtree: true
        }
    );

    // =========================================================
    // LOG
    // =========================================================

    function log(
        message,
        color = null
    ) {

        const line =
            document.createElement(
                "div"
            );

        line.textContent =
            message;

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

    // =========================================================
    // CUSTOM BADGE LIST
    // =========================================================

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

        for (
            const badgeId
            of customBadges
        ) {

            const row =
                document.createElement(
                    "div"
                );

            row.style.cssText = `
                display:flex;
                align-items:center;
                gap:5px;

                margin-bottom:4px;

                background:
                    var(--badge-remover-button);

                padding:4px 5px;

                border-radius:4px;
            `;

            const idText =
                document.createElement(
                    "span"
                );

            idText.textContent =
                String(badgeId);

            idText.style.cssText = `
                flex:1;
                overflow:hidden;
                text-overflow:ellipsis;
                white-space:nowrap;
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
                background:rgba(255,0,0,.12);
                color:#ff6666;

                border:0;
                border-radius:3px;

                cursor:pointer;

                width:20px;
                height:20px;

                flex-shrink:0;
            `;

            removeButton.onclick = () => {

                customBadges =
                    customBadges.filter(
                        id =>
                            id !== badgeId
                    );

                saveCustomBadges(
                    customBadges
                );

                addMessage.textContent =
                    `Removed ${badgeId}`;

                addMessage.style.color =
                    "#ff6666";

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
    }

    // =========================================================
    // ADD CUSTOM BADGE
    // =========================================================

    function addCustomBadge() {

        const value =
            badgeInput.value.trim();

        if (!value) {

            addMessage.textContent =
                "Enter a badge ID.";

            addMessage.style.color =
                "#ff6666";

            return;
        }

        if (!/^\d+$/.test(value)) {

            addMessage.textContent =
                "Badge ID must be a number.";

            addMessage.style.color =
                "#ff6666";

            return;
        }

        const id =
            Number(value);

        if (
            !Number.isSafeInteger(id) ||
            id <= 0
        ) {

            addMessage.textContent =
                "Invalid badge ID.";

            addMessage.style.color =
                "#ff6666";

            return;
        }

        if (
            customBadges.includes(id)
        ) {

            addMessage.textContent =
                "Badge already saved.";

            addMessage.style.color =
                "#ffaa00";

            return;
        }

        customBadges.push(id);

        if (
            !saveCustomBadges(
                customBadges
            )
        ) {

            customBadges =
                customBadges.filter(
                    badgeId =>
                        badgeId !== id
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
            `Saved ${id}`;

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

    // =========================================================
    // CSRF TOKEN
    // =========================================================

    let csrfToken = null;

    async function getCsrfToken() {

        if (csrfToken) {
            return csrfToken;
        }

        try {

            const response =
                await fetch(
                    "https://auth.roblox.com/v2/logout",
                    {
                        method: "POST",
                        credentials: "include"
                    }
                );

            const token =
                response.headers.get(
                    "x-csrf-token"
                );

            if (token) {

                csrfToken =
                    token;

                return token;
            }

        } catch (error) {

            console.warn(
                "[Badge Remover] CSRF request failed:",
                error
            );
        }

        return null;
    }

    // =========================================================
    // DELETE BADGE
    // =========================================================

    async function deleteBadge(
        badgeId
    ) {

        const url =
            `https://badges.roblox.com/v1/user/badges/${badgeId}`;

        // First attempt.
        let response =
            await fetch(
                url,
                {
                    method: "DELETE",
                    credentials: "include"
                }
            );

        // Roblox normally gives us the CSRF
        // token in the 403 response.
        if (
            response.status === 403
        ) {

            const token =
                response.headers.get(
                    "x-csrf-token"
                );

            if (token) {

                csrfToken =
                    token;

                response =
                    await fetch(
                        url,
                        {
                            method: "DELETE",
                            credentials: "include",

                            headers: {
                                "X-CSRF-TOKEN":
                                    token
                            }
                        }
                    );
            } else {

                const newToken =
                    await getCsrfToken();

                if (newToken) {

                    response =
                        await fetch(
                            url,
                            {
                                method: "DELETE",
                                credentials:
                                    "include",

                                headers: {
                                    "X-CSRF-TOKEN":
                                        newToken
                                }
                            }
                        );
                }
            }
        }

        return response;
    }

    // =========================================================
    // SCAN BADGES
    // =========================================================

    async function scanBadges() {

        // IMPORTANT:
        // Prevent multiple scans at once.
        if (scanning) {

            log(
                "A scan is already running.",
                "#ffaa00"
            );

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
            "Checking account...";

        try {

            // =================================================
            // GET USER
            // =================================================

            const userResponse =
                await fetch(
                    "https://users.roblox.com/v1/users/authenticated",
                    {
                        method: "GET",
                        credentials: "include"
                    }
                );

            if (
                !userResponse.ok
            ) {

                throw new Error(
                    `Authentication failed (${userResponse.status})`
                );
            }

            const user =
                await userResponse.json();

            if (!user || !user.id) {

                throw new Error(
                    "Could not find logged-in Roblox account."
                );
            }

            log(
                `Logged in: ${user.name} (${user.id})`,
                "#00ff66"
            );

            // =================================================
            // TARGET IDS
            // =================================================

            const targetIds = [
                ...config.badgesToDelete,
                ...customBadges
            ];

            const uniqueTargetIds = [
                ...new Set(
                    targetIds.map(
                        Number
                    )
                )
            ];

            log(
                `Configured badges: ${uniqueTargetIds.length}`,
                "#00ff66"
            );

            if (
                customBadges.length > 0
            ) {

                log(
                    `Custom badges loaded: ${customBadges.length}`,
                    "#00ff66"
                );
            }

            // =================================================
            // GET ALL USER BADGES
            // =================================================

            status.textContent =
                "Scanning badges...";

            let cursor =
                null;

            const targets =
                [];

            let pageNumber =
                0;

            do {

                pageNumber++;

                const params =
                    new URLSearchParams();

                params.set(
                    "limit",
                    "100"
                );

                params.set(
                    "sortOrder",
                    "Asc"
                );

                if (cursor) {

                    params.set(
                        "cursor",
                        cursor
                    );
                }

                const url =
                    `https://badges.roblox.com/v1/users/${user.id}/badges?${params.toString()}`;

                log(
                    `Scanning page ${pageNumber}...`
                );

                const response =
                    await fetch(
                        url,
                        {
                            method: "GET",
                            credentials:
                                "include"
                        }
                    );

                if (
                    !response.ok
                ) {

                    throw new Error(
                        `Badge API failed (${response.status})`
                    );
                }

                const page =
                    await response.json();

                for (
                    const badge
                    of page.data || []
                ) {

                    const badgeId =
                        Number(
                            badge.id
                        );

                    if (
                        uniqueTargetIds.includes(
                            badgeId
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

            } while (
                cursor
            );

            // =================================================
            // SCAN RESULT
            // =================================================

            if (
                targets.length === 0
            ) {

                status.textContent =
                    "No matching badges";

                log(
                    "No matching badges were found.",
                    "#ffaa00"
                );

                return;
            }

            log(
                `Found ${targets.length} matching badge(s).`,
                "#00ff66"
            );

            // =================================================
            // DELETE
            // =================================================

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
                    `Deleting ${badge.name} (${badge.id})...`,
                    "#ffaa00"
                );

                try {

                    const response =
                        await deleteBadge(
                            badge.id
                        );

                    if (
                        response.ok
                    ) {

                        log(
                            `Deleted: ${badge.name}`,
                            "#00ff66"
                        );

                    } else {

                        let errorText =
                            "";

                        try {
                            errorText =
                                await response.text();
                        } catch {}

                        log(
                            `FAILED: ${badge.name} (${response.status})`,
                            "#ff4444"
                        );

                        if (
                            errorText
                        ) {

                            console.warn(
                                "[Badge Remover] Roblox response:",
                                errorText
                            );
                        }
                    }

                } catch (
                    error
                ) {

                    console.error(
                        "[Badge Remover] Delete error:",
                        error
                    );

                    log(
                        `ERROR: ${badge.name}`,
                        "#ff4444"
                    );
                }

                // Delay between deletes.
                await new Promise(
                    resolve =>
                        setTimeout(
                            resolve,
                            config.settings.requestDelay
                        )
                );
            }

            // =================================================
            // DONE
            // =================================================

            status.textContent =
                "Finished";

            log(
                "Scan and deletion completed.",
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
                "#ff4444"
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

    // =========================================================
    // BUTTON
    // =========================================================

    scanButton.onclick =
        scanBadges;

    // =========================================================
    // AUTOMATIC SCAN
    // =========================================================

    if (
        config.settings.autoScan
    ) {

        // Wait a little for Roblox to finish
        // loading its page/API state.
        setTimeout(
            scanBadges,
            1000
        );
    }

})();
