// ==UserScript==
// @name         Libreddit Subreddit Hider
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  Hide posts from specific subreddits on multiple Libreddit/Redlib instances
// @author       ChatMonkey
// @match        *://*/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // ===== CONFIGURATION =====
    const libredditInstances = [
        'redlib.perennialte.ch',
        'libreddit.perennialte.ch',
        'rl.bloat.cat',
        'l.opnxng.com',
        'redlib.catsarch.com'
    ];

    // Exact subreddit names
    const blockedSubreddits = [
        'meirl',
        'me_irl',
        'mildlyinfuriating',
        'guysbeingdudes',
        'justguysbeingdudes',
        'tiktokcringe',
        'cringetiktoks',
        'sipstea',
        'tattooadvice',
        'stupidfood',
        'antimeme',
        'whenthe',
        'whatcouldgowrong',
        'losercity',
        'girldinnerdiaries',
        'justgalsbeingchicks',
        'justgirlsbeingchicks',
        'tiktokcringe',
        'nbamemes',
        'formula1',
        'warframe',
        'dhurandhar',
        'deltarune',
        'lego',
        'wellthatsucks',
        'coys',
        'hololive',
        'realmadrid',
        'ich_iel',
        'naruto',
        'overwatch',
        'antiwork'
    ];

    // Partial matches (hide if subreddit name contains any of these)
    const blockedSubredditKeywords = [
        'india',
        'ukraine',
        'russia',
        'egg',
        'okbuddy'
        
        // Examples:
        // "india" hides: indiamemes, teenindia, indiadiscussion
        // "tiktok" hides: tiktokcringe, tiktokhelp
        // "meme" hides: memes, animememes, indiamemes
    ];

    // Only run on configured domains
    const currentDomain = window.location.hostname;
    if (!libredditInstances.includes(currentDomain)) {
        console.log("[SubHider] Not running on:", currentDomain);
        return;
    }

    function isBlockedSubreddit(subName) {
        // Exact match
        if (blockedSubreddits.includes(subName)) {
            return true;
        }

        // Partial match
        return blockedSubredditKeywords.some(keyword =>
            subName.includes(keyword)
        );
    }

    function hideBlockedPosts() {
        const posts = document.querySelectorAll(".post");

        posts.forEach(post => {
            const subredditLink = post.querySelector('a[href^="/r/"]');

            if (subredditLink) {
                const subName = subredditLink.href
                    .split("/r/")[1]
                    .split("/")[0]
                    .toLowerCase();

                if (isBlockedSubreddit(subName)) {
                    post.style.display = "none";
                    console.log(`[SubHider] Hiding post from r/${subName}`);
                }
            }
        });
    }

    // Observe for new posts being added
    const observer = new MutationObserver(hideBlockedPosts);
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    // Initial run
    hideBlockedPosts();
})();