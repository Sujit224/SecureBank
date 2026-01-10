export const styles = {
  // We use CSS variables for colors so they swap automatically
  
  // Layout
  container: {
    minHeight: '100vh',
    background: 'var(--bg-app)',
    color: 'var(--text-main)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    fontFamily: 'Inter, sans-serif'
  },
  
  // Cards
  card: {
    background: 'var(--bg-card)',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    marginBottom: '24px',
    border: '1px solid var(--border-color)',
    transition: 'background-color 0.3s ease'
  },
  gradientCard: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    borderRadius: '20px',
    padding: '32px',
    color: 'white', // Always white text on this gradient
    marginBottom: '24px',
    boxShadow: '0 10px 15px -3px rgba(102, 126, 234, 0.4)'
  },
  
  // Sidebar
  sidebarHeader: {
    padding: '24px',
    borderBottom: '1px solid var(--border-color)',
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  sidebarNav: {
    flex: 1,
    padding: '16px',
    overflowY: 'auto'
  },
  sidebarFooter: {
    padding: '16px',
    borderTop: '1px solid var(--border-color)'
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    marginBottom: '8px',
    borderRadius: '10px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    border: 'none',
    background: 'transparent',
    width: '100%',
    textAlign: 'left',
    fontSize: '15px',
    fontWeight: '500',
    color: 'var(--text-secondary)'
  },
  navItemActive: {
    background: 'var(--primary)', // Use primary color for active bg
    color: 'white'
  },
  
  // Form Elements
  input: {
    width: '100%',
    padding: '12px 16px',
    background: 'var(--input-bg)',
    color: 'var(--text-main)',
    border: '2px solid var(--border-color)',
    borderRadius: '10px',
    fontSize: '16px',
    boxSizing: 'border-box'
  },
  label: {
    display: 'block',
    fontSize: '14px',
    fontWeight: '500',
    color: 'var(--text-main)',
    marginBottom: '8px'
  },
  button: {
    width: '100%',
    padding: '14px',
    background: 'var(--primary)',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer'
  },
  
  // Table
  tableHeader: {
    background: 'var(--hover-bg)',
    borderBottom: '2px solid var(--border-color)'
  },
  th: {
    padding: '16px',
    textAlign: 'left',
    fontSize: '13px',
    fontWeight: '600',
    color: 'var(--text-secondary)',
    textTransform: 'uppercase'
  },
  td: {
    padding: '16px',
    borderBottom: '1px solid var(--border-color)',
    fontSize: '14px',
    color: 'var(--text-main)'
  },
  
  // Misc
  iconWrapper: {
    display: 'inline-flex',
    padding: '10px',
    background: 'var(--primary)',
    borderRadius: '12px',
    color: 'white'
  },
  badge: {
    padding: '4px 10px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600'
  },
  badgeSuccess: { background: 'rgba(72, 187, 120, 0.2)', color: '#48bb78' },
  
  // Profile
  userProfile: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '8px',
    background: 'var(--hover-bg)',
    borderRadius: '12px'
  },
  avatar: {
    width: '40px',
    height: '40px',
    background: 'var(--bg-card)',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  userName: { fontWeight: '600', color: 'var(--text-main)', margin: 0, fontSize: '14px' },
  userEmail: { fontSize: '12px', color: 'var(--text-secondary)', margin: 0 },
  
  btnLogout: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '10px',
    marginTop: '12px',
    color: '#fc8181',
    background: 'transparent',
    border: '1px solid #fc8181',
    borderRadius: '8px',
    cursor: 'pointer'
  }
};