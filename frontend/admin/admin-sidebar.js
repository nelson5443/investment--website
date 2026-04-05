function renderAdminSidebar(activePage) {
  const links = [
    { href: 'admin-dashboard.html', icon: '📊', label: 'Dashboard' },
    { href: 'users.html', icon: '👥', label: 'Users' },
    { href: 'transactions.html', icon: '💸', label: 'Transactions' },
    { href: 'plans.html', icon: '💼', label: 'Plans' },
    { href: 'investments.html', icon: '📈', label: 'Investments' },
    { href: 'chat.html', icon: '💬', label: 'Live Chat' },
  ];
  const user = getUser();
  document.getElementById('adminSidebar').innerHTML = `
    <div class="sidebar-logo"><a href="../index.html" class="logo">Nex<span>Trade</span></a><div style="font-size:0.7rem;color:var(--muted);margin-top:0.2rem;">Admin Panel</div></div>
    <nav class="sidebar-nav">
      ${links.map(l => `<a href="${l.href}" class="${l.label === activePage ? 'active' : ''}"><span class="icon">${l.icon}</span> ${l.label}</a>`).join('')}
    </nav>
    <div class="sidebar-footer">
      <div class="sidebar-user">
        <div class="avatar">${user?.fullName?.charAt(0).toUpperCase() || 'A'}</div>
        <div>
          <div style="font-size:0.85rem;font-weight:600;">${user?.fullName || 'Admin'}</div>
          <div style="font-size:0.75rem;color:var(--muted);">Administrator</div>
        </div>
      </div>
      <button class="btn btn-danger btn-block" onclick="logout()">Logout</button>
    </div>`;
}
