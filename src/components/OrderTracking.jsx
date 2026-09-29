import React, { useState, useEffect, useRef } from 'react';
import './OrderTracking.css';

const OrderTracking = ({ request, updateRequest, user }) => {
  if (!request) return null;

  const { id, status, price, type, date, adminNote, customerApproval } = request;
  const messagesList = request.messages || [];
  const [typedMessage, setTypedMessage] = useState('');
  const chatMessagesRef = useRef(null);

  useEffect(() => {
    if (chatMessagesRef.current) {
      const container = chatMessagesRef.current;
      setTimeout(() => {
        container.scrollTop = container.scrollHeight;
      }, 50);
    }
  }, [messagesList]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!typedMessage.trim()) return;

    const newMessage = {
      sender: user ? user.username : 'Customer',
      text: typedMessage.trim(),
      timestamp: new Date().toISOString()
    };

    if (updateRequest) {
      updateRequest({
        ...request,
        messages: [...messagesList, newMessage]
      });
      setTypedMessage('');
    }
  };

  const handleApprove = () => {
    if (updateRequest) {
      updateRequest({
        ...request,
        customerApproval: 'Approved',
        status: 'In Progress'
      });
      alert("Thank you! You have confirmed the quote. The artist will start working on your custom sketch soon.");
    }
  };

  const handleDecline = () => {
    if (window.confirm("Are you sure you want to decline this quote? This will cancel your commission request.")) {
      if (updateRequest) {
        updateRequest({
          ...request,
          customerApproval: 'Declined',
          status: 'Rejected',
          adminNote: adminNote ? `${adminNote} | Note: Customer declined this quote.` : 'Customer declined this quote.'
        });
        alert("Your request has been canceled successfully.");
      }
    }
  };

  if (status === 'Rejected') {
    return (
      <div className="order-rejected-card glass">
        <span className="rejected-icon">✉️</span>
        <h3 className="serif text-red">
          {customerApproval === 'Declined' ? 'Request Canceled' : 'Request Declined'}
        </h3>
        {adminNote && (
          <div className="admin-note-callout decline mb-1">
            <p className="note-title">{customerApproval === 'Declined' ? 'Cancel Log' : 'Artist Feedback'}</p>
            <p className="note-text">"{adminNote}"</p>
          </div>
        )}
        <p className="text-dim">
          {customerApproval === 'Declined' 
            ? 'This request was canceled because you declined the quoted price.' 
            : 'Unfortunately, the artist reviewed your reference photo and was unable to accept this commission request. This is typically because the image resolution is too low, lighting is insufficient, or details are unclear.'}
        </p>
        <p className="text-gold">You are welcome to submit a new request using a different, high-quality reference photo!</p>
      </div>
    );
  }

  // 4 key client-facing steps
  const stages = [
    { label: "Submitted", desc: `Received on ${date || 'N/A'}` },
    { 
      label: "Price Quote", 
      desc: customerApproval === 'Approved' 
        ? `Approved at ₹${price}` 
        : customerApproval === 'Declined'
        ? "Quote declined"
        : status === 'Accepted'
        ? `Quoted ₹${price} - Awaiting your approval` 
        : "Awaiting artist review" 
    },
    { label: "In Progress", desc: "Artist is sketching your portrait" },
    { label: "Completed", desc: "Artwork completed and ready!" }
  ];

  // Determine current stage index
  let currentStageIndex = 0;
  if (status === 'Pending') {
    currentStageIndex = 0;
  } else if (status === 'Accepted') {
    currentStageIndex = 1;
  } else if (status === 'In Progress') {
    currentStageIndex = 2;
  } else if (status === 'Completed') {
    currentStageIndex = 3;
  }

  return (
    <div className="tracking-container glass">
      {adminNote && (
        <div className="admin-note-callout">
          <p className="note-title">✉️ Message from Artist</p>
          <p className="note-text">"{adminNote}"</p>
        </div>
      )}

      {/* Quote Approval Decision Interface */}
      {status === 'Accepted' && customerApproval !== 'Approved' && customerApproval !== 'Declined' && (
        <div className="quote-approval-panel glass mb-2">
          <h4 className="serif approval-title">Confirm Custom Price Quote</h4>
          <p className="approval-text">
            Based on the details and complexity of your reference photo, the artist has quoted a final price of <strong className="text-gold">₹{price}</strong>.
            Please confirm if you wish to proceed with this custom commission.
          </p>
          <div className="approval-actions">
            <button className="btn-approve-quote" onClick={handleApprove}>Confirm & Proceed</button>
            <button className="btn-decline-quote" onClick={handleDecline}>Decline Quote</button>
          </div>
        </div>
      )}

      <div className="order-summary">
        <div>
          <p className="label">Order ID</p>
          <p className="value">#{id}</p>
        </div>
        <div>
          <p className="label">Portrait Type</p>
          <p className="value">{type}</p>
        </div>
        <div>
          <p className="label">Price</p>
          <p className="value text-gold">₹{price || 'Calculating...'}</p>
        </div>
      </div>
      
      <div className="status-flow">
        {stages.map((stage, index) => {
          const isCompleted = index <= currentStageIndex;
          const isCurrent = index === currentStageIndex;
          return (
            <div 
              key={stage.label} 
              className={`status-item ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}`}
            >
              <div className="status-dot"></div>
              <div className="status-info-box">
                <div className="status-label">{stage.label}</div>
                <div className="status-desc">{stage.desc}</div>
              </div>
              {index < stages.length - 1 && <div className="status-line"></div>}
            </div>
          );
        })}
      </div>

      {/* Discussion Chat Section */}
      <div className="order-chat-section">
        <h4 className="chat-title">💬 Order Discussion</h4>
        <div className="chat-box">
          <div className="chat-messages" ref={chatMessagesRef}>
            {messagesList.length > 0 ? (
              messagesList.map((msg, index) => {
                const isSelf = user && msg.sender === user.username;
                const formattedTime = new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                return (
                  <div key={index} className={`chat-message ${isSelf ? 'self' : 'other'}`}>
                    <div className="message-meta">
                      <span className="message-sender">{msg.sender}</span>
                      <span className="message-time">{formattedTime}</span>
                    </div>
                    <div className="chat-bubble">
                      {msg.text}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="chat-empty-state">
                <span>💬</span>
                <p>No messages yet. Ask the artist about details or pricing!</p>
              </div>
            )}
          </div>
          <form className="chat-input-area" onSubmit={handleSendMessage}>
            <textarea
              placeholder="Type a message to the artist..."
              value={typedMessage}
              onChange={(e) => setTypedMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(e);
                }
              }}
            />
            <button type="submit" className="btn-send-message" disabled={!typedMessage.trim()}>
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default OrderTracking;
