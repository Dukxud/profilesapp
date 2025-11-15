export function TabBar({ activeTab, onSelect }) {
  return (
    <div
      role="tablist"
      aria-label="Profile sections"
      style={{
        display: 'inline-flex',
        border: '1px solid #222',
        borderRadius: 9999,
        overflow: 'hidden',
        marginBottom: 12,
      }}
    >
      {['profile', 'uploads'].map((tab, index) => (
        <button
          key={tab}
          role="tab"
          aria-selected={activeTab === tab}
          onClick={() => onSelect(tab)}
          style={{
            padding: '8px 16px',
            fontWeight: 700,
            background: activeTab === tab ? '#90d6e9' : '#f4f4f5',
            color: '#111',
            cursor: 'pointer',
            border: 'none',
            borderLeft: index === 0 ? 'none' : '1px solid #222',
            outline: 'none',
          }}
        >
          {tab === 'profile' ? 'Profile' : 'Uploads'}
        </button>
      ))}
    </div>
  );
}
