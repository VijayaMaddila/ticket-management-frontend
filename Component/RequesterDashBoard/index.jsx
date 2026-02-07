import React, { useEffect, useMemo, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./index.css";

const RequesterDashboard = () => {
	const navigate = useNavigate();
	const token = localStorage.getItem("token");
	const user = JSON.parse(localStorage.getItem("user") || "{}");
	const role = user?.role?.toLowerCase() || "";

	const [tickets, setTickets] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [search, setSearch] = useState("");
	const [debouncedSearch, setDebouncedSearch] = useState("");
	const [status, setStatus] = useState("");
	const [priority, setPriority] = useState("");
	const [requestType, setRequestType] = useState("");

	const [comments, setComments] = useState([]);
	const [showCommentsDrawer, setShowCommentsDrawer] = useState(false);
	const [currentTicketId, setCurrentTicketId] = useState(null);
	const [newComment, setNewComment] = useState("");
	const drawerBodyRef = useRef(null);

	const [showCreateTicketModal, setShowCreateTicketModal] = useState(false);
	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [ticketRequestType, setTicketRequestType] = useState("ACCESS");
	const [ticketPriority, setTicketPriority] = useState("LOW");
	const [requestedDataset, setRequestedDataset] = useState("");
	const [dueDate, setDueDate] = useState("");
	const [success, setSuccess] = useState("");

	const [history, setHistory] = useState([]);
	const [showHistoryModal, setShowHistoryModal] = useState(false);

	// Fetch tickets
	useEffect(() => {
		if (!token) return navigate("/login", { replace: true });

		const fetchTickets = async () => {
			try {
				const res = await fetch("http://localhost:8080/api/tickets", {
					headers: { Authorization: `Bearer ${token}` },
				});
				if (!res.ok) throw new Error("Unable to load tickets");
				const data = await res.json();
				const visibleTickets = role === "requester"
					? data.filter(t => t.requester?.id === user.id)
					: data;
				setTickets(visibleTickets);
			} catch (err) {
				setError(err.message);
			} finally {
				setLoading(false);
			}
		};
		fetchTickets();
	}, [token, navigate, role, user.id]);


	useEffect(() => {
		const t = setTimeout(() => setDebouncedSearch(search.trim()), 300);
		return () => clearTimeout(t);
	}, [search]);

	// Filter tickets
	const filteredTickets = useMemo(() =>
		tickets.filter(t => {
			const matchSearch = !debouncedSearch || t.id?.toString().includes(debouncedSearch) || t.title?.toLowerCase().includes(debouncedSearch.toLowerCase());
			const matchStatus = !status || t.status?.toLowerCase() === status.toLowerCase();
			const matchPriority = !priority || t.priority?.toLowerCase() === priority.toLowerCase();
			const matchRequestType = !requestType || t.request_type?.toLowerCase() === requestType.toLowerCase();
			return matchSearch && matchStatus && matchPriority && matchRequestType;
		}),
		[tickets, debouncedSearch, status, priority, requestType]
	);

	const statuses = [...new Set(tickets.map(t => t.status).filter(Boolean))];
	const priorities = [...new Set(tickets.map(t => t.priority).filter(Boolean))];
	const requestTypes = [...new Set(tickets.map(t => t.requestType).filter(Boolean))];

	// Comment Handlers
	const handleViewComments = async (ticketId) => {
		try {
			const res = await fetch(`http://localhost:8080/api/comments/ticket/${ticketId}`, 
			{ headers: { Authorization: `Bearer ${token}` }});
			if (!res.ok) throw new Error("Failed to load comments");
			setComments(await res.json());
			setCurrentTicketId(ticketId);
			setShowCommentsDrawer(true);
		} catch (err) { setError(err.message); }
	};

	const handleAddComment = async () => {
		if (!newComment.trim()) return;
		try {
			const res = await fetch(`http://localhost:8080/api/comments/ticket/${currentTicketId}`, {
				method: "POST",
				headers: { "Content-Type": "application/json", 
					Authorization: `Bearer ${token}` },
				body: JSON.stringify(
					{ comment: newComment, 
					user: { id: user.id } }),
			});
			if (!res.ok) throw new Error("Failed to add comment");
			const addedComment = await res.json();
			setComments(prev => [...prev, addedComment]);
			setNewComment("");
		} catch (err) { setError(err.message); }
	};

	
	useEffect(() => {
		if (!showCommentsDrawer) return;
		const el = drawerBodyRef.current;
		if (!el) return;
		setTimeout(() => { el.scrollTop = el.scrollHeight; }, 50);
	}, [showCommentsDrawer, comments]);

	const handleCreateTicket = async () => {
  if (!title.trim() || !description.trim()) {
    setError('Please provide title and description');
    setTimeout(() => setError(''), 3000);
    return;
  }

  try {
    const res = await fetch("http://localhost:8080/api/tickets", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        title,
        description,
        requestType: ticketRequestType || "ACCESS",
        priority: ticketPriority || "LOW",          
        requestedDataset,
        dueDate,
        requester: { id: user.id,email:user.email },
      }),
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || 'Failed to create ticket');
    }

    const newTicket = await res.json();
    setTickets(prev => [newTicket, ...prev]);
    setSuccess('Ticket created successfully');

    
    setTitle('');
    setDescription('');
    setRequestedDataset('');
    setDueDate('');
    setTicketRequestType('ACCESS');
    setTicketPriority('LOW');

    setTimeout(() => {
      setSuccess('');
      setShowCreateTicketModal(false);
    }, 900);

  } catch (err) {
    setError(err.message);
    setTimeout(() => setError(''), 3000);
  }
};


	
	const handleViewHistory = async (ticketId) => {
		try {
			const res = await fetch(`http://localhost:8080/api/tickets/audit/${ticketId}`, 
				{ headers: { Authorization: `Bearer ${token}` } });
			if (!res.ok) throw new Error("Failed to load history");
			setHistory(await res.json());
			setShowHistoryModal(true);
		} catch (err) { setError(err.message); }
	};

	if (loading) return <p className="center-text">Loading tickets…</p>;

	return (
		<div className="layout">
			<div className="main-content">
				<div className="dashboard-content">
					<header className="dashboard-header">
						<h2 className="dashboard-title">My Tickets 
							<span className="result-count">({filteredTickets.length})</span></h2>
						<button className="create-ticket-btn" 
						onClick={() => setShowCreateTicketModal(true)}>Create Ticket</button>
					</header>
					{error && <p className="center-text error">{error}</p>}

					{/* Filters */}
					<div className="filters">
						<div className="search-wrapper">
							<input className="search-input" 
							placeholder="Search" 
							value={search} 
							onChange={e => setSearch(e.target.value)} />
							{search && <button className="clear-btn" 
							onClick={() => setSearch("")} 
							aria-label="Clear search">✕</button>}
						</div>
						<select value={status} onChange={e => setStatus(e.target.value)}>
							<option value="">All Status</option>
							{statuses.map(s => <option key={s}>{s}</option>)}
						</select>
						<select value={priority} onChange={e => setPriority(e.target.value)}>
							<option value="">All Priority</option>
							{priorities.map(p => <option key={p}>{p}</option>)}
						</select>
						<select value={requestType} onChange={e => setRequestType(e.target.value)}>
							<option value="">All Types</option>
							{requestTypes.map(r => <option key={r}>{r}</option>)}
						</select>
					</div>

					{/* Ticket Cards */}
					<div className="cards-grid">
						{filteredTickets.length === 0 ? <p>No tickets found</p> :
							filteredTickets.map(ticket => (
								<div key={ticket.id} className="ticket-card">
									<h3>Problem: {ticket.title}</h3>
									<p><strong>ID:</strong> #{ticket.id}</p>
									<p><strong>Status: </strong>
										<span className={`badge status ${ticket.status?.toLowerCase()}`}>{ticket.status} </span>
										</p>
										<p><strong>Priority: </strong>
										<span className={`badge priority ${ticket.priority?.toLowerCase()}`}>{ticket.priority}</span>
									</p>
									<p><strong>Type:</strong> {ticket.requestType}</p>
									<p><strong>Assigned To:</strong> {ticket.assignedTo?.name || "—"}</p>
									<p><strong>Created:</strong> {new Date(ticket.createdAt).toLocaleString()}</p>
									<p><strong>Due Date:</strong> {new Date(ticket.dueDate).toLocaleString()}</p>
									<div className="card-footer">
										<button className="view-comments-btn" onClick={() => handleViewComments(ticket.id)}>Comments</button>
										<button className="view-history-btn" onClick={() => handleViewHistory(ticket.id)}>History</button>
									</div>
								</div>
							))
						}
					</div>
				</div>

				{/* Comments  */}
				{showCommentsDrawer && (
					<div className={`comments-drawer ${showCommentsDrawer ? 'open' : ''}`}>
						<div className="drawer-body" ref={drawerBodyRef}>
							<div className="drawer-header">
								<h3>Comments</h3>
								<button className="close-btn" onClick={() => setShowCommentsDrawer(false)}>✕</button>
							</div>
							{comments.length === 0 ? (
								<p>No comments yet</p>
							) : (
								<div className="comments-list">
									{comments.map(c => {
										const outgoing = c.user?.id === user.id;
										const initials = (c.user?.name || "U").split(" ").map(s => s[0]).slice(0,2).join("").toUpperCase();
										return (
											<div key={c.id} className={`comment-row ${outgoing ? 'outgoing' : 'incoming'}`}>
												<div className="avatar" aria-hidden>{initials}</div>
												<div style={{display:'flex',flexDirection:'column',alignItems: outgoing ? 'flex-end' : 'flex-start'}}>
													<div className="meta-left">
														<div className="meta-name">{c.user?.name || 'User'}</div>
														<div className="meta-role">{c.user?.role}</div>
													</div>
													<div className={`bubble ${outgoing ? 'requester' : 'datamember'}`}>
														<div style={{fontSize:14, color:'#0f172a'}}>{c.comment}</div>
														<div className="meta-time" style={{marginTop:8, textAlign: outgoing ? 'right' : 'left', fontSize:11, color:'#94a3b8'}}>{new Date(c.createdAt).toLocaleString()}</div>
													</div>
												</div>
											</div>
										);
									})}
								</div>
							)}
							<div className="drawer-footer">
								<div className="chat-input">
									<textarea value={newComment} 
									placeholder="Write a comment..." 
									onChange={e => setNewComment(e.target.value)} 
									onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) 
									{ e.preventDefault(); handleAddComment(); } }} />
								</div>
								<button className="chat-send" 
								onClick={handleAddComment} 
								disabled={!newComment.trim()}>Send</button>
							</div>
						</div>
					</div>
				)}

				{/* History  */}
				{showHistoryModal && (
					<div className="history-modal-overlay" onClick={() => setShowHistoryModal(false)}>
						<div className="history-modal" onClick={e => e.stopPropagation()}>
							<div className="modal-header">
								<h3>Ticket History</h3>
								<button className="close-btn" onClick={() => setShowHistoryModal(false)}>✕</button>
							</div>
							<div className="modal-body">
								{history.length === 0 ? <p>No history</p> :
									<table className="history-table">
										<thead>
											<tr>
												<th>#</th>
												<th>Action</th>
												<th>Old</th>
												<th>New</th>
												<th>By</th>
												<th>Date</th>
											</tr>
										</thead>
										<tbody>
											{history.map((h, i) => (
												<tr key={h.id}>
													<td>{i+1}</td>
													<td>{h.action}</td>
													<td>{h.oldValue || "—"}</td>
													<td>{h.newValue || "—"}</td>
													<td>{h.updatedBy || "System"}</td>
													<td>{new Date(h.timestamp).toLocaleString()}</td>
												</tr>
											))}
										</tbody>
									</table>
								}
							</div>
						</div>
					</div>
				)}
				
			

				
				
	{showCreateTicketModal && (
    <div className="create-ticket-drawer-overlay" onClick={() => setShowCreateTicketModal(false)}>
    <div className="create-ticket-drawer" onClick={e => e.stopPropagation()}>
      <div className="drawer-header">
        <h3>Create Ticket</h3>
        <button className="close-btn" onClick={() => setShowCreateTicketModal(false)}>✕</button>
      </div>
      <div className="drawer-body">
        {success && <div className="success">{success}</div>}
        {error && <div className="error">{error}</div>}

        <label>Title</label>
        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Issue title" />

        <label>Description</label>
        <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Describe the issue" />

        <div style={{ display: 'flex', gap: 10 }}>
          <select value={ticketRequestType} onChange={e => setTicketRequestType(e.target.value)}>
            <option value="ACCESS">ACCESS</option>
            <option value="ISSUE">ISSUE</option>
          </select>

          {/* Priority select */}
          <select value={ticketPriority} onChange={e => setTicketPriority(e.target.value)}>
            <option value="LOW">LOW</option>
            <option value="MEDIUM">MEDIUM</option>
            <option value="HIGH">HIGH</option>
          </select>
        </div>

        <label>Requested Dataset</label>
        <input value={requestedDataset} onChange={e => setRequestedDataset(e.target.value)} placeholder="Dataset name" />

        <label>Due Date</label>
        <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />
      </div>

      <div className="drawer-footer">
        <div className="drawer-buttons">
          <button className="btn-secondary" onClick={() => setShowCreateTicketModal(false)}>Cancel</button>
          <button className="btn-primary" onClick={handleCreateTicket} disabled={!title.trim() || !description.trim()}>Create</button>
        </div>
      </div>
    </div>
  </div>
)}
</div>
</div>
	);
};

export default RequesterDashboard;
