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
    };

    function timeAgo(dateStr) {
        const diff = Date.now() - new Date(dateStr).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 60) return `${mins}m ago`;
        const hrs = Math.floor(mins / 60);
        if (hrs < 24) return `${hrs}h ago`;
        const days = Math.floor(hrs / 24);
        return `${days}d ago`;
    }

    async function fetchGitHubActivity() {
        const feedEl = document.getElementById('gh-feed');
        if (!feedEl) return;

        try {
            const res = await fetch(API_URL);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const events = await res.json();

            if (!events.length) {
                feedEl.innerHTML = '<div class="gh-event"><span class="gh-event__type">NO DATA</span> No recent activity detected.</div>';
                return;
            }

            feedEl.innerHTML = events.slice(0, 8).map(event => {
                const type = EVENT_LABELS[event.type] || event.type.replace('Event', '').toUpperCase();
                const repo = event.repo?.name?.split('/')[1] || event.repo?.name || 'unknown';
                const time = timeAgo(event.created_at);

                let detail = '';
                if (event.type === 'PushEvent') {
                    const commits = event.payload?.commits?.length || 0;
                    detail = ` — ${commits} commit${commits !== 1 ? 's' : ''}`;
                }

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
