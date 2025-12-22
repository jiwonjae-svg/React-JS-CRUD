import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

class SocketService {
  constructor() {
    this.socket = null;
    this.connected = false;
    this.listeners = new Map();
  }

  // Socket.IO 연결
  connect() {
    if (this.socket?.connected) {
      return this.socket;
    }

    this.socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    });

    this.socket.on('connect', () => {
      console.log('✅ Socket.IO 연결됨:', this.socket.id);
      this.connected = true;
    });

    this.socket.on('disconnect', () => {
      console.log('❌ Socket.IO 연결 해제');
      this.connected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket.IO 연결 오류:', error);
    });

    return this.socket;
  }

  // 연결 해제
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
      this.listeners.clear();
    }
  }

  // 게시판 입장
  joinBoard(boardId) {
    if (!this.socket) this.connect();
    this.socket.emit('join-board', boardId);
    console.log(`📌 ${boardId} 게시판 입장`);
  }

  // 게시판 퇴장
  leaveBoard(boardId) {
    if (this.socket) {
      this.socket.emit('leave-board', boardId);
      console.log(`📤 ${boardId} 게시판 퇴장`);
    }
  }

  // 새 게시글 알림
  notifyNewPost(postData) {
    if (this.socket) {
      this.socket.emit('new-post', postData);
    }
  }

  // 새 댓글 알림
  notifyNewComment(commentData) {
    if (this.socket) {
      this.socket.emit('new-comment', commentData);
    }
  }

  // 게시글 생성 이벤트 수신
  onPostCreated(callback) {
    if (!this.socket) this.connect();
    
    this.socket.on('post-created', callback);
    this.listeners.set('post-created', callback);
  }

  // 댓글 추가 이벤트 수신
  onCommentAdded(callback) {
    if (!this.socket) this.connect();
    
    this.socket.on('comment-added', callback);
    this.listeners.set('comment-added', callback);
  }

  // 이벤트 리스너 제거
  off(eventName) {
    if (this.socket && this.listeners.has(eventName)) {
      const callback = this.listeners.get(eventName);
      this.socket.off(eventName, callback);
      this.listeners.delete(eventName);
    }
  }

  // 모든 이벤트 리스너 제거
  removeAllListeners() {
    if (this.socket) {
      this.listeners.forEach((callback, eventName) => {
        this.socket.off(eventName, callback);
      });
      this.listeners.clear();
    }
  }

  // 연결 상태 확인
  isConnected() {
    return this.connected && this.socket?.connected;
  }

  // Socket 인스턴스 가져오기
  getSocket() {
    if (!this.socket) this.connect();
    return this.socket;
  }
}

// 싱글톤 인스턴스
const socketService = new SocketService();

export default socketService;
