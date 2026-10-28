import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { useRequests } from '../useRequests';

function readSeen(key: string): number[] {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

// The "הודעות" link in the top menu. The red number counts only requests the user has not seen yet.
// While the user is on the messages page, every request that is there is saved as seen.
// The saved list is read on every render, so the number is right as soon as the user leaves the page.
function MessagesLink() {
  const { user } = useAuth();
  const requests = useRequests();
  const location = useLocation();
  const storageKey = `seen-requests-${user?.id}`;

  const onMessagesPage = location.pathname === '/messages';
  const ids = (requests.data ?? []).map((request) => request.request_id);
  const idsKey = ids.join(',');

  useEffect(() => {
    if (!onMessagesPage || idsKey === '') return;
    const current = idsKey.split(',').map(Number);
    const all = [...new Set([...readSeen(storageKey), ...current])];
    try {
      localStorage.setItem(storageKey, JSON.stringify(all));
    } catch {
      // Saving is only a convenience; without it the number simply stays.
    }
  }, [onMessagesPage, idsKey, storageKey]);

  const seen = readSeen(storageKey);
  const unseenCount = onMessagesPage ? 0 : ids.filter((id) => !seen.includes(id)).length;

  return (
    <Link to="/messages">
      הודעות
      {unseenCount > 0 && <span className="nav-badge">{unseenCount}</span>}
    </Link>
  );
}

export default MessagesLink;
