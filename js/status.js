/* ============================================================
   LIVE STATUS — GitHub API + System Dashboard
   ============================================================ */

(function () {
    'use strict';

    const GITHUB_USER = 'Rizzy1857';
    const API_URL = `https://api.github.com/users/${GITHUB_USER}/events?per_page=10`;

    // --- Event type mappings ---
    const EVENT_LABELS = {
        PushEvent: 'PUSH',
        CreateEvent: 'CREATE',
        DeleteEvent: 'DELETE',
        PullRequestEvent: 'PR',
        IssuesEvent: 'ISSUE',
        WatchEvent: 'STAR',
        ForkEvent: 'FORK',
        ReleaseEvent: 'RELEASE',
        IssueCommentEvent: 'COMMENT',
        PullRequestReviewEvent: 'REVIEW',
        PublicEvent: 'PUBLIC',
    };

    function formatDate(dateStr) {
        const date = new Date(dateStr);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const mins = Math.floor(diff / 60000);

        if (mins < 1) return 'just now';
        if (mins < 60) return `${mins}m ago`;

        const hrs = Math.floor(mins / 60);
        if (hrs < 24) return `${hrs}h ago`;

        const days = Math.floor(hrs / 24);
        if (days < 7) return `${days}d ago`;

        // Show actual date for older events
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const day = date.getDate();
        const month = months[date.getMonth()];
        const year = date.getFullYear();
        const currentYear = now.getFullYear();

        return year === currentYear ? `${month} ${day}` : `${month} ${day}, ${year}`;
    }

    function getEventDetail(event) {
        const type = event.type;
        const payload = event.payload || {};

        switch (type) {
            case 'PushEvent': {
                // payload.commits may or may not exist in the API response
                const commits = payload.commits;
                if (commits && commits.length > 0) {
                    const count = payload.size || commits.length;
                    return ` — ${count} commit${count !== 1 ? 's' : ''}`;
                }
                // If no commits array, show branch
                const branch = (payload.ref || '').replace('refs/heads/', '');
                return branch ? ` → ${branch}` : '';
            }
            case 'CreateEvent':
                return payload.ref
                    ? ` — ${payload.ref_type || 'ref'}: ${payload.ref}`
                    : ` — ${payload.ref_type || 'repository'}`;
            case 'DeleteEvent':
                return payload.ref ? ` — ${payload.ref_type}: ${payload.ref}` : '';
            case 'PullRequestEvent':
                return payload.action ? ` — ${payload.action}` : '';
            case 'IssuesEvent':
                return payload.action ? ` — ${payload.action}` : '';
            case 'ForkEvent':
                return payload.forkee ? ` → ${payload.forkee.full_name}` : '';
            case 'PublicEvent':
                return ' — repo made public';
            default:
                return '';
        }
    }

    async function fetchGitHubActivity() {
        const feedEl = document.getElementById('gh-feed');
        if (!feedEl) return;

        try {
            const res = await fetch(API_URL);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const events = await res.json();

            if (!events.length) {
                feedEl.innerHTML = '<div class="gh-event"><span class="gh-event__type">[IDLE]</span> No recent activity.</div>';
                return;
            }

            feedEl.innerHTML = events.slice(0, 8).map(event => {
                const type = EVENT_LABELS[event.type] || event.type.replace('Event', '').toUpperCase();
                const repo = event.repo?.name?.split('/')[1] || event.repo?.name || 'unknown';
                const time = formatDate(event.created_at);
                const detail = getEventDetail(event);

                return `<div class="gh-event">
          <span class="gh-event__type">[${type}]</span>
          <span class="gh-event__repo">${repo}</span>${detail}
          <span class="gh-event__time">${time}</span>
        </div>`;
            }).join('');

        } catch (err) {
            feedEl.innerHTML = `<div class="gh-event"><span class="gh-event__type">[ERROR]</span> Feed unavailable. <span class="gh-event__time">${err.message}</span></div>`;
        }
    }

    function init() {
        fetchGitHubActivity();
        // Refresh every 5 minutes
        setInterval(fetchGitHubActivity, 5 * 60 * 1000);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
